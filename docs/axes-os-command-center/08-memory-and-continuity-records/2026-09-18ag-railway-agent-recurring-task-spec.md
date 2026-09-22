# 2026-09-18 (ag): Ready-to-paste recurring Railway Agent task for AXIOM chat health

## What happened

The founder asked to "automate with railway ai." Since actually creating or
scheduling a Railway Task is an account-level dashboard action outside what
this repository/agent can perform, added a concrete, ready-to-paste
recurring-task specification to `docs/RAILWAY_DEPLOYMENT.md` for the
founder to create directly in Railway's Agent panel.

## Why this specific task design

Reviewed the founder's existing recurring health-check task (screenshot,
dated 2026-09-14): it only checks the portal page, DNS resolution, and web
presence — all of which report healthy even during the current chat outage
(item 0, `FOUNDER_ACTION_QUEUE.md`). That is exactly why it reported
"xiiom.com is UP and healthy" while the chat itself was returning HTTP 502
throughout. The new task specification explicitly adds the missing check:
a real `POST /api/axiom` with `action:"chat"`, which is the only request
that exercises the OpenAI-backed code path that has actually been failing.

The task specification also instructs the agent to read logs and report
the specific failure cause on a 502 (rather than just "down"), and
explicitly instructs it **not** to auto-redeploy, restart, or change
billing/environment settings — consistent with the existing
`docs/AXI_AUTOMATION_SERVICE.md` scheduler boundary (surface findings for
founder action, don't act automatically on infra/billing).

## What was NOT done

No Railway account/dashboard action was taken or attempted from this
session — no task was actually created or scheduled in Railway, since that
requires direct founder access to the Railway dashboard. This entry only
documents the recommended task text.

## Cross-references

- `docs/RAILWAY_DEPLOYMENT.md` ("Automating AXIOM chat health checks with a
  recurring Railway Agent task" section)
- `docs/keystone/PRODUCTION_INCIDENT_2026_09_18_CHAT_502.md`
- `docs/AXI_AUTOMATION_SERVICE.md` (scheduler boundary)
- `scripts/axiom-chat-health-check.vbs` (local double-click alternative)
- `docs/keystone/FOUNDER_ACTION_QUEUE.md` (item 0)
