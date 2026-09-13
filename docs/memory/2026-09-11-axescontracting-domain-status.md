# axescontracting.com DNS-cutover status and xiiom.com route check

**Date:** 2026-09-11
**Context:** The founder asked whether AXI agents/command-center operation
might run from `axescontracting.com` instead of `xiiom.com`, since
`axescontracting.com` "was to be" the main command center. Separately, the
founder listed four expected `xiiom.com` routes (`/admin`, `/support`,
`/axiom`, `/automation`) to check.

## `xiiom.com` route check (verified 2026-09-11)

Live HTTP checks and a `server.js` code check both confirm all four routes
exist and behave as designed:

| Route | Live result | Design |
| --- | --- | --- |
| `/axiom` | `200` | Public AXIOM chat page — intentionally public |
| `/admin` | `401` | Redirects to `/support` after `requireAdmin` HTTP Basic Auth |
| `/support` | `401` | Protected Support Desk console, gated by `requireAdmin` |
| `/automation` | `401` | Protected automation console, gated by `requireAdmin` |

A `401` without credentials on the three protected routes is the intended
behavior, not a defect.

## `axescontracting.com` status (verified 2026-09-11)

`RAILWAY_DEPLOYMENT.md` documents `axescontracting.com` as the intended
custom domain for the same `axiom-web` Railway service that serves
`xiiom.com`, and `DOMAIN_PORTFOLIO.md` lists connecting it as an "immediate
domain task." Live verification shows this was never completed:

- `Resolve-DnsName axescontracting.com` and the `www` variant both return
  `35.215.76.145` — a different IP than `xiiom.com`'s `69.46.46.87`.
- The SOA record names `ns1.siteground.net` as the authority — this is the
  legacy SiteGround shared hosting that `RAILWAY_DEPLOYMENT.md`'s own
  opening line says Railway replaced ("SiteGround GrowBig shared hosting
  cannot run long-lived Docker services").
- HTTPS to `axescontracting.com` fails with `SEC_E_CERT_EXPIRED` (expired
  server certificate).
- Plain HTTP returns `200`, meaning SiteGround is still serving some legacy
  content there — the domain is not blank/parked, just not the AXIOM
  portal, and insecure over HTTPS.

**Conclusion:** the founder's recollection is correct — `axescontracting.com`
was intended as the main hub/command-center domain — but it currently is
not connected to Railway and does not serve the portal. Fixing this needs an
operator with both Railway dashboard access (to add the custom domain to
`axiom-web`) and SiteGround/registrar DNS access (to repoint the A/CNAME
record), per the existing steps in `RAILWAY_DEPLOYMENT.md` Section 4. This
cannot be completed from repository access alone.

## What was changed

- `docs/RAILWAY_DEPLOYMENT.md`: "Current deployment state" now records the
  verified `xiiom.com` route results and the `axescontracting.com` DNS/TLS
  findings.
- `docs/AXES_TIER_1_DECISION_REGISTER.md`: the existing P2 "Connect AXES
  Contracting domain" row now carries this concrete verification evidence.

## Related records

- `docs/RAILWAY_DEPLOYMENT.md`
- `docs/DOMAIN_PORTFOLIO.md`
- `docs/AXES_TIER_1_DECISION_REGISTER.md`
- `apps/axiom-freedom/server.js`
- `docs/memory/2026-09-11-portal-route-and-legacy-dockerfile-review.md`
