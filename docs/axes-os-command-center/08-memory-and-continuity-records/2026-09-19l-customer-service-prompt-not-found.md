# 2026-09-19l — "Customer service prompt" referenced but not found in the repo

## What happened

Founder: "what logic did you follow, bring up my prompt for customer
service should have been loaded into your persistent memory."

Searched this repository thoroughly for anything matching "customer
service prompt" or a similarly named document:

- `grep -i "customer service"` across the whole repo — matched only
  unrelated files (`AXES_SERVICE_REGISTRY.md`, `service-registry-service.js`,
  automation UI text, a couple of `keystone/` intel/record files) — none of
  which is a customer-service prompt.
- `glob` for `*customer*service*` — no file matched at all.
- Broader search for "customer-facing"/"client-facing"/"support prompt" —
  matched several existing readiness docs (design/materials consultation
  intake template, Axaxar launch plan, founder revenue overlay, etc.), none
  of which is the specific artifact being referenced.

## Honest conclusion

No document, memory record, or code comment in this repository matches
"customer service prompt." This means one of:

1. It was given in a different session/conversation whose output was never
   committed to this repo (sessions do not share memory unless something
   is actually written to a tracked file — this is a known, explicit
   limitation, not new).
2. It was mentioned in this project's history but I failed to capture and
   persist it at the time — a real process gap if so.
3. It refers to an existing doc under a name I'm not matching (e.g. the
   AXIOM identity/system prompt work, or a consultation intake template)
   that the founder is calling by a different label than what's on file.

Rather than fabricate content to fill this gap (which would be worse than
admitting the gap), asked the founder directly to re-supply the exact
prompt text or point to where it was originally given. The founder was
unavailable to respond immediately; recorded as `FOUNDER_ACTION_QUEUE.md`
item #15 so it isn't lost, and this memory record documents the search
performed so a future session doesn't have to repeat it from scratch.

## Accountability note (per `AGENT_SERVICE_DELIVERY_PROTOCOL.md`)

This is exactly the kind of gap that protocol's self-rating/accountability
step exists to surface honestly rather than paper over. If this was a
capture failure on my part in an earlier session, that is a real mistake;
if it was given in a session whose work was never persisted, that is a
structural limitation of session isolation that should be called out to
the founder plainly (as done here) rather than assumed away.

## Reference

- `docs/keystone/FOUNDER_ACTION_QUEUE.md` (item #15)
- `docs/keystone/AGENT_SERVICE_DELIVERY_PROTOCOL.md`
