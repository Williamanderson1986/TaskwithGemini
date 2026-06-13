# One-Click TikGem (Chrome extension)

Capture the current page's title + description and send it to **TikGem**
(`https://tikgem.pplx.app`) as a new task — in one click. Modeled on the
One-Click TickTick interaction, adapted to TikGem's client-side architecture.

## How it works

TikGem has no server API, so instead of an API call this extension talks to a
small, documented hook that lives in the TikGem page:

```js
window.tikgemQuickAdd(title, description, opts) // returns the new task id
```

The extension reads the page you're on, then calls that hook inside an open
TikGem tab (opening one if needed). The task is created, persisted to TikGem's
local store, and appears immediately if a task list is on screen.

The optional third argument carries your saved defaults:
`{ tags, status, context, dueAt, listId }`. All fields are optional and
validated inside TikGem, so omitting them keeps TikGem's own defaults. Inline
`#tag` / `+⚡` / `$🍅` syntax in a title still works and merges with default tags.

## Triggers

- **Toolbar button** (or `Ctrl/Cmd+Shift+K`) — opens a popup with an editable
  title + description preview, a summary of the active defaults, and a link to
  the options page, then **Send to TikGem**.
- **Right-click → "Add page to TikGem"** — one-click capture + send, no popup.
  Right-clicking a text selection uses the selection as the task title.

## Options page

Open via the popup's **Edit defaults & options** link, or right-click the
toolbar icon → **Options**. Settings persist in `chrome.storage.sync` and roam
with your Chrome profile. They are applied to every capture:

| Setting | Effect |
|---|---|
| **Default tags** | Comma-separated; added to every task (merged with inline `#tags`, de-duplicated). |
| **Default status** | `Next` / `Action Planned` / `Waiting For`, or leave on TikGem's default. |
| **Default context** | Built-ins (Home, Errand, School, Computer) or any custom name — created in TikGem if new. |
| **Default due date** | None, Today, Tomorrow, or **In N days** (computed at capture time, set to local midday). |
| **Target list** | Where the task lands. The menu is populated from your TikGem lists (read from an open TikGem tab; cached so it shows even when none is open — use **Refresh lists**). Defaults to All Tasks (inbox). |
| **Close tab after adding** | When on, the source tab closes after the task is added (a TikGem tab is never closed). |

## Capture rules

- **Title:** `og:title` → `document.title` (trailing " - Site" / " | Site"
  suffix stripped) → first `<h1>`. A text selection, if present, wins.
- **Description:** `meta[name=description]` → `og:description` →
  `twitter:description` → first meaningful `article`/`main` paragraphs
  (capped ~500 chars). The page **URL is always appended** so each task links
  back to the source.

## Missing-content fallbacks

- No title → use the selection, else the page URL, else `(untitled capture)`
  (the hook itself guards this too).
- No meta description → summarize visible main text; popup shows a note.
- No description at all → task is created with just the title + URL.
- TikGem hook missing (older build) → falls back to filling the `#task-input`
  box and pressing Enter.
- Page not readable (chrome://, web store, some PDFs) → popup still lets you
  type a task manually.
- No TikGem tab open → opens one on the All Tasks route, waits for load,
  then injects.

## Install (unpacked, for development)

1. Unzip this folder.
2. Open `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select this folder.
5. Pin the extension, open any page, and click the toolbar icon (or
   right-click → "Add page to TikGem").

## Permissions

| Permission | Why |
|---|---|
| `activeTab` | Read the current page only when you invoke the extension |
| `scripting` | Inject the capture + insert functions |
| `contextMenus` | The right-click "Add page to TikGem" item |
| `tabs` | Find or open the TikGem tab |
| `storage` | Persist your options (defaults, target list, close-tab) via `chrome.storage.sync` |
| host: `https://tikgem.pplx.app/*` | Inject the quick-add into TikGem |

## Files

- `manifest.json` — MV3 manifest (toolbar action, context menu, command).
- `background.js` — service worker: capture → locate TikGem tab → inject.
- `capture.js` — extracts title/description/URL/selection from the source tab.
- `inject.js` — runs in TikGem's MAIN world; calls `tikgemQuickAdd(title,
  description, opts)`, with a keystroke fallback (defaults can't be applied in
  the keystroke fallback).
- `readlists.js` — runs in TikGem's MAIN world; reads your lists for the
  options page target-list menu.
- `settings.js` — shared settings model (defaults, `chrome.storage.sync`
  load/save, due-date computation, `buildOpts`); used by the worker, popup, and
  options page.
- `options.html` / `options.js` — the options page.
- `popup.html` / `popup.js` — editable preview + Send (applies your defaults).
- `icons/` — toolbar icons.

## Notes

- The **keystroke fallback** (used only on older TikGem builds without the
  hook) cannot apply defaults — it just fills the quick-add bar. Current TikGem
  supports the full `opts` path.
- Due dates are computed **at capture time** relative to your local clock, so
  "Tomorrow" always means the day after you capture.
