# 2026-09-18aq — urartuhi.com upgraded to manifest-driven gallery (bulk uploads)

## Trigger

Founder asked: "how many images can i upload to urartuhi and can i upload bulk
how many."

## Findings (GitHub practical limits)

- Hard limit: 100MB per file (git/GitHub blocks pushes above this).
- Practical good-practice ceiling: keep the whole repo under roughly 1GB (not
  hard-enforced by GitHub at this scale, just recommended).
- Translation for typical compressed photography/artwork files: comfortably
  hundreds to low-thousands of images. There is no fixed "you may upload N
  images" cap enforced by the platform.

## Problem found before answering

The site (`AxAxiAxes/urartuhi.com`, static GitHub Pages site, separate repo
from this monorepo) had no real upload mechanism. Each slide was a hardcoded
`<figure class="slide">` block in `index.html` paired with a CSS gradient
placeholder class (`.artwork-1`..`.artwork-6`) — six visual placeholders, one
real featured image. Adding a real image meant hand-editing HTML/CSS per
image, which does not scale for bulk adds.

## Change made (in `AxAxiAxes/urartuhi.com`, not this monorepo)

Rewrote the gallery to be manifest-driven so any number of images can be
added by (1) dropping the image file into `images/` and (2) adding one JSON
entry — no other markup edits required:

- `images/manifest.json` (new) — JSON array of
  `{ "file", "title", "meta", "alt" }` objects; starts as `[]`.
- `script.js` — now fetches `images/manifest.json` at load and builds the
  slideshow slides, nav dots, and thumbnail grid dynamically from it (real
  `<img loading="lazy">` tags, not CSS gradients). Shows a clear
  "no additional pieces yet" empty-state note when the manifest is empty,
  instead of fake placeholder gradients.
- `index.html` — removed the six hardcoded placeholder slides; slideshow/grid
  containers now start empty and are populated by `script.js`; updated the
  "About this gallery" copy.
- `style.css` — removed unused `.artwork-1`..`.artwork-6` gradient classes;
  added `.artwork-image`, `.gallery-empty-note`, `.thumb img` rules.
- `README.md` — new "Adding artwork (including bulk uploads)" section
  documenting the manifest format and size-limit guidance.

Committed and pushed directly to `AxAxiAxes/urartuhi.com` `main`
(commit `3b13e1b`, no PR process in that repo). Verified live after the Pages
rebuild: `https://axaxiaxes.github.io/urartuhi.com/` (200), `.../images/
manifest.json` (200, body `[]`), `.../script.js` (200). Featured hero image
is untouched; the additional-gallery section currently shows the empty-state
note since no bulk images have been supplied yet.

## Answer given to founder

No fixed upload limit — practically hundreds-to-thousands of images are fine.
Bulk adds are now a two-step drop-in (file + one manifest.json entry) instead
of manual HTML editing per image. Ready to add real images as soon as the
founder supplies files + titles/captions.

## Related

- Repo: `AxAxiAxes/urartuhi.com` (external to this monorepo; no PR here).
- No monorepo code changed; this record exists so the change is discoverable
  in project continuity history.
