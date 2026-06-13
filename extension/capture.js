/*
 * capture.js
 * Injected into the SOURCE tab (the page the user is reading) to extract a
 * title, description, URL, and any selected text. Pure DOM reads — works in
 * the content-script isolated world, no page cooperation required.
 *
 * Exposed as a single function so background.js can inject it via
 * chrome.scripting.executeScript({ func: captureFromPage }).
 *
 * Returns: { title, description, url, selection, usedFallback }
 */
function captureFromPage() {
  function clean(s) {
    return (s || "").replace(/\s+/g, " ").trim();
  }

  // ---- Title ----
  // Prefer og:title, fall back to document.title, then the first <h1>.
  var ogTitle = document.querySelector('meta[property="og:title"]');
  var rawTitle =
    (ogTitle && ogTitle.content) ||
    document.title ||
    (document.querySelector("h1") ? document.querySelector("h1").innerText : "") ||
    "";
  var title = clean(rawTitle);
  // Strip a trailing " - Site Name" / " | Site Name" suffix when present and
  // the remaining title is still substantial.
  var stripped = title.replace(/\s[-|–—]\s[^-|–—]{1,40}$/, "");
  if (stripped.length >= 8) title = stripped;

  // ---- Selection (highest-value content if the user highlighted text) ----
  var selection = clean(window.getSelection ? String(window.getSelection()) : "");

  // ---- Description ----
  // Priority: meta description -> og:description -> twitter:description ->
  // first meaningful block of main/article text. Final fallback: empty.
  var usedFallback = false;
  function metaContent(sel) {
    var el = document.querySelector(sel);
    return el && el.content ? clean(el.content) : "";
  }
  var description =
    metaContent('meta[name="description"]') ||
    metaContent('meta[property="og:description"]') ||
    metaContent('meta[name="twitter:description"]');

  if (!description) {
    usedFallback = true;
    var main =
      document.querySelector("article") ||
      document.querySelector("main") ||
      document.querySelector('[role="main"]') ||
      document.body;
    if (main) {
      // Gather the first few paragraph-like blocks for a sensible summary.
      var blocks = main.querySelectorAll("p, li");
      var collected = [];
      for (var i = 0; i < blocks.length && collected.join(" ").length < 320; i++) {
        var txt = clean(blocks[i].innerText);
        if (txt.length >= 40) collected.push(txt);
      }
      description = clean(collected.join(" "));
      if (!description) description = clean(main.innerText).slice(0, 320);
    }
  }
  if (description.length > 500) description = description.slice(0, 500).trim() + "…";

  return {
    title: title,
    description: description,
    url: location.href,
    selection: selection,
    usedFallback: usedFallback
  };
}
