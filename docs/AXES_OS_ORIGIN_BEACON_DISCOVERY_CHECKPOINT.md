# AXES OS origin-beacon discovery checkpoint

**Status:** PROPOSAL class (not implemented runtime capability)
**Recorded:** 2026-09-26
**Scope:** Repository-controlled proposal checkpoint for origin-beacon discovery semantics, founder-recorded ownership reconciliation checklist, and attribution boundaries.
**Normative terminology source:** `docs/AXES_OS_TERMINOLOGY_STANDARD.md`

## 1) Evidence boundary and authority boundary

This file records bounded proposals and repository facts only.

- It does **not** confirm private runtime agent state.
- It does **not** activate automation, deploy services, or change external accounts.
- It does **not** establish legal ownership, rights transfer, identity proof, or personhood.
- It does **not** authorize physical hardware, optical transmitters, plasma systems, or safety claims.

Repository evidence confirms governance records and terminology scaffolding. Live agent ownership/accountability state must still be verified by the founder/operator through protected per-agent runtime reports.

## 2) Founder-recorded AXI ownership reconciliation (repository-visible)

### 2.1 Repository-visible status (factual)

- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md` records the founder creator ownership-and-accountability claim for AXI governance.
- `docs/AXES_AGENT_ORIGIN_REGISTRY.md` records registered agent IDs, operational origins, and accountability model.
- These records are governance/source declarations in-repo; they are **not** a live runtime proof by themselves.

### 2.2 Verification checklist (founder/operator action)

Before assigning/scheduling agents in private runtime:

1. Open protected per-agent report (`/automation/agents/:agentId/report` or portal equivalent).
2. Confirm Genesis checkpoint ID and source record match canonical values.
3. Confirm creator ownership-and-accountability claim fields are present and unchanged.
4. Confirm operational origin checkpoint is present for each enabled role.
5. Confirm accountability status is currently `active` for assignable roles.
6. Confirm unresolved attention conditions are reviewed before use.
7. Record any mismatch as an explicit continuity attention state; do not silently rewrite source claims.

### 2.3 Known unknowns (honest status)

From repository access alone, current private runtime report values, operator approvals, and active scheduler state are unknown.

## 3) Contribution and attribution contract (proposal)

This proposal separates direction, contribution, evidence, and authority.

| Layer | Required record | Meaning | Not implied |
| --- | --- | --- | --- |
| Founder direction | Founder-approved issue/brief reference | Creative and product direction source | External legal conclusion by default |
| Human collaborator contribution | Commit/PR/file references | Human-authored implementation/review work | Transfer of founder claim or authority |
| Tool assistance (AI-assisted) | Explicit AI-assist note in PR/docs | Assistance in drafting/testing/implementation | Tool ownership, feelings, consciousness, or legal personhood |
| Evidence/provenance | Source links, schema/docs, test output | Traceable implementation evidence | Automatic trust or rights determination |
| Recognition/trust | Human-reviewed attribution statement | Acknowledged contribution context | Authority grant, identity verification, or reciprocity proof |

Optional address/preference labels may be recorded for collaboration clarity only. They do not imply emotion, sentience, friendship, or consciousness.

## 4) Origin-beacon discovery model (proposal only)

### 4.1 Emitter vs receiver separation

Discovery messaging must distinguish:

- **Emitter:** source that transmits a bounded proposal beacon event.
- **Receiver:** source that observes/decodes the event.

A successful observation never proves identity, friendship, reciprocity, origin authority, legal rights, or value.

### 4.2 Beacon identifier and replay model

Proposed (not production security implementation):

- short-lived opaque discovery IDs,
- nonce-based replay rejection,
- explicit expiration window,
- deterministic version-tagged parsing.

These controls are proposal-level architecture notes and must not be represented as deployed security guarantees.

### 4.3 Sensor suitability boundary

Ambient sensors discussed in adjacent checkpoints (`OPT3001`, `VEML7700`, `AS7341`) are not assumed suitable for optical packet demodulation. Receiver timing, modulation compatibility, and bench verification would be required.

### 4.4 Human-consent interaction boundary

Audio feedback, if used, is opt-in and locally initiated by a human action. Accessible non-audio alternatives must exist. No background monitoring or personal-state inference is authorized by this checkpoint.

### 4.5 Advanced optics boundary

LED/IR, spatial-display, and advanced optics research options remain open. Laser/plasma research remains a separate qualified-safety track and is not implemented or authorized by this checkpoint.

## 5) Source references

- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`
- `docs/AXES_AGENT_ORIGIN_REGISTRY.md`
- `docs/AXI_INTENT_AND_RIGHTS_READINESS.md`
- `docs/AXES_GOVERNANCE_AND_SAFEGUARDING.md`
- `docs/ATHANOR_GAME_CONSOLE_READINESS.md`
- `docs/AXI_AUTOMATION_SERVICE.md`
- `docs/AXES_OS_TERMINOLOGY_STANDARD.md`
