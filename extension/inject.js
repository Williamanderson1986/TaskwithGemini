/*
 * inject.js
 * Runs in the TikGem tab's MAIN world (so it can reach the page's own
 * window.tikgemQuickAdd hook, which is not visible from an isolated content
 * script). Receives { title, description, opts } as the injected argument.
 *
 * Strategy:
 *   1) Preferred — call window.tikgemQuickAdd(title, description, opts). Stable,
 *      documented API; persists and re-renders. Returns the new task id. The
 *      optional opts object carries the user's default tags/status/context/
 *      dueAt/listId from the extension options page.
 *   2) Fallback — if the hook is missing (older TikGem build), simulate the
 *      quick-add bar: set #task-input value + dispatch input + Enter keydown.
 *      (Defaults can't be applied in the keystroke fallback.)
 *
 * Returns: { ok, method, taskId, error }
 */
function injectIntoTikGem(payload) {
  try {
    var title = (payload && payload.title) || "";
    var description = (payload && payload.description) || "";
    var opts = (payload && payload.opts && typeof payload.opts === "object") ? payload.opts : {};

    // ---- Preferred: documented hook ----
    if (typeof window.tikgemQuickAdd === "function") {
      var id = window.tikgemQuickAdd(title, description, opts);
      if (id) return { ok: true, method: "hook", taskId: id, error: null };
      return { ok: false, method: "hook", taskId: null, error: "hook returned null" };
    }

    // ---- Fallback: simulate the quick-add input ----
    var input = document.getElementById("task-input");
    if (!input) {
      return { ok: false, method: "none", taskId: null, error: "no hook and no #task-input on screen" };
    }
    // Compose a single line for the input; append URL/description compactly.
    var line = title;
    if (description) line = line ? title + " — " + description : description;

    var setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    setter.call(input, line);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true
      })
    );
    return { ok: true, method: "keystroke", taskId: null, error: null };
  } catch (e) {
    return { ok: false, method: "error", taskId: null, error: String(e && e.message ? e.message : e) };
  }
}
