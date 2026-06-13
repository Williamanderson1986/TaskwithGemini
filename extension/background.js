/*
 * background.js — MV3 service worker
 * Orchestrates the capture -> locate TikGem tab -> inject flow.
 *
 * Two entry points:
 *   - Right-click context menu ("Add page to TikGem") -> one-click capture+send.
 *   - Popup "Send to TikGem" button -> sends an already-captured (and possibly
 *     edited) payload via the SEND_TO_TIKGEM message.
 *
 * The popup also asks the worker to CAPTURE the active tab so it can show an
 * editable preview before sending.
 */

importScripts("settings.js", "capture.js", "inject.js", "readlists.js");

var TIKGEM_URL = "https://tikgem.pplx.app/";
var TIKGEM_MATCH = "https://tikgem.pplx.app/*";
var ALL_TASKS_HASH = "#/p/inbox/tasks"; // route slug is internal; label reads "All Tasks"

// ---- Context menu ----
chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "tikgem-add-page",
    title: "Add page to TikGem",
    contexts: ["page", "selection", "link"]
  });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId !== "tikgem-add-page" || !tab || !tab.id) return;
  var sourceTabId = tab.id;
  captureTab(sourceTabId).then(function (data) {
    if (!data) return notify("Capture failed", "Could not read this page.");
    // Right-click on a selection: prefer the selected text as the title.
    if (info.selectionText && info.selectionText.trim()) {
      data.title = info.selectionText.trim();
    }
    // Apply the user's saved defaults (tags/status/context/due/list/close-tab).
    TikGemSettings.load().then(function (settings) {
      var payload = buildPayload(data);
      payload.opts = TikGemSettings.buildOpts(settings);
      sendToTikGem(payload).then(function (res) {
        reportResult(res);
        if (res && res.ok && settings.closeTab) closeSourceTab(sourceTabId);
      });
    });
  });
});

// ---- Messages from popup ----
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg && msg.type === "CAPTURE_ACTIVE") {
    getActiveTab().then(function (tab) {
      if (!tab || !tab.id) return sendResponse({ ok: false, error: "no active tab" });
      captureTab(tab.id).then(function (data) {
        sendResponse({ ok: !!data, data: data || null });
      });
    });
    return true; // async
  }
  if (msg && msg.type === "SEND_TO_TIKGEM") {
    // The popup may pass its own opts (built from defaults + per-send edits) and
    // the source tab id so we can close it afterward when enabled.
    var payload = msg.payload || {};
    var sourceTabId = msg.sourceTabId;
    TikGemSettings.load().then(function (settings) {
      // If the popup didn't supply opts, fall back to the saved defaults.
      if (!payload.opts) payload.opts = TikGemSettings.buildOpts(settings);
      sendToTikGem(payload).then(function (res) {
        reportResult(res);
        if (res && res.ok && settings.closeTab && sourceTabId) closeSourceTab(sourceTabId);
        sendResponse(res);
      });
    });
    return true; // async
  }
  if (msg && msg.type === "GET_TIKGEM_LISTS") {
    getTikGemLists().then(function (res) { sendResponse(res); });
    return true; // async
  }
});

// ---- Capture: inject capture.js into the source tab ----
function captureTab(tabId) {
  return chrome.scripting
    .executeScript({ target: { tabId: tabId }, func: captureFromPage })
    .then(function (results) {
      return results && results[0] ? results[0].result : null;
    })
    .catch(function () {
      return null; // chrome:// pages, store pages, PDFs etc. are not injectable
    });
}

// ---- Build the task payload from captured data, with fallbacks ----
function buildPayload(data) {
  var title = (data.selection || data.title || "").trim();
  if (!title) title = (data.url || "Untitled page").trim();

  // Description = page description (or selection context) + the source URL,
  // so every task links back to the page (matching One-Click TickTick).
  var parts = [];
  if (data.description) parts.push(data.description);
  if (data.url) parts.push(data.url);
  var description = parts.join("\n\n").trim();

  return { title: title, description: description };
}

// ---- Locate or open a TikGem tab, then inject ----
function sendToTikGem(payload) {
  return chrome.tabs.query({ url: TIKGEM_MATCH }).then(function (tabs) {
    if (tabs && tabs.length) {
      return runInject(tabs[0].id, payload);
    }
    // No TikGem tab open — open one on the All Tasks route, wait, then inject.
    return chrome.tabs
      .create({ url: TIKGEM_URL + ALL_TASKS_HASH, active: false })
      .then(function (tab) {
        return waitForTab(tab.id).then(function () {
          return runInject(tab.id, payload);
        });
      });
  });
}

function runInject(tabId, payload) {
  return chrome.scripting
    .executeScript({
      target: { tabId: tabId },
      world: "MAIN", // required to reach window.tikgemQuickAdd
      func: injectIntoTikGem,
      args: [payload]
    })
    .then(function (results) {
      return results && results[0] ? results[0].result : { ok: false, error: "no result" };
    })
    .catch(function (e) {
      return { ok: false, error: String(e && e.message ? e.message : e) };
    });
}

// ---- Wait until a freshly created tab has finished loading ----
function waitForTab(tabId) {
  return new Promise(function (resolve) {
    function listener(id, info) {
      if (id === tabId && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        // Give the SPA a beat to mount its hook/input.
        setTimeout(resolve, 600);
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
    // Safety timeout in case the load event was missed.
    setTimeout(function () {
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    }, 6000);
  });
}

function getActiveTab() {
  return chrome.tabs
    .query({ active: true, currentWindow: true })
    .then(function (tabs) {
      return tabs && tabs[0] ? tabs[0] : null;
    });
}

// ---- Read the user's TikGem lists from an open TikGem tab (for the options
// page target-list menu). Does NOT open a tab if none exists — the options page
// falls back to a cached copy in that case. ----
function getTikGemLists() {
  return chrome.tabs.query({ url: TIKGEM_MATCH }).then(function (tabs) {
    if (!tabs || !tabs.length) return { ok: false, lists: [], error: "no TikGem tab open" };
    return chrome.scripting
      .executeScript({ target: { tabId: tabs[0].id }, world: "MAIN", func: readTikGemLists })
      .then(function (results) {
        var r = results && results[0] ? results[0].result : null;
        return r || { ok: false, lists: [] };
      })
      .catch(function (e) {
        return { ok: false, lists: [], error: String(e && e.message ? e.message : e) };
      });
  });
}

// ---- Close the source tab after a successful add (close-tab-after-adding) ----
function closeSourceTab(tabId) {
  try {
    // Never close a TikGem tab itself (it may be the target).
    chrome.tabs.get(tabId, function (t) {
      if (chrome.runtime.lastError || !t) return;
      if (t.url && t.url.indexOf("https://tikgem.pplx.app") === 0) return;
      chrome.tabs.remove(tabId);
    });
  } catch (e) {}
}

function reportResult(res) {
  if (res && res.ok) {
    notify("Sent to TikGem", res.method === "hook" ? "Task captured." : "Task added.");
  } else {
    notify("TikGem", (res && res.error) ? ("Could not add task: " + res.error) : "Could not add task.");
  }
}

// Lightweight feedback via the action badge (no notifications permission needed).
function notify(title, message) {
  try {
    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "#5a82ff" });
    setTimeout(function () { chrome.action.setBadgeText({ text: "" }); }, 1500);
  } catch (e) {}
  // eslint-disable-next-line no-console
  console.log("[TikGem]", title, message);
}
