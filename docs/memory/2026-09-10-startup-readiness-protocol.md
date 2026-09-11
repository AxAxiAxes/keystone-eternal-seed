# 2026-09-10 startup readiness protocol

**Status:** Active repository operating protocol

**Scope:** AXES project-management work after agent or operator startup, reset,
handoff, or lost context.

## Decision

The repository now has a root `AGENTS.md` that requires a contextual readiness
review before work resumes. It directs agents and operators to inspect current
project state, read applicable operating records, identify the exact task and
acceptance evidence, and distinguish repository-controlled work from external
account actions.

## Boundary

The protocol does not certify an agent or operator as professionally qualified.
It explicitly prohibits unsupported legal, financial, professional, identity,
security, safety, property, licensing, insurance, privacy, or personnel
determinations. External or consequential actions remain subject to authorized
human control and, where appropriate, qualified professional review.

For AXI/XIIOM restarts, the protocol requires private monitoring to be enabled
and reviewed before the bounded scheduler is enabled. It preserves the existing
allowlist and prevents a restart from being treated as authority for third-party
actions.

## Supporting records

- `AGENTS.md`
- `docs/AXI_AUTOMATION_SERVICE.md`
- `docs/RAILWAY_DEPLOYMENT.md`
- `PROJECT_TIMELINE.md`
