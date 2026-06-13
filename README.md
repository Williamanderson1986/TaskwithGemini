# One-Click TikGem

A Chrome extension that captures the current web page's title and description and
sends it straight to your [TikGem](https://tikgem.pplx.app) task manager — in one
click, with your own default tags, status, context, due date, and target list.

- **Privacy policy:** https://williamanderson1986.github.io/TaskwithGemini/
- **TikGem app:** https://tikgem.pplx.app

## Features

- **One-click capture** — pull the active tab's title and meta description into a new task.
- **Right-click menu** — “Add page to TikGem” captures a page, link, or selected text.
- **Editable preview** — tidy the title and description before sending.
- **Keyboard shortcut** — `Ctrl+Shift+K` (`Cmd+Shift+K` on Mac) opens the capture popup.
- **Defaults** — set default tags, status, context, due date, target list, and an
  optional “close tab after adding” toggle on the options page.
- **Inline syntax** — `#tag`, `+⚡` priority, and `$🍅` energy in the title are parsed
  by TikGem and merged with your defaults.

## Install (unpacked, for development)

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select the [`extension/`](extension/) folder.

## Repository layout

```
extension/            The extension source (Manifest V3). Load this unpacked.
index.html            Privacy policy (served via GitHub Pages).
PRIVACY_POLICY.md     Privacy policy (Markdown copy).
store-assets/         Chrome Web Store images (screenshots, promo tiles, icons).
docs/                 Store listing copy + submission checklist.
```

## Privacy

One-Click TikGem collects no personal data, uses no tracking or remote code, and
communicates only with your own TikGem app. See the
[privacy policy](https://williamanderson1986.github.io/TaskwithGemini/) for details.

## License

MIT
