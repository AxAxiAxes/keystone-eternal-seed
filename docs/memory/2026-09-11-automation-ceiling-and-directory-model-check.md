# 2026-09-11 Automation ceiling verification and directory-model check

**Status:** Verification completed; no code change required

## Automation ceiling is architectural, not a withheld setting

In response to a repeated request to remove all automation limits, this
confirms from the code and its governing documents (`docs/AXI_AUTOMATION_SERVICE.md`,
`docs/AXI_AUTOMATION_PROFILES.md`, `apps/axiom-engine/automation-service.js`,
`apps/axiom-engine/automation-profile-service.js`) that there is no "no limits"
mode to enable, for AXI or for an operator acting through the console:

- The automation service accepts only a fixed, versioned action allowlist
  (`memory.record`, `automation.noop`, `monitoring.snapshot`,
  `governance.readiness`, `recovery.backup`, `coordinate.record`,
  `continuity.checkpoint`, `continuity.record`, `source.catalog`,
  `business.metric`, `service.registry`). It rejects any unrecognized action.
  None of these reach a deployment, account, DNS, payment, or messaging
  system.
- An Automation Profile only moves from `draft` to `active` through an
  authenticated founder-controlled process with an explicit `confirmed: true`
  step; it "never enables the scheduler and cannot reactivate itself."
- Profiles "do not themselves deploy, access accounts, send messages,
  publish, spend, accept payments, collect data, or make financial or legal
  decisions" (`docs/AXI_AUTOMATION_PROFILES.md`).

Removing this ceiling would mean rewriting the safety architecture itself, not
adjusting a policy this session is choosing to enforce. That change is out of
repository-only, reversible, agent-level authority and was not made.

## Directory data-model check against current FTC guidance

Cross-checked `docs/AXES_DIRECTORY_DATA_MODEL.md` against current FTC
Endorsement Guide expectations for directory-style listings (16 CFR Part 255):
avoid formatting, labels, or badges that imply the directory operator
evaluated or recommends a listed business, and disclose any paid placement or
incentivized review. The existing data model already restricts pilot fields to
business name, track, category, service area, website, and public contact
method; explicitly states "a listing is neither an endorsement nor a
verification of identity, licensing, insurance, quality, availability,
property value, or professional suitability"; and defines no rating, review,
badge, or paid-placement field. No listing or review/rating mechanism exists
yet to carry a disclosure obligation. No change was needed; this is a
point-in-time confirmation, not a legal compliance opinion, and any future
rating, review, or paid-placement feature must repeat this check with counsel
before launch.

## Boundary

This entry records verification only. It creates no session, task, profile,
or external configuration, and does not change repository-controlled
automation behavior.
