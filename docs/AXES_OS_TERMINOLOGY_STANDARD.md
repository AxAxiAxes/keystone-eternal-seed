# AXES OS terminology standard (controlled vocabulary)

**Status:** Active terminology standard
**Recorded:** 2026-09-25
**Scope:** Repository-controlled vocabulary governance for UX/UI light discovery, meaning science, recognition registry, identity, and origin.

## 1) Purpose and authority

This document is the **single canonical terminology standard** for the AXES OS engineering scope.

It defines a **controlled vocabulary**: versioned, reviewable, machine-mappable terms used in architecture, telemetry, registry, policy, and audit records.

It is **not** free-form narrative language. Creative/symbolic language may exist in other records, but operational engineering documents and implementations must map to this standard.

Enforcement boundary:

- The normative \"must\" rules below are active authoring/governance requirements for repository contributors now.
- Full automated CI/schema enforcement is planned and not yet fully active (see Section 11).

## 2) Terminology lifecycle states

Every term record must carry one lifecycle state:

- `proposed` — drafted, not yet approved for normative use.
- `reviewed` — technically reviewed for consistency and boundary compliance.
- `adopted` — approved for active use in architecture/docs/telemetry.
- `deprecated` — still recognized for compatibility; not used for new records.
- `superseded` — replaced by a successor term; retained only for historical traceability.

State transitions must be dated and attributable in continuity records.

## 3) Evidence classes (required tagging)

Every term must declare exactly one `evidenceClass`:

1. `repository-implemented-fact`
2. `external-research-evidence`
3. `keystone-proposal`

Rules:

- `keystone-proposal` terms **must not** be presented as deployed capability.
- Hardware/datasheet dependent terms must set `verificationRequired: true` until validated in target runtime.
- Mixed claims must be split into separate term records by evidence class.

## 4) Domain model and hierarchy

Term hierarchy shape is fixed:

`Domain -> Category -> Term -> Token`

`category` values are controlled vocabulary entries managed by this standard, but
they are intentionally extensible over time (with lifecycle controls), so the
schema validates category structure while category enumerations are maintained
in versioned terminology records.

Required engineering domains:

1. **UX/UI interaction**
   - view, signal, cue, transition, state, feedback
2. **Light observation**
   - raw, lux, spectral, sampling window, confidence, calibration state
3. **Sequencer/resequencer**
   - ordering, replay, correction, provenance chain
4. **Recognition/registry**
   - entry, manifest, capability, policy decision, audit event
5. **Identity/origin**
   - origin record, attribution claim, operational provenance, accountability status

## 5) Machine-readable term contract

