/*
 * popup.js
 * Asks the service worker to capture the active tab, shows an editable
 * preview, and sends the (possibly edited) payload to TikGem on confirm.
 *
 * The user's saved defaults (tags/status/context/due/target list) are applied
 * to every send. The popup surfaces a short summary of the active defaults and
 * a link to the options page; per-field editing of defaults lives in options.
 */
var S = window.TikGemSettings;

var els = {
  loading: document.getElementById("loading"),
  form: document.getElementById("form"),
  title: document.getElementById("title"),
  desc: document.getElementById("desc"),
  send: document.getElementById("send"),
  cancel: document.getElementById("cancel"),
  status: document.getElementById("status"),
  defaults: document.getElementById("defaults"),
  openOptions: document.getElementById("openOptions")
};

var sourceTabId = null;     // the tab we captured from (for close-tab-after-adding)
var currentSettings = null; // loaded defaults

function setStatus(msg, kind) {
  els.status.textContent = msg || "";
  els.status.className = kind || "";
}

// Render a one-line summary of the active defaults so the user knows what will
// be applied without opening options.
function renderDefaultsSummary(s) {
  var bits = [];
  if (s.tags && s.tags.length) bits.push("#" + s.tags.join(" #"));
  if (s.status) bits.push(s.status);
  if (s.context) bits.push("@" + s.context);
  if (s.dueMode && s.dueMode !== "none") {
    bits.push(s.dueMode === "plus" ? ("due +" + s.dueDays + "d") : ("due " + s.dueMode));
  }
  if (s.listId) bits.push("list set");
  if (s.closeTab) bits.push("close tab");
  if (bits.length) {
    els.defaults.textContent = "Defaults: " + bits.join(" · ");
    els.defaults.style.display = "block";
  } else {
    els.defaults.style.display = "none";
  }
}

// Capture the active tab and remember its id.
function captureActive() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    sourceTabId = tabs && tabs[0] ? tabs[0].id : null;
  });
  chrome.runtime.sendMessage({ type: "CAPTURE_ACTIVE" }, function (res) {
    els.loading.style.display = "none";
    els.form.style.display = "block";

    if (!res || !res.ok || !res.data) {
      setStatus("Couldn't read this page — you can still type a task.", "err");
      els.title.focus();
      return;
    }

    var d = res.data;
    els.title.value = (d.selection || d.title || "").trim();

    var parts = [];
    if (d.description) parts.push(d.description);
    if (d.url) parts.push(d.url);
    els.desc.value = parts.join("\n\n").trim();

    if (d.usedFallback) setStatus("No meta description found — used page text.", "");
    els.title.focus();
    els.title.select();
  });
}

// 1. Load settings, then capture.
S.load().then(function (s) {
  currentSettings = s;
  renderDefaultsSummary(s);
  captureActive();
});

// 2. Send — apply saved defaults as opts and include the source tab id.
els.send.addEventListener("click", function () {
  var title = els.title.value.trim();
  var description = els.desc.value.trim();
  if (!title && !description) {
    setStatus("Add a title or description first.", "err");
    return;
  }
  els.send.disabled = true;
  setStatus("Sending…", "");
  var opts = S.buildOpts(currentSettings || S.DEFAULTS);
  chrome.runtime.sendMessage(
    {
      type: "SEND_TO_TIKGEM",
      payload: { title: title, description: description, opts: opts },
      sourceTabId: sourceTabId
    },
    function (res) {
      if (res && res.ok) {
        setStatus("Added to TikGem.", "ok");
        setTimeout(function () { window.close(); }, 700);
      } else {
        els.send.disabled = false;
        setStatus((res && res.error) ? ("Failed: " + res.error) : "Failed to add task.", "err");
      }
    }
  );
});

els.cancel.addEventListener("click", function () { window.close(); });

els.openOptions.addEventListener("click", function (e) {
  e.preventDefault();
  if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
  else window.open(chrome.runtime.getURL("options.html"));
});
