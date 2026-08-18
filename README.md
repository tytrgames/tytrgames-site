# RGB Block Puzzle Website

Static, dependency-free website for [tytrgames.com](https://tytrgames.com/).
The landing page presents real RGB Block Puzzle gameplay in English and Turkish,
with responsive layouts for phone, tablet and desktop.

## Local preview

Node.js 22 or newer is recommended. No package installation or build step is
required.

```powershell
npm.cmd run serve
```

Open `http://127.0.0.1:4173/`.

## Verification

```powershell
npm.cmd run check
node scripts/browser-check.mjs
```

`npm.cmd run check` verifies protected-file hashes, local references, the
official badge/device identity hashes, removal of obsolete CSS imitations, the
developer identity, deferred video-loading contract and static delivery budgets.
`browser-check.mjs` expects the local preview server to be running and checks
horizontal overflow and minimum interactive-target sizes at 320, 360, 390, 430,
768, 1024 and 1440 CSS pixels. It also writes local QA screenshots to the system
temporary folder.

## Source structure

```text
index.html                 Semantic landing-page content and SEO metadata
assets/css/site.css        Responsive visual system
assets/js/site.js          EN/TR, accessible menu and video lifecycle
assets/images/store/       Official App Store and Google Play badge artwork
assets/images/device/      Original brand-neutral transparent phone frame
assets/images/gameplay/    Optimized real in-game screenshots
assets/video/              One optimized Classic + Arcade gameplay video
privacy-policy/index.html  Existing protected Privacy Policy
app-ads.txt                Existing protected advertising declaration
CNAME                      Existing protected custom domain
scripts/                   Dependency-free local preview and QA tools
```

## Protected production surfaces

The following files are byte-exact protected inputs and must not be casually
formatted or rewritten:

- `privacy-policy/index.html`
- `app-ads.txt`
- `CNAME`

Run the static check before every deployment. A protected hash mismatch is a
deployment blocker.

## Media behavior

- The hero and below-fold screenshots are responsive WebP derivatives of real
  game captures.
- Gameplay remains a separate exact image layer inside the brand-neutral phone
  frame. The generated device asset never modifies or regenerates gameplay.
- The App Store and Google Play calls to action use official English badge
  artwork in both website language modes, per account-owner approval.
- The 29-second H.264 gameplay video has no audio track and is not requested on
  initial page load. JavaScript attaches its source only after explicit play.
- Below-fold images use lazy loading. Media has intrinsic dimensions to prevent
  layout shifts.

## Deployment

The site is designed for GitHub Pages and keeps the root `CNAME`. Publishing is
an explicit repository-owner action; local prototype work does not deploy or
change DNS.
