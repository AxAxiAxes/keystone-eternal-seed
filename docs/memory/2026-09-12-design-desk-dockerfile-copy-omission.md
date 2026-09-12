# `/design-desk` 404'd live: Dockerfile COPY list omission, not a stalled redeploy

**Date:** 2026-09-12
**Context:** Founder shared the live `https://xiiom.com/axescontracting` page.
Reading it through the shared browser canvas showed a "First release"
Architectural Design Desk card linking to `/design-desk`. Checked all of that
page's live links directly.

## What was found

| Path | Live status |
| --- | --- |
| `/axescontracting` | `200` |
| `/materials` | `200` |
| `/support` | `401` (correct — `requireAdmin`-gated, expected without credentials) |
| `/library/AXES_BUSINESS_PLAN.md` | `200` |
| `/design-desk` | **`404`** |

`design-desk.html` and its `server.js` route (`pathname === '/design-desk'`)
were already merged to `axaxiaxes-axiom-monorepo` (commit `da2a60e`, which
predates the `axescontracting.html` reactivation commit `c8afcdb` that *is*
live). `apps/axiom-freedom/test/axiom-proxy.test.js` already asserts
`GET /design-desk` returns `200` with the expected body, and that test was
passing locally.

The existing decision register had a P2 row treating this as "unconfirmed
Railway redeploy" — a reasonable prior hypothesis, but the live evidence
above (an *older* file 404ing while a *newer* file on the same branch loads
fine) doesn't fit a simple stale-deploy story, since a rebuild that included
the newer file would necessarily have been built from a commit at or after
the older file's own commit.

## Root cause

Both `apps/axiom-freedom/Dockerfile` (the real per-service Dockerfile Railway
builds) and the legacy root `Dockerfile` (kept as a safety net per
`RAILWAY_DEPLOYMENT.md`) copy each static HTML page into the image with its
own explicit, individually-named `COPY` line rather than a directory-wide
copy:

```dockerfile
COPY apps/axiom-freedom/materials.html ./
COPY apps/axiom-freedom/widget.js ./
```

`design-desk.html` was never added to either list when the page itself was
added. The route and file are correct and already merged; the built Docker
image simply never contained the file, so `serveFile()` correctly returned
`404` for a file that doesn't exist inside the container — regardless of how
many times, or how successfully, Railway rebuilt and redeployed that image.

Cross-checked all 10 HTML files plus `widget.js` referenced by
`apps/axiom-freedom/server.js` against both Dockerfiles' `COPY` lists;
`design-desk.html` was the only omission.

## Fix

Added `COPY apps/axiom-freedom/design-desk.html ./` to both
`apps/axiom-freedom/Dockerfile` and the root `Dockerfile`, immediately after
the existing `materials.html` line, matching the file's established
per-page `COPY` pattern exactly.

## Verification

- `design-desk.html` contains no `src=`/`href=` references to other local
  assets (confirmed via grep), so no other file needed to accompany it.
- `apps/axiom-freedom`'s existing test suite (`npm test`, `node --test`):
  6/6 passing, including the pre-existing assertion that `GET /design-desk`
  returns `200` — confirming the route/file logic itself was never broken,
  only the Docker packaging.
- Docker was not available in this session to run a local image build; CI's
  `portal-image` job (`.github/workflows/axi-continuity-validation.yml`)
  builds `apps/axiom-freedom/Dockerfile` and checks `/health` on every PR,
  which will confirm the corrected Dockerfile still builds and starts
  correctly.
- Updated `docs/AXES_TIER_1_DECISION_REGISTER.md`'s matching P2 row,
  `docs/RAILWAY_DEPLOYMENT.md`'s "Current deployment state" log, and
  `docs/AXES_BUILD_PROGRAM.md`'s Release B progress note.

## What still requires the founder

The code-level bug is fixed and merged, but an authorized operator still
needs to trigger (or wait for) the next Railway redeploy of `axiom-web` from
the corrected commit and confirm `https://xiiom.com/design-desk` returns
`200` in production. That trigger/confirmation cannot be done from this
repository alone.

## Related records

- `apps/axiom-freedom/Dockerfile`
- `Dockerfile`
- `docs/AXES_TIER_1_DECISION_REGISTER.md`
- `docs/RAILWAY_DEPLOYMENT.md`
- `docs/AXES_BUILD_PROGRAM.md`
- `PROJECT_TIMELINE.md`
- `docs/memory/2026-09-12-architectural-design-desk-and-decision-register.md`
  (original page build, not this deploy bug)
