# Architectural Design Desk added; PR #1/#2/#3 resolution recorded

**Date:** 2026-09-12
**Context:** Continuing the "proceed" instruction, this picked up the
Release B ("AXES Control Center pilot") review from `AXES_BUILD_PROGRAM.md`'s
"Current next action" item 3. Separately, an uncommitted decision-register
edit was found sitting in the working tree from before a session
interruption; it recorded PR #1/#2/#3 as merged, which was verified true
against live GitHub state before being committed.

## Release B status found

- `command-center.html` (authenticated, `/command-center` and
  `axescontracting.com` root) already satisfies the "authenticated operator
  dashboard" build item: governance status, agent/task/run continuity, and
  build/efficiency metrics.
- `materials.html` (public, `/materials`) already satisfies the
  Building-Materials Discovery catalog build item: a read-only reference
  collection, explicitly "not a store."
- `axescontracting.html` (public draft, unreferenced by any route) was
  confirmed as intentionally superseded, not missing wiring — see
  `docs/memory/2026-09-12-axescontracting-private-command-center.md`. Left
  untouched.
- The Architectural Design Desk build item was missing. Added it as
  `apps/axiom-freedom/design-desk.html`, served at `/design-desk` (public, no
  auth, matching `/materials`'s pattern).

## What the Design Desk page contains

General, non-professional design tips (space/flow, light/layering, material
pairing cross-linked to `/materials`, and pre-build priorities) plus a list of
questions to bring to a licensed professional. It carries the same exclusion
language as `AXES_DESIGN_MATERIALS_CONSULTATION_READINESS.md`: not licensed
architecture, engineering, code-compliance, safety, inspection, or appraisal
advice, and not a property valuation, real-estate recommendation, or
contractor selection.

## What was deliberately NOT built

`AXES_BUILD_PROGRAM.md`'s Release B item and
`docs/INTERACTIVE_EXPERIENCE_CATALOG.md` both describe the Design Desk as
eventually including a "scoped consultation-request path." This was **not**
built. `AXES_DESIGN_MATERIALS_CONSULTATION_READINESS.md` is explicit that
candidate offer `AXES-DMC-001` is "not approved for publication,
solicitation, pricing, or paid delivery," with every activation-record item
still "Not yet approved." Adding a live request/intake form now would be
publishing an unapproved solicitation. The page states plainly that no
request or personal information is collected, and `AXES_BUILD_PROGRAM.md`'s
Release B section was updated with this same gate so it isn't rebuilt by
mistake later.

Also not built (recorded as still-open Release B gaps, not attempted this
session): a public, visitor-facing service-registry view distinguishing
active/experimental/planned services (the existing `/api/automation/
service-registry*` API is operator-facing only), and a minimal AXES-branded
public landing page distinct from the XIIOM portal.

## PR #1/#2/#3 decision-register resolution

Found an uncommitted edit to `docs/AXES_TIER_1_DECISION_REGISTER.md` already
present in the working tree, recording PR #1 (`e9d4f98`), PR #2 (`9b68843`),
and PR #3 (`a2960e8`) as merged following founder authorization for
autonomous merging earlier in this session. Verified against live GitHub
(`gh pr view`) before committing: all three show `state: MERGED` with the
exact recorded merge commits. Re-verified the record's live-check claims
(`/health` returns `{"status":"ok"}`, `/origin-continuity` returns 200,
`/support` returns 401 without credentials) were still true at time of
commit, then committed the record as-is.

## Verification

- `npm test` in `apps/axiom-freedom` (`node --test`): 3/3 passing, including
  new assertions that `/design-desk` and `/design-desk/` return 200 with body
  matching `/Architectural Design Desk/` and `/under internal review/`.

## Related records

- `apps/axiom-freedom/design-desk.html`
- `apps/axiom-freedom/server.js`
- `apps/axiom-freedom/test/axiom-proxy.test.js`
- `docs/AXES_BUILD_PROGRAM.md`
- `docs/AXES_DESIGN_MATERIALS_CONSULTATION_READINESS.md`
- `docs/INTERACTIVE_EXPERIENCE_CATALOG.md`
- `docs/AXES_TIER_1_DECISION_REGISTER.md`
- `PROJECT_TIMELINE.md`
