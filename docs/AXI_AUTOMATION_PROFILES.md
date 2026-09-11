# AXI Automation Profiles contract

**Status:** Private founder-controlled foundation
**Version:** `axi-automation-profile-v1`

Automation Profiles are immutable, hash-linked private records persisted as
`automation-profiles.jsonl` in the AXI data directory. They are internal
schedule definitions, not autonomous agents or authority grants.

## Starter and founder-configured templates

`operations-observation` remains the starter profile. Its two fixed task definitions
are explicitly assigned to the existing `operations-observer` role:

| Action | Safe recurrence |
| --- | --- |
| `monitoring.snapshot` | 5 minutes through 24 hours |
| `governance.readiness` | 60 minutes through 7 days |

`founder-configured` provides an extensible, protected configuration path for
every active registered AXI software role and its existing allowlisted
capabilities. Its source matrix exposes only active roles and compatible
actions. Each bounded task template has a safe key, compatible assigned role,
recurrence, existing-task UUID dependencies, explicit approval requirement,
and action-specific structured payload. Unsupported fields, sensitive
free-form content, incompatible roles/actions, and arbitrary execution
capabilities are rejected.

## Lifecycle and control

An authenticated founder-controlled operational process creates a `draft`.
An explicit `confirmed: true` activation moves it to `active`, creates the
two recurring tasks once, and records their durable IDs in the hash-linked
profile audit. An explicit confirmation can move an active profile to
`paused`. A later, separately confirmed resume requires the same readiness,
role-capability, and immutable task-association checks before it moves the
profile back to `active`; it never creates replacement tasks. Paused
profile-managed tasks remain retained but are not processed; their history and
unrelated tasks are unchanged. A profile never enables the scheduler and
cannot reactivate itself.

Activation requires ready startup context, source catalog, submitted business
metrics, service registry when initialized, and governance state. Recovery
readiness is surfaced in the active profile audit but is not required to
create a draft. `ready` recovery only means the latest private bundle was
locally hash-verified; it is not production-readiness proof.

Type/schema/compatibility validation and tamper evidence preserve
implementation integrity; they do not limit founder authority to define
additional explicitly approved metadata contracts in a versioned update.
Any malformed or hash-invalid profile record becomes an attention state and
blocks manual and scheduler processing. The profile file is included in
checkpoints and private recovery bundles.

## Private routes

The private engine exposes `GET` and `POST /automation/profiles`, plus
`POST /automation/profiles/:profileId/activate`, `/pause`, and `/resume`. The protected
portal proxies these routes only under `/api/automation/profiles`; there is no
public route or generic engine proxy.

Profiles cannot deploy, access accounts, send messages, publish, spend, accept
payments, collect data, or make financial or legal decisions.