Each term must conform to this normalized contract.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AXES OS Terminology Term Record v1",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "termId",
    "label",
    "domain",
    "category",
    "definition",
    "engineeringMeaning",
    "notThisBoundary",
    "allowedContexts",
    "nonAllowedContexts",
    "dataMapping",
    "governanceImplication",
    "runtimeEffectClass",
    "requiredControls",
    "evidenceClass",
    "version",
    "status",
    "verificationRequired",
    "lastReviewedAt"
  ],
  "properties": {
    "termId": {"type": "string", "pattern": "^[a-z0-9.-]+$"},
    "label": {"type": "string", "minLength": 1},
    "domain": {
      "type": "string",
      "enum": [
        "ux-ui-interaction",
        "light-observation",
        "sequencer-resequencer",
        "recognition-registry",
        "identity-origin"
      ]
    },
    "category": {"type": "string", "minLength": 1},
    "aliases": {
      "type": "array",
      "items": {"type": "string"},
      "uniqueItems": true
    },
    "definition": {"type": "string", "minLength": 1},
    "engineeringMeaning": {"type": "string", "minLength": 1},
    "notThisBoundary": {"type": "string", "minLength": 1},
    "allowedContexts": {
      "type": "array",
      "items": {"type": "string"},
      "minItems": 1
    },
    "nonAllowedContexts": {
      "type": "array",
      "items": {"type": "string"},
      "minItems": 1
    },
    "dataMapping": {
      "type": "object",
      "additionalProperties": false,
      "required": ["eventFields", "tokenNamespaces"],
      "properties": {
        "eventFields": {
          "type": "array",
          "items": {"type": "string"}
        },
        "tokenNamespaces": {
          "type": "array",
          "items": {"type": "string"}
        }
      }
    },
    "governanceImplication": {
      "type": "object",
      "additionalProperties": false,
      "required": ["authorization", "consent", "retention", "audit"],
      "properties": {
        "authorization": {"type": "string"},
        "consent": {"type": "string"},
        "retention": {"type": "string"},
        "audit": {"type": "string"}
      }
    },
    "runtimeEffectClass": {
      "type": "string",
      "enum": ["none", "informational", "decision-support", "policy-affecting", "access-controlling"]
    },
    "requiredControls": {
      "type": "array",
      "minItems": 0,
      "items": {
        "type": "string",
        "enum": [
          "discovery-not-authorization",
          "deny-by-default",
          "least-privilege",
          "explicit-consent",
          "signed-manifest",
          "revocation",
          "audit-hook",
          "platform-enforcement"
        ]
      },
      "uniqueItems": true
    },
    "evidenceClass": {
      "type": "string",
      "enum": [
        "repository-implemented-fact",
        "external-research-evidence",
        "keystone-proposal"
      ]
    },
    "evidenceRefs": {
      "type": "array",
      "items": {"type": "string"},
      "minItems": 0
    },
    "verificationRequired": {"type": "boolean"},
    "version": {"type": "string", "pattern": "^v[0-9]+(\\.[0-9]+){0,2}$"},
    "status": {
      "type": "string",
      "enum": ["proposed", "reviewed", "adopted", "deprecated", "superseded"]
    },
    "supersedes": {"type": "string"},
    "supersededBy": {"type": "string"},
    "changeRationale": {"type": "string"},
    "lastReviewedAt": {
      "type": "string",
      "pattern": "^(\\d{4}-\\d{2}-\\d{2}|\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z)$"
    }
  },
  "allOf": [
    {
      "if": {
        "properties": {
          "runtimeEffectClass": {"const": "none"}
        }
      },
      "then": {
        "required": ["requiredControls"],
        "properties": {
          "requiredControls": {
            "type": "array",
            "maxItems": 0
          }
        }
      },
      "else": {
        "required": ["requiredControls"],
        "properties": {
          "requiredControls": {
            "type": "array",
            "minItems": 1
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "evidenceClass": {
            "enum": ["repository-implemented-fact", "external-research-evidence"]
          }
        }
      },
      "then": {
        "required": ["evidenceRefs"],
        "properties": {
          "evidenceRefs": {
            "type": "array",
            "minItems": 1
          }
        }
      }
    }
  ]
}
```

Timestamp normalization rule:

- `lastReviewedAt` accepts either `YYYY-MM-DD` (date-only review record) or UTC
  timestamp `YYYY-MM-DDTHH:MM:SSZ` or `YYYY-MM-DDTHH:MM:SS.sssZ` (trailing `Z`).
- Offset timestamps (for example `+02:00`) are not used in this standard; convert
  to UTC `Z` before recording.

## 6) Versioned meaning-anchor token system

### 6.1 Token system

Canonical token namespace family:

- telemetry tokens: `light-semantic-v1/*`
- symbolic vocabulary tokens: `symbolic-semantic-v1/*`

Operational telemetry must use telemetry tokens only. Symbolic vocabulary must not be used as a runtime substitute for measurement semantics.

### 6.2 Deterministic token rule

A token must map to one and only one engineering meaning per schema version.

- No token may have dual meanings in one version.
- Meaning changes require either:
  - new token name, or
  - major schema version bump.
- Minor/patch version increments are allowed only for non-semantic changes
  (editorial clarifications, metadata additions that do not alter token meaning).

### 6.3 Baseline token groups

- `lux.band.{very_low|low|mid|high|very_high}`
- `spectrum.band.{violet|blue|green|amber|red|nir}`
- `transition.{rise|fall|pulse|stable}`
- `confidence.{low|medium|high}`
- `calibration.{uncalibrated|factory|field|invalid}`
- `temporal.{before|during|after|coincident}`

See compact glossary: `docs/AXES_OS_TERMINOLOGY_TOKEN_GLOSSARY.md`.

## 7) Policy and constitutional bindings

These controls are mandatory for terms with runtime effects:

1. **Discovery is not authorization.**
2. **Deny by default** for data access and capability use.
3. **Least privilege** by scope, rate, history depth, and actor.
4. **Consent triggers** for historical streams or elevated-rate access.
5. **Signed manifests** for registry-facing metadata.
6. **Revocation support** for capabilities and grants.
7. **Audit hooks** for read/transform/replay/correction decisions.
8. **Platform enforcement** required; documentation text alone is not enforcement.

Canonical control-policy sources for these controls (not the full terminology
reference set):

- `docs/AXI_AUTOMATION_SERVICE.md`
- `docs/AXES_GOVERNANCE_AND_SAFEGUARDING.md`
- `docs/AXES_PLATFORM_PLAN.md`
- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`
- `docs/AXES_AGENT_ORIGIN_REGISTRY.md`
- `docs/AXES_OS_SCIENCE_ENGINEERING_LIGHT_SENSING_CHECKPOINT.md`
- `docs/AXES_OS_TERMINOLOGY_TOKEN_GLOSSARY.md`

Encoding rule:

- `runtimeEffectClass: none` must keep `requiredControls` empty.
- Any other `runtimeEffectClass` must explicitly list applicable `requiredControls`.
- `access-controlling` terms should include all controls; if an exception is needed,
  track it in continuity/governance records outside this term schema contract.

## 8) Standardized term set (v1 baseline)

> Note: This baseline sets the canonical term IDs and meanings. Most are `keystone-proposal` unless explicitly tied to repository-implemented controls.

### 8.1 UX/UI interaction terms

| Term ID | Label | Engineering meaning | Not this / boundary | Evidence class | Status |
|---|---|---|---|---|---|
| `ux.view` | View | A bounded presentation context showing state and signals. | Not identity proof or authorization grant. | `keystone-proposal` | `proposed` |
| `ux.signal` | Signal | Machine-generated indicator derived from event/state transitions. | Not emotional/medical inference. | `keystone-proposal` | `proposed` |
| `ux.cue` | Cue | Human-facing hint derived from validated signals. | Not policy decision itself. | `keystone-proposal` | `proposed` |
| `ux.transition` | Transition | Deterministic state change between UI states with timestamp order. | Not an implicit consent action. | `keystone-proposal` | `proposed` |
| `ux.state` | State | Explicit, enumerable UI mode. | Not hidden model state claimed without trace. | `keystone-proposal` | `proposed` |
| `ux.feedback` | Feedback | User- or system-generated response artifact attached to an interaction. | Not automated adjudication. | `keystone-proposal` | `proposed` |

### 8.2 Light observation terms

| Term ID | Label | Engineering meaning | Not this / boundary | Evidence class | Status |
|---|---|---|---|---|---|
| `light.raw` | Raw measurement | Sensor-native units before normalization. | Not cross-device comparable alone. | `keystone-proposal` | `proposed` |
| `light.lux` | Lux estimate | Illuminance value derived from calibrated ambient channels. | Not absolute truth without calibration provenance. | `external-research-evidence` | `reviewed` |
| `light.spectral` | Spectral band vector | Wavelength-bucketed readings with channel metadata. | Not color meaning inference by itself. | `keystone-proposal` | `proposed` |
| `light.sampling-window` | Sampling window | Defined time interval over which samples are aggregated. | Not unlimited background collection. | `keystone-proposal` | `proposed` |
| `light.confidence` | Confidence | Quantized trust level for normalized output given quality checks. | Not certainty claim. | `keystone-proposal` | `proposed` |
| `light.calibration-state` | Calibration state | Calibration provenance/validity class for a measurement path. | Not a guarantee of hardware accuracy. | `keystone-proposal` | `proposed` |

### 8.3 Sequencer/resequencer terms

| Term ID | Label | Engineering meaning | Not this / boundary | Evidence class | Status |
|---|---|---|---|---|---|
| `seq.ordering` | Ordering | Deterministic ordering function over timestamped events. | Not retrospective fact deletion. | `keystone-proposal` | `proposed` |
| `seq.replay` | Replay | Rebuild normalized timeline from immutable source events. | Not silent mutation of originals. | `keystone-proposal` | `proposed` |
| `seq.correction` | Correction | Attributable adjustment metadata for prior sequencing output. | Not hidden overwrite. | `keystone-proposal` | `proposed` |
| `seq.provenance-chain` | Provenance chain | Linked lineage from raw capture through normalization outputs. | Not legal ownership conclusion. | `keystone-proposal` | `proposed` |

### 8.4 Recognition/registry terms

| Term ID | Label | Engineering meaning | Not this / boundary | Evidence class | Status |
|---|---|---|---|---|---|
| `reg.entry` | Registry entry | Structured metadata record describing an item/capability. | Not execution permission alone. | `repository-implemented-fact` | `adopted` |
| `reg.manifest` | Manifest | Signed/structured declaration set for discovery and validation. | Not trust without verification. | `keystone-proposal` | `proposed` |
| `reg.capability` | Capability | Scoped action descriptor used by policy controls. | Not wildcard authority by default. | `repository-implemented-fact` | `adopted` |
| `reg.policy-decision` | Policy decision | Attributable allow/deny result with reason. | Not undocumented auto-allow. | `repository-implemented-fact` | `adopted` |
| `reg.audit-event` | Audit event | Immutable record of materially relevant decision/action. | Not optional for sensitive operations. | `repository-implemented-fact` | `adopted` |

### 8.5 Identity/origin terms

| Term ID | Label | Engineering meaning | Not this / boundary | Evidence class | Status |
|---|---|---|---|---|---|
| `origin.record` | Origin record | Versioned source/provenance reference for an entity or artifact. | Not automatic legal determination. | `repository-implemented-fact` | `adopted` |
| `origin.attribution-claim` | Attribution claim | Declared creator/accountability claim with traceable source. | Not independent verification of legal rights. | `repository-implemented-fact` | `adopted` |
| `origin.operational-provenance` | Operational provenance | Runtime lineage facts: created/registered/assigned/run metadata. | Not cognition/personhood claims. | `repository-implemented-fact` | `adopted` |
| `origin.accountability-status` | Accountability status | Active/suspended status in governed assignment model. | Not self-approval authority. | `repository-implemented-fact` | `adopted` |

## 9) Stable IDs, aliases, deprecation, migration

### 9.1 Stable ID rules

- `termId` is immutable once `adopted`.
- Display labels may evolve; `termId` must not.

### 9.2 Alias policy

- Aliases are compatibility helpers only.
- Parsers/UI must emit canonical `termId` and token values.

### 9.3 Deprecation map (initial)

| Legacy/ambiguous phrase | Canonical replacement | State |
|---|---|---|
| "resequencer" (unqualified) | `seq.ordering` or `seq.correction` (explicit context required) | `reviewed` |
| "signal" (unqualified) | `ux.signal` or telemetry token namespace reference | `reviewed` |
| "origin" (unqualified) | `origin.record` / `origin.attribution-claim` / `origin.operational-provenance` | `reviewed` |

### 9.4 Migration notes

- Existing documents may retain historical wording, but new/updated engineering documents should use canonical term IDs.
- When revising older docs, add a one-line mapping note rather than rewriting archival context.

## 10) Operator quick reference

1. Choose domain and category first.
2. Use existing canonical `termId` if available.
3. If new term is needed, create it as `proposed` with full contract fields.
4. Set one evidence class only.
5. Set `verificationRequired: true` for hardware/datasheet-sensitive terms.
6. Define explicit boundaries ("not this").
7. Link policy implications (authorization, consent, retention, audit).
8. Do not represent `keystone-proposal` as deployed implementation.
9. Record lifecycle transition with rationale/date in continuity records.

## 11) Terminology quality validation plan (future enforcement guidance)

- **Consistency checks:** detect duplicates/conflicting definitions across domains.
- **Boundary checks:** reject prohibited scientific/medical/diagnostic interpretations in symbolic domains.
- **Traceability checks:** require policy/audit implication for critical terms.
- **Change-control checks:** every definition change requires version, rationale, and date.

Current state note: repository automation does not yet enforce this full terminology contract in CI. These checks are documented as implementation guidance for the next validation phase and must not be represented as already-active automated gates.

Planned validation target and location:

- Primary machine-readable records location (planned): `docs/terminology/records/*.term.json`
- Primary schema location (planned extraction from this standard): `docs/terminology/schema/term-record-v1.schema.json`
- Validation scope when implemented: every `*.term.json` file must conform to the schema and lifecycle/evidence rules in this standard.

## 12) Technical appendix

### 12.1 Example term record

```json
{
  "termId": "light.confidence",
  "label": "Confidence",
  "domain": "light-observation",
  "category": "quality",
  "aliases": ["reading confidence"],
  "definition": "Quantized trust level for normalized light output.",
  "engineeringMeaning": "Computed from signal quality checks, calibration validity, and sequencing completeness.",
  "notThisBoundary": "Not an absolute certainty claim and not a claim about human state.",
  "allowedContexts": ["sensor normalization", "event scoring", "ux cues"],
  "nonAllowedContexts": ["medical inference", "identity scoring"],
  "dataMapping": {
    "eventFields": ["confidence", "qualityFlags"],
    "tokenNamespaces": ["light-semantic-v1/confidence.*"]
  },
  "governanceImplication": {
    "authorization": "No direct grant effect; used as a quality gate.",
    "consent": "No additional consent alone; combine with access scope rules.",
    "retention": "Retained with event history policy tier.",
    "audit": "Store confidence transitions in audit-visible event metadata."
  },
  "runtimeEffectClass": "decision-support",
  "requiredControls": [
    "discovery-not-authorization",
    "least-privilege",
    "audit-hook",
    "platform-enforcement"
  ],
  "evidenceClass": "keystone-proposal",
  "verificationRequired": true,
  "version": "v1",
  "status": "proposed",
  "changeRationale": "Initial controlled-vocabulary baseline for light semantics.",
  "lastReviewedAt": "2026-09-25T00:00:00Z"
}
```

### 12.2 Related documents

- `docs/AXES_OS_SCIENCE_ENGINEERING_LIGHT_SENSING_CHECKPOINT.md`
- `docs/AXI_AUTOMATION_SERVICE.md`
- `docs/AXES_GOVERNANCE_AND_SAFEGUARDING.md`
- `docs/AXES_PROJECT_FULFILLMENT_READINESS.md`
- `docs/URNUR_NON_MONETARY_RECOGNITION.md`
- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`
- `docs/AXES_AGENT_ORIGIN_REGISTRY.md`
