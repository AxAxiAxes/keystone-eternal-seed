# AXES Contracting public studio reactivated; local Docker cleanup

**Date:** 2026-09-12
**Type:** Completed implementation + operational note
**Related:** `docs/AXES_BUILD_PROGRAM.md` (Release B), `docs/AXES_TIER_1_DECISION_REGISTER.md`,
`docs/memory/2026-09-12-axescontracting-private-command-center.md`,
`docs/memory/2026-09-12-architectural-design-desk-and-decision-register.md`

## What changed

1. **Local Docker cleanup.** Found two locally-running Docker containers
   (`axiom-freedom-axiom-web-1`, `axiom-freedom-axiom-engine-1`), healthy and
   up for 33 hours, left over from an earlier local dev/test session.
   Confirmed production (`xiiom.com`) runs on Railway, entirely independent of
   this desktop's Docker/WSL state. Stopped both containers; left Docker
   Desktop and WSL (`Ubuntu`, `docker-desktop` distros) running since they may
   serve other purposes. No production impact.
2. **Reactivated `axescontracting.html` as a public landing page**, closing
   the last open Release B build item ("a minimal AXES landing page"):
   - Routed at `/axescontracting` and `/axescontracting/` (public, no auth) in
     `apps/axiom-freedom/server.js`, alongside the existing `/materials` and
     `/design-desk` public routes. `axescontracting.com`'s domain **root**
     stays unchanged: private, admin-gated, serving `command-center.html`.
     The new route is a path on the general public portal, not tied to that
     domain.
   - Retitled the page from "AXES Contracting | The AXES Control Center" to
     "AXES Contracting | Public Studio," and changed its hero span from "The
     AXES Control Center" to "Public studio," so it no longer collides with
     `command-center.html`, which is the sole legitimate holder of the
     "Control Center" name.
   - Updated its Architectural Design Desk card from "Planning" to "First
     release," added a live link to `/design-desk`, and revised the copy to
     remove the stale "scoped project conversations" phrasing (no intake
     form exists) and state plainly that no request or personal information
     is collected.
   - Linked the page from the main portal (`apps/axiom-freedom/index.html`)
     with a new "AXES Contracting" card, since it previously had no
     discoverable entry point from the homepage.
   - Added regression coverage in
     `apps/axiom-freedom/test/axiom-proxy.test.js` for `/axescontracting`
     (with and without a trailing slash) and the new homepage link; full
     suite passes (5/5).
3. **Updated `docs/AXES_BUILD_PROGRAM.md`'s Release B section**: every listed
   build item now has a corresponding, tested implementation, aside from the
   Architectural Design Desk's consultation-request path, which stays
   deliberately unbuilt pending founder approval in
   `AXES_DESIGN_MATERIALS_CONSULTATION_READINESS.md`. Updated "Current next
   action" to reflect this.
4. **Added a new decision-register row (P2)**: `https://xiiom.com/design-desk`
   still returned 404 roughly 10-12 minutes after PR #6 merged, while
   `/health` responded normally; re-checked again while writing this record
   and it was still 404. This is a Railway deploy-pipeline question (build
   trigger, timing, or configuration for the `axiom-web` service), outside
   this session's visibility or authority. Flagged for an authorized operator
   to check the Railway dashboard directly; not something further polling
   from this repository can resolve.

## What was not done (by design)

- No change to `axescontracting.com`'s private, admin-gated domain root.
- No consultation-request/intake form, payment feature, or identity
  collection added anywhere.
- No Railway/DNS action taken or attempted from this session.

## Verification

- `npm test` in `apps/axiom-freedom`: 5/5 passing after these changes.
- Confirmed `axescontracting.com`'s domain-root behavior is documented
  separately in `docs/DOMAIN_PORTFOLIO.md` and was not touched by this
  change (that row already correctly describes the private root, unaffected
  by the new unrelated `/axescontracting` path on the general public host).
