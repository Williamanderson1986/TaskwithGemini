# Chrome Web Store Submission Checklist — One-Click TikGem v1.2.0

A complete, ready-to-upload package. Work top to bottom in the
[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

> One-time setup: a Chrome Web Store developer account requires a $5 USD
> one-time registration fee before you can publish your first item.

---

## 1. Package (upload first)

- [ ] Upload **`one-click-tikgem-v1.2.0.zip`** as the item package.
  - Manifest V3, version `1.2.0`, 15 files, production icons included.
  - Permissions: `activeTab`, `scripting`, `contextMenus`, `tabs`, `storage`.
  - Host permission: `https://tikgem.pplx.app/*` (the only site contacted).

## 2. Store listing tab

- [ ] **Item name:** `One-Click TikGem`
- [ ] **Summary** (short description): paste from `listing.md`.
- [ ] **Detailed description:** paste the block from `listing.md`.
- [ ] **Category:** Productivity
- [ ] **Language:** English (United States)
- [ ] **Store icon (128×128):** upload `icons/store-icon-128x128.png`.
  - 96×96 artwork centered in a 128 canvas with 16px transparent padding, subtle glow — meets CWS spec for light + dark backgrounds.

## 3. Graphic assets

- [ ] **Screenshots (1280×800)** — upload all four, in order:
  1. `screenshots/01-captured-task-1280x800.png` — the captured page showing up as a task in TikGem (hero).
  2. `screenshots/02-popup-capture-1280x800.png` — one-click popup pulling a page's title + description.
  3. `screenshots/03-options-defaults-1280x800.png` — options page: default tags, status, context, due date, target list, close-tab.
  4. `screenshots/04-right-click-menu-1280x800.png` — "Add page to TikGem" right-click context menu.
- [ ] **Small promo tile (440×280, REQUIRED):** upload `promo/small-tile-440x280.png`.
- [ ] **Marquee promo tile (1400×560, optional):** upload `promo/marquee-1400x560.png`.

## 4. Privacy tab

- [ ] **Single purpose:** paste from `listing.md` → Privacy practices.
- [ ] **Permission justifications:** paste each one from `listing.md`.
- [ ] **Data usage:** check the boxes per `listing.md` (no PII collected, no remote code, no sale/transfer of data).
- [ ] **Privacy policy URL:** host `PRIVACY_POLICY.md` at a public URL and paste it.
  - Required because the extension handles user content (captured page data) and settings.
  - A GitHub Pages page or a page on tikgem.pplx.app both work.

## 5. Distribution

- [ ] **Visibility:** Public (or Unlisted for link-only).
- [ ] **Regions:** All (or restrict).
- [ ] **Official URL / Homepage:** https://tikgem.pplx.app
- [ ] **Support email:** add your contact email.

## 6. Submit

- [ ] Save draft, review the preview, then **Submit for review**.
  - First-time review typically takes a few business days. You'll get an email on approval or if changes are requested.

---

## Asset spec compliance (already verified)

| Asset | Spec | This package |
|---|---|---|
| Store icon | 128×128 PNG, 96px art + 16px padding | ✅ 128×128 |
| Screenshots | 1280×800 or 640×400, ≥1 (≤5), square corners, full bleed | ✅ 4 × 1280×800 |
| Small promo tile | 440×280 (required) | ✅ 440×280 |
| Marquee | 1400×560 (optional) | ✅ 1400×560 |
| Package | MV3 zip, valid manifest | ✅ v1.2.0, manifest + JS validated |

## Notes

- The screenshots are realistic composites: real extension popup and options pages
  (rendered with your production gem icon) framed in a browser window, and the live
  TikGem app at tikgem.pplx.app showing an actually-captured task. The article page
  used as the capture target is an illustrative example.
- If a reviewer asks for justification on `tabs`/`scripting`, the answer is in
  `listing.md` → Permission justifications: they exist solely to locate the user's
  own TikGem tab and add the task into it.
