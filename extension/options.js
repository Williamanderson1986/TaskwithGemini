/*
 * options.js
 * Loads saved settings into the form, lets the user edit them, and persists
 * via TikGemSettings.save. Also pulls the user's TikGem lists (from an open
 * TikGem tab, falling back to a cached copy) to populate the target-list menu.
 */
var S = window.TikGemSettings;

var el = {
  tags: document.getElementById("defTags"),
  status: document.getElementById("defStatus"),
  context: document.getElementById("defContext"),
  due: document.getElementById("defDue"),
  dueDays: document.getElementById("defDueDays"),
  plusWrap: document.getElementById("plusWrap"),
  list: document.getElementById("defList"),
  refreshLists: document.getElementById("refreshLists"),
  closeTab: document.getElementById("closeTab"),
  save: document.getElementById("save"),
  reset: document.getElementById("reset"),
  status_: document.getElementById("status")
};

function setStatus(msg, kind) {
  el.status_.textContent = msg || "";
  el.status_.className = kind || "";
}

function togglePlus() {
  el.plusWrap.style.display = el.due.value === "plus" ? "flex" : "none";
}
el.due.addEventListener("change", togglePlus);

// ---- Populate the list dropdown ----
function renderLists(lists, selectedId) {
  // Always keep the built-in inbox option first.
  el.list.innerHTML = "";
  var optInbox = document.createElement("option");
  optInbox.value = "";
  optInbox.textContent = "All Tasks (inbox)";
  el.list.appendChild(optInbox);

  (lists || []).forEach(function (l) {
    if (!l || !l.id || l.id === "inbox") return; // inbox already shown
    var o = document.createElement("option");
    o.value = l.id;
    o.textContent = (l.icon ? l.icon + " " : "") + (l.name || l.id);
    el.list.appendChild(o);
  });

  // Restore selection; if the saved list is gone, keep it as a placeholder so
  // the user doesn't silently lose their choice.
  if (selectedId) {
    if (!Array.prototype.some.call(el.list.options, function (o) { return o.value === selectedId; })) {
      var miss = document.createElement("option");
      miss.value = selectedId;
      miss.textContent = selectedId + " (not found — open TikGem to refresh)";
      el.list.appendChild(miss);
    }
    el.list.value = selectedId;
  }
}

// Ask the worker to read lists from a live TikGem tab. Falls back to cache.
function loadLists(selectedId) {
  S.getCachedLists().then(function (cached) {
    if (cached && cached.length) renderLists(cached, selectedId);
    chrome.runtime.sendMessage({ type: "GET_TIKGEM_LISTS" }, function (res) {
      if (res && res.ok && Array.isArray(res.lists) && res.lists.length) {
        renderLists(res.lists, selectedId);
        S.cacheLists(res.lists);
      } else if (!cached || !cached.length) {
        renderLists([], selectedId);
      }
    });
  });
}

el.refreshLists.addEventListener("click", function () {
  setStatus("Refreshing lists from TikGem…", "");
  chrome.runtime.sendMessage({ type: "GET_TIKGEM_LISTS" }, function (res) {
    if (res && res.ok && Array.isArray(res.lists)) {
      renderLists(res.lists, el.list.value);
      S.cacheLists(res.lists);
      setStatus(res.lists.length ? "Lists updated." : "No lists found.", res.lists.length ? "ok" : "err");
    } else {
      setStatus("Open a TikGem tab first, then refresh.", "err");
    }
    setTimeout(function () { setStatus("", ""); }, 2500);
  });
});

// ---- Load saved settings into the form ----
S.load().then(function (s) {
  el.tags.value = (s.tags || []).join(", ");
  el.status.value = s.status || "";
  el.context.value = s.context || "";
  el.due.value = s.dueMode || "none";
  el.dueDays.value = (s.dueDays != null ? s.dueDays : 3);
  el.closeTab.checked = !!s.closeTab;
  togglePlus();
  loadLists(s.listId || "");
});

// ---- Save ----
el.save.addEventListener("click", function () {
  var days = parseInt(el.dueDays.value, 10);
  if (isNaN(days) || days < 0) days = 0;
  var settings = {
    tags: S.parseTags(el.tags.value),
    status: el.status.value,
    context: el.context.value.trim(),
    dueMode: el.due.value,
    dueDays: days,
    listId: el.list.value,
    closeTab: el.closeTab.checked
  };
  S.save(settings).then(function () {
    setStatus("Settings saved.", "ok");
    setTimeout(function () { setStatus("", ""); }, 2000);
  });
});

// ---- Reset ----
el.reset.addEventListener("click", function () {
  S.save(S.DEFAULTS).then(function () {
    el.tags.value = "";
    el.status.value = "";
    el.context.value = "";
    el.due.value = "none";
    el.dueDays.value = "3";
    el.closeTab.checked = false;
    el.list.value = "";
    togglePlus();
    setStatus("Reset to defaults.", "ok");
    setTimeout(function () { setStatus("", ""); }, 2000);
  });
});
