# 2026-09-12 AXIOM chat backend failure diagnosed (frontend up, engine unreachable)

**Status:** Root cause narrowed to a portal-to-engine connectivity/deployment
issue; confirmed reproducible; not fixable from this session (no Railway
access)

## What was reported

The founder repeated several times across this session that "AXI"/AXIOM is
"still down" or "offline," while earlier checks in this same session only
confirmed that `xiiom.com`'s routes load (root, `/axiom`, `/library/`) and
that `/support` correctly requires authentication. Those checks were
insufficient: they confirmed the page loads, not that chat actually works.

## What was actually checked this time

Using the already-open "axiom-public-chat" browser panel (`xiiom.com/axiom`),
`read_page` showed the live page already contained two failed attempts
("hello", "axi?"), each answered with a hardcoded fallback: "AXIOM is
currently unavailable. Please try again shortly." A further live test
message ("status check") sent through the same panel reproduced the
identical failure a third time — a 100% failure rate on real chat messages,
even though the page itself loads normally and shows a "● LIVE" badge.

## Root cause (by source inspection)

The exact fallback string does not exist anywhere in the current feature
branch, but was found in the documented production branch
(`axaxiaxes-axiom-monorepo`) at
`apps/axiom-freedom/axiom_web_interface.html`: the page's `sendMessage()`
posts to `POST /api/axiom`, and any non-OK response or fetch failure falls
through to that generic message — it does not distinguish "the engine
service is unreachable" from "the engine responded with an error."

The portal (`apps/axiom-freedom/server.js`) proxies that request to a
separate private `axiom-engine` service via `AXIOM_ENGINE_URL` (defaulting to
`http://127.0.0.1:3000` if unset). A **uniform, 100%** failure rate across
every message is the expected signature of the portal being unable to reach
the engine at all — for example, the `axiom-engine` service not running, or
`AXIOM_ENGINE_URL` not correctly pointing at it in the live Railway
environment — rather than an intermittent or content-specific failure.

## Relevant existing work found

A separate branch, `origin/axaxiaxes-axiom-chat-diagnostics`, already exists
with exactly one commit not present in `axaxiaxes-axiom-monorepo`:
`45085a5 Improve AXIOM diagnostic transparency`, authored by the founder
(`Axel <info@axescontracting.com>`). It reworks `apps/axiom-freedom/server.js`
to categorize engine failures as `unreachable-private-engine` vs.
`engine-non-success-response` and surfaces the last failure on the
`/support` status page — exactly the visibility needed to confirm which
failure mode is occurring. It has no open pull request and, like this
branch's own work, has not been merged or deployed.

## What this session cannot do

This session has no Railway dashboard/API access and cannot inspect or
change the live `axiom-engine` service's running status, its environment
variables, or which branch Railway actually builds from. Per the standing
authority boundary, that remains the founder's action.

## Recommended next step (founder-controlled)

1. In the Railway dashboard, confirm the `axiom-engine` service is deployed
   and running (not crashed, sleeping, or missing), and confirm the portal
   service's `AXIOM_ENGINE_URL` environment variable points to that engine
   service's correct internal address.
2. Consider reviewing and merging `axaxiaxes-axiom-chat-diagnostics` (one
   small, additive, founder-authored commit) so the `/support` page reports
   the specific failure category instead of a generic "unavailable" message,
   making future diagnosis immediate instead of requiring a live reproduction
   like this one.

## Related records

- `docs/AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md`
- `docs/AXES_OBJECTIVES_CHECKPOINT.md`
- `docs/RAILWAY_DEPLOYMENT.md`
- `docs/memory/2026-09-11-xiiom-public-interaction-check.md`
