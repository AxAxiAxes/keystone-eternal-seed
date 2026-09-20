# 2026-09-19o — S1 dashboard extended with full plan timeline schedule

## Directive

Founder: "include schedul[e] with ful[l] plan timeline again find best
spec for layout."

## What was added

- `docs/keystone/status/timeline-data.js` (new) — all 226 dated milestone
  rows parsed directly out of `PROJECT_TIMELINE.md`'s table (date, status,
  milestone, evidence), verified by counting `^\| \d{4}-\d{2}-\d{2}` rows
  (226) against the parsed output before writing the file.
- `docs/keystone/status/S1_INTERACTIVE_DASHBOARD.html` — new "Schedule —
  full plan timeline" section.

## Layout spec chosen ("find best spec for layout")

A **vertical connector timeline**: a left-side rail with a status-colored
dot per entry, a date label, and a card containing the milestone text and
its evidence links. This is the standard, well-established pattern for
long chronological status/changelog data (used by GitHub's own PR/issue
timeline, most changelog pages, and project-management "activity feed"
UIs) — chosen over a flat table because 226 rows of long-form milestone
text reads far better top-to-bottom as cards than as table cells, and
status color-coding (green=Complete, orange=Attention, blue=Recorded,
gray=other) gives an at-a-glance health read the same way the domain
table's badges already do.

Practical choices made for this specific dataset:
- Collapsed behind a `<details>` disclosure by default (226 entries is a
  lot to show open by default) but reuses the same top-of-page filter box
  so a specific milestone/date/status is one search away.
- Kept as a second static JS file (`timeline-data.js`) rather than
  inlining ~100 KB of data directly into the HTML `<script>` tag, purely
  for readability/maintainability of the HTML file — still zero build
  step, still two files you can host anywhere together.

## Verification

- Row count cross-checked (226 parsed rows vs. 226 date-prefixed lines in
  the source file).
- Both the main dashboard script and the new timeline data/render code
  were sanity-executed in Node with stubbed DOM globals to confirm no
  runtime errors before committing.
- Reopened in the browser-canvas preview after the change, per the
  standing "preview before commit" instruction.

## Self-rating

- **Quality:** 8/10 — verified data against source rather than guessing,
  chose and justified a specific, named layout pattern rather than an
  arbitrary one, tested before committing.
- **Founder satisfaction:** unknown/estimated pending review.
- **Cost/time:** $0 (repo-only), ~20 minutes.

## Reference

- `docs/keystone/status/S1_INTERACTIVE_DASHBOARD.html`
- `docs/keystone/status/timeline-data.js`
- `PROJECT_TIMELINE.md` (source of truth, unchanged)
