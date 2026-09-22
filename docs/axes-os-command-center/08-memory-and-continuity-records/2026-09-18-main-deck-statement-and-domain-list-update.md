# Founder Main Deck statement, expanded SiteGround domain list, and live check

**Date:** 2026-09-18

## Founder statement

The founder stated that `axescontracting.com` is the main AXIOM chat and the
"everything combined" hub — the "Main Deck" they operate from — with multiple
branches (products/sites) being built simultaneously under Axes Contracting
Inc. They then pasted a SiteGround registrar domain list (apparently cut off
mid-list at `axaxes.com`, whose status/expiry were not captured).

## Prior repository record vs. new statement

`docs/DOMAIN_PORTFOLIO.md` (recorded 2026-09-09) characterized
`axescontracting.com` as a **private, admin-only** AXES command center, with
`xiiom.com` as the **public** home of the AXIOM chat. The founder's new
statement describes `axescontracting.com` as the main combined/public
operating site instead. This is recorded as a stated discrepancy, not
resolved in either direction — see the live check below.

## Live verification performed (2026-09-18)

- `https://xiiom.com/health` → reachable,
  `{"status":"ok","service":"AXIOM","version":"2.0.0"}`.
- `https://axescontracting.com/health` and `https://axescontracting.com/` →
  both failed with a transport-level failure (DNS/connection/TLS) from this
  environment's fetch tool. No content was served — not an auth wall, no
  response at all.

This does not confirm whether `axescontracting.com` is genuinely not live,
blocked to this specific tool, or describes an intended future state rather
than the current deployment. Recommend the founder verify directly (browser
or Railway dashboard).

## Domain inventory update

`docs/DOMAIN_PORTFOLIO.md` was updated with a new "2026-09-18 update" section
recording the founder's newly reported SiteGround domains (13 with
"Verification required," 6 confirmed/verified including `axescontracting.com`
now with a Feb 3, 2029 expiry, and `axaxes.com` whose row was cut off before
capture). None have a defined product purpose yet; all remain parked per the
existing portfolio principle. No DNS, hosting, or privacy-setting changes were
made — those are registrar-side actions outside repository access.

## Open items

1. Confirm whether the founder's domain-list paste was complete or cut off
   after `axaxes.com`.
2. Confirm `axescontracting.com`'s actual current live status/content
   (unreachable from this environment).
3. Reconcile which of the 2026-09-09 domain list and the 2026-09-18 list are
   duplicates/typos of each other (e.g. `axaxaxu.com` vs. newly reported
   similar names) once the full list is confirmed.

## Related records

- `docs/DOMAIN_PORTFOLIO.md`
- `docs/memory/2026-09-18-axaxar-com-repo-and-architecture-draft.md`
