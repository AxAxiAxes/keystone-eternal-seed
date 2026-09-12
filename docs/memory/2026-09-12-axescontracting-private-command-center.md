# axescontracting.com root converted to a private, admin-gated command center

**Date:** 2026-09-12
**Context:** The founder stated directly: "YES WE SHOULD HAVE A PRIVATE
COMMAND CENTER AT AXESCONTRACTING.COM." This follows the 2026-09-11 finding
(`docs/memory/2026-09-11-axescontracting-domain-status.md`) that
`axescontracting.com` was intended as the main hub/command-center domain but
was, at the code level, still serving a fully public marketing page
(`axescontracting.html`, titled "The AXES Control Center" despite being
public) — a naming/behavior mismatch the founder's statement resolved in
favor of making it genuinely private.

## What changed

`apps/axiom-freedom/server.js`'s root route (`/` and `/index.html`) now
branches on `isAxesContractingHost(req.headers.host)`:

- **`axescontracting.com` / `www.axescontracting.com`:** requires the same
  `requireAdmin` HTTP Basic Auth (checked against `ADMIN_PASSWORD`) already
  used by `/command-center`, `/automation`, and `/support`, then serves
  `command-center.html` — the existing "AXES Command Center" operator
  dashboard (live continuity clock, checkpoints, private source catalog,
  business metrics, service registry).
- **Every other host** (including `xiiom.com`): unchanged — serves the
  public `index.html` exactly as before.

Only the root route's behavior changed. Other routes already behaved
identically regardless of hostname (path-based gating, not host-based), so
`/materials`, `/axiom`, `/origin-continuity`, etc. are unaffected on either
hostname.

## What was deliberately left alone

- **`axescontracting.html` is preserved, not deleted.** It is simply no
  longer served at that host's root. Keeping it avoids losing the approved
  marketing copy/visual language in case it is needed elsewhere later (for
  example, if a separate public AXES Contracting page is wanted at a
  sub-path in the future); this is a one-line, easily reversible decision to
  revisit, not a structural commitment.
- **Both root Dockerfiles** (`Dockerfile` and `apps/axiom-freedom/Dockerfile`)
  still `COPY` `axescontracting.html` into the image. Leaving this alone is
  harmless — the file is simply unreferenced by any route now — and touching
  the Dockerfiles was out of scope for this change.
- **Scope decision:** only the root (`/`) was gated, matching the founder's
  literal phrasing ("a private command center AT axescontracting.com") most
  conservatively. Other routes were not host-gated because none were asked
  to be, and the existing path-based `requireAdmin` gates already protect
  the operator-only pages regardless of hostname.

## Verification

- `node --check` passed on both `server.js` and the updated test file.
- `npm test` in `apps/axiom-freedom` (`node --test`): 3/3 passing, including
  the rewritten assertions — `axescontracting.com`/`www.axescontracting.com`
  root now returns `401` without credentials and `200` with the same admin
  Basic Auth header used elsewhere in the suite, with body matching
  `/AXES Command Center/` (the actual command-center markup, replacing the
  old `/The AXES Control Center/` public-page assertion).

## What was changed (docs)

- `docs/DOMAIN_PORTFOLIO.md`: registry row and rollout-order step 1 updated
  to describe `axescontracting.com` as a private, admin-only command center
  rather than a public hub.
- `docs/RAILWAY_DEPLOYMENT.md`: service-responsibility table row, "Current
  deployment state," and the production-validation step now describe the
  private-root behavior, distinct from the still-pending DNS/Railway
  connection (P2 in the decision register) — the code change is independent
  of and unblocked by that pending DNS work.
- `docs/AXES_TIER_1_DECISION_REGISTER.md`: P2 row now notes the destination
  is a private command center, not a public page, once connected.
- `PROJECT_TIMELINE.md`: new dated entry added.

## Related records

- `apps/axiom-freedom/server.js`
- `apps/axiom-freedom/command-center.html`
- `apps/axiom-freedom/test/axiom-proxy.test.js`
- `docs/DOMAIN_PORTFOLIO.md`
- `docs/RAILWAY_DEPLOYMENT.md`
- `docs/AXES_TIER_1_DECISION_REGISTER.md`
- `docs/memory/2026-09-11-axescontracting-domain-status.md`
