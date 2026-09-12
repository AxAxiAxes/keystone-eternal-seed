# 2026-09-11 Portal route and legacy-Dockerfile review

**Status:** Completed repository-controlled correction; local validation passed

## Finding

A full-repository review (prompted by a general "review the entire
repository" request) found four additional packaging/route defects in the
same class as the prior comprehensive-review remediation, none of which were
covered by that earlier pass:

- Five portal page routes (`/axiom`, `/origin-continuity`, `/materials`,
  `/automation`, `/command-center`) accepted only the exact path and returned
  a bare 404 for the trailing-slash form, the same bug already fixed once for
  `/support`.
- `/embed` and `/axes` served `axes_embed.html`, a file that has never existed
  in this repository's git history at any point. Both routes always 404'd.
  `apps/axiom-freedom/widget.js` is a real, working embeddable chat-bubble
  script (meant for external sites to include) whose iframe target is exactly
  `/embed` — so the entire embed-widget feature has been non-functional since
  it was introduced.
- `apps/axiom-freedom/widget.js` itself was not copied by either portal
  Dockerfile, so even the bubble script would 404 for any external site that
  tried to load it from a deployed container.
- A legacy root-level `Dockerfile` and `railway.toml` (created before the
  documented per-service Railway setup in `docs/RAILWAY_DEPLOYMENT.md`) were
  out of sync with the real portal app: missing `axescontracting.html`,
  `command-center.html`, `origin-continuity.html`, `support.html`,
  `materials.html`, `widget.js`, and `PROJECT_TIMELINE.md`. If any Railway
  service ever resolves the Dockerfile at the repository root instead of the
  documented explicit `apps/axiom-freedom/Dockerfile` path, it would build
  exactly the broken/incomplete site observed during the earlier live-site
  check this session (`/command-center`, `/origin-continuity`, and
  `/materials` returning 404).

## Correction

- Added trailing-slash handling to all five affected routes, matching the
  existing `/support` and `/library` pattern.
- Changed `/embed` and `/axes` to return an honest, static "not yet available"
  message instead of a crashed/missing-file 404. No new marketing or product
  content was authored; the fix only converts an undefined crash into an
  intentional, correctly-labeled response.
- Added `widget.js` to both the app-level (`apps/axiom-freedom/Dockerfile`)
  and legacy root `Dockerfile` copy lists.
- Re-synced the legacy root `Dockerfile` file list with the real portal app
  and added a comment plus a `docs/RAILWAY_DEPLOYMENT.md` note explaining its
  legacy status and asking an operator with Railway dashboard access to
  confirm whether it is still referenced by any service.
- Added regression tests for every fixed route (trailing slash and
  not-yet-available body text) to `apps/axiom-freedom/test/axiom-proxy.test.js`.

## Evidence and boundary

Local validation: AXI engine 76/76, protected portal 1/1 (extended with the
new route assertions), AXI.Core 5/5. Docker is unavailable in this local
environment, so the two Dockerfiles were verified by direct, exhaustive
comparison against `server.js`'s route table and the files present in
`apps/axiom-freedom/`, not by a local image build. No scheduler, task,
deployment, endpoint probe, DNS/TLS setting, account, credential, payment,
message, publication, or external integration was activated. Whether the live
Railway `axiom-web` service currently builds the documented
`apps/axiom-freedom/Dockerfile` or the legacy root `Dockerfile` was not and
cannot be confirmed from this session; that requires an operator with Railway
dashboard access.
