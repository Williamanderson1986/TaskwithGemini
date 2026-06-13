# One-Click TikGem — Chrome Web Store Listing Copy

Paste these fields into the Chrome Web Store Developer Dashboard when creating the listing.

---

## Item name
(45 chars max — currently 16)

```
One-Click TikGem
```

## Summary
(132 chars max — short description shown in search results; currently ~108)

```
Capture any web page's title and description to your TikGem task manager in one click — with your own default tags and lists.
```

## Category

```
Productivity
```

## Language

```
English (United States)
```

---

## Detailed description
(Up to 16,000 chars. Plain text — no HTML. Used on the store listing page.)

```
One-Click TikGem turns any web page into a task in your TikGem command center, instantly.

See an article worth reading later, a doc you need to action, or a page you want to follow up on? Click the toolbar button (or press Ctrl+Shift+K / Cmd+Shift+K) and TikGem grabs the page title and description, pre-fills a quick task, and drops it into your list. No copy-paste, no switching tabs, no losing the thread of what you were doing.

WHAT IT DOES
• One-click capture — pull the active tab's title and meta description into a new task.
• Right-click anywhere — use the "Add page to TikGem" context-menu item to capture a page, link, or selected text without opening the popup.
• Edit before you send — the popup shows an editable title and description so you can tidy the task first.
• Keyboard shortcut — Ctrl+Shift+K (Cmd+Shift+K on Mac) opens the capture popup on any page.

DEFAULTS THAT SAVE YOU TIME
Open the options page to set defaults that apply to every captured task:
• Default tags — added automatically and merged with any inline #tags you type.
• Default status — Next, Action Planned, or Waiting For.
• Default context — Home, Errand, School, Computer, or your own custom context.
• Default due date — none, today, tomorrow, or a fixed number of days from capture.
• Target list — send captures straight to any list in your TikGem workspace.
• Close tab after adding — optionally close the source tab once the task lands.

INLINE SYNTAX STILL WORKS
Type #tag, +⚡ priority, or $🍅 energy right in the title and TikGem parses it — merged with your defaults.

PRIVATE BY DESIGN
One-Click TikGem only talks to your own TikGem app (tikgem.pplx.app). It reads the page you choose to capture, applies your settings, and adds the task. There is no account, no tracking, no analytics, and no data sent to any third party. Your settings live in your own Chrome profile via Chrome sync storage.

HOW IT WORKS
The extension reads the active tab's title and description, opens (or reuses) your TikGem tab, and adds the task directly to your TikGem workspace. Your task data stays in your TikGem app exactly as if you had typed it yourself.

Requires the TikGem app at https://tikgem.pplx.app.
```

---

## Privacy practices (Developer Dashboard → Privacy tab)

**Single purpose description:**
```
One-Click TikGem captures the current web page's title and description and adds it as a task to the user's own TikGem task manager (tikgem.pplx.app), applying the user's saved default tags, status, context, due date, and target list.
```

**Permission justifications:**

- `activeTab` — Read the title and description of the page the user explicitly chooses to capture (via the toolbar button, shortcut, or context menu).
- `scripting` — Inject a small script into the user's open TikGem tab to add the captured task and to read the user's list names for the target-list setting.
- `contextMenus` — Provide the "Add page to TikGem" right-click menu item.
- `tabs` — Locate or open the user's TikGem tab to deliver the task, and optionally close the source tab after adding.
- `storage` — Save the user's default settings (tags, status, context, due date, target list, close-tab toggle) in Chrome sync storage.
- `host_permission https://tikgem.pplx.app/*` — The only site the extension communicates with: the user's own TikGem app where tasks are added.

**Data usage disclosures (check the dashboard boxes accordingly):**
- Does NOT collect or transmit personally identifiable information to the developer or any third party.
- Does NOT use remote code.
- Data handled: the page title/description the user captures is sent only to the user's own TikGem app. Settings are stored locally in the user's Chrome profile (sync storage).
- "I do not sell or transfer user data to third parties" — TRUE.
- "I do not use or transfer user data for purposes unrelated to the item's single purpose" — TRUE.

**Privacy policy URL:**
A privacy policy URL is required for published items that handle user data. Suggested text is provided in PRIVACY_POLICY.md — host it at a public URL (e.g. a GitHub Pages page or the TikGem site) and paste that URL here.

---

## Other listing fields

- **Official URL / Homepage:** https://tikgem.pplx.app
- **Support email:** (your contact email)
- **Visibility:** Public (or Unlisted if you want a link-only share)
- **Distribution:** All regions (or restrict as desired)
