/*
 * readlists.js
 * Injected into a TikGem tab's MAIN world to read the user's task lists so the
 * options page can offer them as target-list choices.
 *
 * TikGem persists its state under the key 'cc.state.v1' via its own storage
 * wrappers; the live in-memory STATE.lists is the source of truth and is also
 * mirrored into persisted state. We prefer live STATE, then fall back to the
 * persisted copy via window.__storeGet.
 *
 * Returns: { ok, lists } where lists is [{ id, name, icon }].
 */
function readTikGemLists() {
  try {
    var lists = null;

    // Preferred: live application state.
    if (typeof window.STATE === "object" && window.STATE && Array.isArray(window.STATE.lists)) {
      lists = window.STATE.lists;
    }

    // Fallback: persisted state via the documented store getter.
    if (!lists && typeof window.__storeGet === "function") {
      var raw = window.__storeGet("cc.state.v1");
      var parsed = null;
      if (typeof raw === "string") {
        try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
      } else if (raw && typeof raw === "object") {
        parsed = raw;
      }
      if (parsed && Array.isArray(parsed.lists)) lists = parsed.lists;
    }

    if (!Array.isArray(lists)) return { ok: false, lists: [] };

    var out = lists.map(function (l) {
      return { id: l.id, name: l.name, icon: l.icon || "" };
    });
    return { ok: true, lists: out };
  } catch (e) {
    return { ok: false, lists: [], error: String(e && e.message ? e.message : e) };
  }
}
