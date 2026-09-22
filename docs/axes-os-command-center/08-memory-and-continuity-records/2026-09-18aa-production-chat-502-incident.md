# 2026-09-18 (aa) — Live production incident: AXIOM chat returning HTTP 502

## What happened

The founder shared a screenshot showing the live `xiiom.com/axiom` chat
still answering "Today's date is June 14, 2024" — the exact stale-date
bug the identity/date fix (PR #95, merged earlier the same day) targeted.
Investigating this live, independent testing of the production endpoint
found something worse: **every chat request currently returns HTTP 502
`"AXIOM chat is temporarily unavailable"`** (6 consecutive attempts over
roughly 10 minutes), while the portal page and the engine's memory/history
endpoint both respond normally (200).

## Investigation performed

- Confirmed `apps/axiom-engine/chat-service.js` and `system-prompt.js` on
  `origin/axaxiaxes-axiom-monorepo` are correct and unchanged from the
  merged fix — dynamic date injection and the AXIOM identity prompt are
  both present in the outgoing request on every call.
- Ran the full `axiom-engine` test suite: 122/122 pass — rules out a code
  regression from this repository's own recent merges.
- Isolated the failure to the OpenAI-backed chat call specifically:
  `GET /api/axiom/history` (forwarded to the same private `axiom-engine`
  service) succeeds, so the engine process itself is reachable and
  running; only the outbound call to `api.openai.com` is failing.

## Document created

`docs/keystone/PRODUCTION_INCIDENT_2026_09_18_CHAT_502.md` — full
incident record with the observed symptoms, what was ruled out, and the
most likely (unconfirmed) causes: an invalid/rotated/rate-limited
`OPENAI_API_KEY`, an OpenAI-side billing/quota/model issue, or the
already-flagged Railway trial-credit exhaustion from
`docs/RAILWAY_DEPLOYMENT.md` (observed low on 2026-09-12).

## Founder-only next step

None of the likely causes can be confirmed or fixed from this repository
— all require Railway dashboard or OpenAI account access. Added as
**urgent item 0** in `docs/keystone/FOUNDER_ACTION_QUEUE.md`, ahead of the
existing Railway-billing item it likely shares a root cause with.

## Not done (correctly)

No code changes were made to "fix" this blind, since the code is verified
correct and the failure is external (account/infra-side). Guessing at a
code change here would risk masking the real problem instead of
surfacing it for founder action.

## Cross-references

- `docs/keystone/PRODUCTION_INCIDENT_2026_09_18_CHAT_502.md`
- `docs/keystone/FOUNDER_ACTION_QUEUE.md` (item 0)
- `docs/RAILWAY_DEPLOYMENT.md`
- PR #95
