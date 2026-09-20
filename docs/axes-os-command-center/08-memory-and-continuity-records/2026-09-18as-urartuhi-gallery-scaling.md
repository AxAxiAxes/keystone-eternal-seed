# 2026-09-18as — urartuhi.com scaled up (masonry grid, tag filtering)

## Trigger

Founder asked how Pinterest posts so much content, then said "let's scale
it" (referring to `urartuhi.com`, the gallery just bulk-loaded with 34
images in record `ar`).

## What "scaling" meant here

Pinterest's real scale mechanisms (crowdsourced re-pinning, distributed
CDN infra, algorithmic personalization) don't transfer directly to a small
static GitHub Pages site with one owner/curator. The applicable, in-scope
pieces were the *UI/architecture* patterns that let a manifest-driven
gallery keep working well as image count grows from dozens to hundreds:

- **Masonry grid** — replaced the fixed square-crop CSS grid with a
  CSS-`columns` masonry layout that preserves each image's natural aspect
  ratio (Pinterest-style variable-height tiles instead of forced crops).
- **Tag filtering** — added an optional `tags: []` field per
  `images/manifest.json` entry and a dynamically generated filter bar
  (only appears once at least one entry has tags); lets the collection be
  browsed by category instead of one long undifferentiated grid.
- **Scalable slideshow controls** — one nav dot per slide (the prior
  design) stops being usable well before 100 pieces; past a
  `DOT_UI_LIMIT` of 12 slides the page now shows a plain "N / total"
  counter instead. Prev/next, keyboard arrows, and grid-thumbnail clicks
  are unaffected.
- Tagged the 8 pieces from record `ar` with known visual subjects
  (abstract/light, cyberpunk/digital, classical/figure, landscape/night,
  architecture/interior, animal/still-life); the other 26 stay untagged
  (optional field, fully backward compatible).

## What was intentionally NOT added

The founder's Pinterest question implied cookie-based content/personalization
as a possible next step. That was deliberately **not** implemented:

- This is a static GitHub Pages site with no backend — genuine per-visitor
  cookie tracking/personalization is not feasible without adding server
  infrastructure, which is a much larger, separate architectural decision.
- Cookie-based tracking also carries real privacy/consent obligations
  (GDPR/CCPA cookie-consent requirements) that are a founder-level legal
  decision, not something to add by default per this project's
  qualification/authority boundary.
- This limitation and reasoning is now documented directly in the site's
  own README so it isn't silently reintroduced later.

## Verification

Committed and pushed directly to `AxAxiAxes/urartuhi.com` `main`
(commit `36ae94c`). Verified live after the Pages rebuild:
`index.html` (200), `images/manifest.json` (200, 34 entries, 8 tagged),
`script.js` (200, contains the new tag-filter logic), `style.css` (200,
contains the new `.tag-btn`/masonry rules).

## Related

- Repo: `AxAxiAxes/urartuhi.com` (external to this monorepo; no PR here).
- Builds on `docs/memory/2026-09-18aq-urartuhi-manifest-driven-gallery.md`
  and `docs/memory/2026-09-18ar-urartuhi-first-bulk-image-upload.md`.
