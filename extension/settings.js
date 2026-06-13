/*
 * settings.js — shared settings model for One-Click TikGem.
 *
 * Loaded by the service worker (via importScripts in background.js) and by the
 * options + popup pages (via <script>). Exposes everything on a single global
 * object `TikGemSettings` so it works in both a worker scope and a window scope.
 *
 * Settings are persisted in chrome.storage.sync so they roam with the user's
 * Chrome profile. The settings object shape:
 *   {
 *     tags:     string[]  // default tags, merged with inline #tags
 *     status:   string    // "" | "Next" | "Action Planned" | "Waiting For"
 *     context:  string    // "" or a context name (custom allowed)
 *     dueMode:  string     // "none" | "today" | "tomorrow" | "plus"
 *     dueDays:  number     // used when dueMode === "plus"
 *     listId:   string     // "" (inbox) or a TikGem list id
 *     closeTab: boolean    // close the source tab after a successful add
 *   }
 */
(function (root) {
  var STORAGE_KEY = "tikgemSettings";
  var CACHED_LISTS_KEY = "tikgemCachedLists";

  var DEFAULTS = {
    tags: [],
    status: "",
    context: "",
    dueMode: "none",
    dueDays: 3,
    listId: "",
    closeTab: false
  };

  // Parse a comma-separated tag string into a clean array.
  function parseTags(str) {
    if (Array.isArray(str)) return str.slice();
    if (!str) return [];
    return String(str)
      .split(",")
      .map(function (s) { return s.trim().replace(/^[#@]/, ""); })
      .filter(function (s) { return !!s; });
  }

  // Load settings (merged over defaults). Returns a Promise.
  function load() {
    return new Promise(function (resolve) {
      try {
        chrome.storage.sync.get(STORAGE_KEY, function (got) {
          var saved = (got && got[STORAGE_KEY]) || {};
          var merged = Object.assign({}, DEFAULTS, saved);
          merged.tags = parseTags(merged.tags);
          merged.dueDays = parseInt(merged.dueDays, 10);
          if (isNaN(merged.dueDays) || merged.dueDays < 0) merged.dueDays = DEFAULTS.dueDays;
          resolve(merged);
        });
      } catch (e) {
        resolve(Object.assign({}, DEFAULTS));
      }
    });
  }

  // Save a settings object. Returns a Promise.
  function save(settings) {
    var clean = Object.assign({}, DEFAULTS, settings);
    clean.tags = parseTags(clean.tags);
    return new Promise(function (resolve) {
      try {
        var obj = {};
        obj[STORAGE_KEY] = clean;
        chrome.storage.sync.set(obj, function () { resolve(clean); });
      } catch (e) {
        resolve(clean);
      }
    });
  }

  // Compute an ISO due date from the dueMode/dueDays settings, relative to now.
  // Times are set to local midday so the date lands cleanly on the intended day
  // regardless of timezone, matching how TikGem's seed data uses noon.
  function computeDueAt(settings) {
    if (!settings || !settings.dueMode || settings.dueMode === "none") return null;
    var d = new Date();
    if (settings.dueMode === "today") {
      // leave as today
    } else if (settings.dueMode === "tomorrow") {
      d.setDate(d.getDate() + 1);
    } else if (settings.dueMode === "plus") {
      var n = parseInt(settings.dueDays, 10);
      if (isNaN(n) || n < 0) n = 0;
      d.setDate(d.getDate() + n);
    } else {
      return null;
    }
    d.setHours(12, 0, 0, 0);
    return d.toISOString();
  }

  // Build the opts object passed to window.tikgemQuickAdd(title, desc, opts).
  // Only includes fields the user actually set so unset fields fall back to
  // TikGem's own defaults inside the hook.
  function buildOpts(settings) {
    var opts = {};
    if (settings.tags && settings.tags.length) opts.tags = settings.tags.slice();
    if (settings.status) opts.status = settings.status;
    if (settings.context && String(settings.context).trim()) opts.context = String(settings.context).trim();
    if (settings.listId) opts.listId = settings.listId;
    var due = computeDueAt(settings);
    if (due) opts.dueAt = due;
    return opts;
  }

  // Cache the lists read from a TikGem tab so the options page can show them
  // even when no TikGem tab is currently open.
  function cacheLists(lists) {
    return new Promise(function (resolve) {
      try {
        var obj = {};
        obj[CACHED_LISTS_KEY] = Array.isArray(lists) ? lists : [];
        chrome.storage.sync.set(obj, function () { resolve(obj[CACHED_LISTS_KEY]); });
      } catch (e) {
        resolve([]);
      }
    });
  }

  function getCachedLists() {
    return new Promise(function (resolve) {
      try {
        chrome.storage.sync.get(CACHED_LISTS_KEY, function (got) {
          resolve((got && got[CACHED_LISTS_KEY]) || []);
        });
      } catch (e) {
        resolve([]);
      }
    });
  }

  root.TikGemSettings = {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULTS: DEFAULTS,
    parseTags: parseTags,
    load: load,
    save: save,
    computeDueAt: computeDueAt,
    buildOpts: buildOpts,
    cacheLists: cacheLists,
    getCachedLists: getCachedLists
  };
})(typeof self !== "undefined" ? self : this);
