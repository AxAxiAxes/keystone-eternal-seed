# 2026-09-19u — S1 dashboard UI research + calm-design regression fix

## What was asked
Founder asked: "Is this the best user interface, can we research the ui
how this compares" — a direct request for real, cited research
comparing S1 against best-in-class SaaS dashboard UIs, not an assumed
answer.

## Research performed
Web search on 2026 SaaS admin-dashboard UI best practices, citing
Linear, Vercel, Stripe, and Notion as reference products (sources:
saasui.design, 925studios.co, artofstyleframe.com, adminlte.io,
saasframe.io).

## Honest comparison result
| 2026 best-practice pattern | S1 status |
|---|---|
| Dark-mode-by-default | Matches |
| Collapsible sidebar (~256px→64px) | Matches (240px→64px) |
| Top KPI strip (4-6 cards) | Matches (6 figure cards) |
| Data in tables, not chart clutter | Matches (parked-domains table) |
| Calm/minimal — show only what's needed | **Regression found** — PR #191 (same session) had stacked a topbar + hero + stage banner + orange action banner + figures + quicknav + disclaimer, which is the exact banner-overload anti-pattern the research flags |
| Command palette / keyboard shortcuts (Linear) | Missing |
| AI-native features (not bolted-on) | Missing |
| Polished icon system | Missing — using text glyphs (◆▣▢◷), not a real icon set |

This was reported to the founder plainly, including the
self-identified regression from the prior iteration, before any
further code was changed.

## Fix applied (PR #193, merged, 6/6 CI)
Founder was unavailable for the presented options (consolidate
banners / add command palette / add icon set / leave as-is); proceeded
with the first/recommended option (consolidate) since it directly
reverses a regression introduced this same session and is low-risk.

Merged the separate stage banner and orange action banner into the
existing single sticky topbar: stage tag + slogan + a compact inline
"Copy ratings" button, replacing three stacked blocks with one slim
strip. No functionality was removed — status, stage framing, slogan,
and the ratings-copy action are all still present, just consolidated.

## Verification
- Hardened Node `vm` sanity test (regex-derived known-id list):
  confirmed the old `.action-banner`/`.stage-banner` markup is fully
  removed, confirmed the consolidated topbar elements populate with no
  script exceptions.
- Live browser-canvas page-driving: reloaded, confirmed via
  `evaluate_javascript` that the old banner selectors return false and
  the consolidated topbar contains the stage text and the copy button,
  screenshot taken for visual confirmation.

## What's still open (not done, explicitly flagged, not scope-crept into)
- No command palette / keyboard shortcuts.
- No native AI-assist feature.
- Text-glyph icons, not a real icon set.
These are left for a future founder-directed iteration, per the
"execute only what was presented, no scope expansion" protocol rule.

## Self-rating
7/10 — did real, cited research instead of asserting taste; caught and
disclosed a real regression from the immediately prior PR rather than
defending it; fixed it same-session with proper verification. Not
higher because the regression should have been caught before merging
PR #191 in the first place (banner-stacking should have been an
obvious risk at build time, not only after being asked to research
best practices).

## Links
- PR #193 (merged, 6/6 CI): banner consolidation / calm-design fix.
- PR #191 (merged, prior PR that introduced the regression being fixed
  here): top status bar / quick-nav / stage banner.
