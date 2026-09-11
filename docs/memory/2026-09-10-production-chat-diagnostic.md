# 2026-09-10 production chat diagnostic

**Status:** Configuration blocker identified; repository response improved

## Evidence

On 2026-09-10, the public XIIOM health endpoint returned HTTP 200 and a
side-effect-free `analyze` command successfully reached the private engine
through the public proxy. A chat request returned a generic unavailable
response.

The deployment runbook identifies the current production blocker:
`OPENAI_API_KEY` has not yet been configured as an encrypted variable on the
private Railway `axiom-engine` service. No secret was requested, displayed, or
stored in the repository.

## Repository change

The portal now returns HTTP 503 with `AXIOM chat is not configured` when the
private engine reports a missing provider configuration. It keeps other
provider and engine errors generic. The chat page displays that returned
status rather than replacing it with a generic outage message.

## Restart recovery requirement

After an authorized deployment or service restart, reconcile AXI Genesis and
agent accountability through the protected console before enabling or
processing automation. Then verify the provider configuration with one
authorized live chat request.

## Supporting records

- `apps/axiom-freedom/server.js`
- `apps/axiom-freedom/axiom_web_interface.html`
- `docs/RAILWAY_DEPLOYMENT.md`
- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`
