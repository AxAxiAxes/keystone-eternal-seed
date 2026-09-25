# AXES OS science-and-engineering checkpoint: agentic-web research + light-sensing proposal

**Status:** Mixed checkpoint. Contains (1) repository evidence, (2) external research notes, and (3) Keystone design proposals that are not yet implemented.
**Recorded:** 2026-09-25
**Scope:** Documentation-only checkpoint for AXES OS engineering planning. No source-code, driver, workflow, or deployment changes are introduced by this record.
**Controlled vocabulary:** Terminology in this checkpoint is governed by `docs/AXES_OS_TERMINOLOGY_STANDARD.md` and `docs/AXES_OS_TERMINOLOGY_TOKEN_GLOSSARY.md`.

## 1) Evidence boundary and classification

This document separates three evidence classes:

1. **Repository evidence (implemented in this repository):** constitutional/governance controls, bounded automation rules, and existing terminology boundaries for "sequencer/resequencer".
2. **External Lighthouse evidence (research only):** changes visible in `GoogleChrome/lighthouse` comparison `v13.3.0...main` and related official Lighthouse source files.
3. **Keystone proposals (not deployed):** hardware light-sensing architecture, sequencer/resequencer signal pipeline, and "microcosmic lighthouse" meaning-anchor vocabulary.

No section below should be interpreted as proof that hardware sensing, ARD publishing, or semantic light-event processing is currently deployed in this repository.

## 2) Current repository facts relevant to this checkpoint

### 2.1 Governance and control posture (implemented)

Current repository governance material already defines the core control posture this checkpoint must preserve:

- discovery/description records do **not** equal autonomous authority to execute,
- bounded/allowlisted operations,
- human-reviewed approvals for sensitive actions,
- private-by-default operational records,
- correction/review and accountability trails.

See `docs/AXI_AUTOMATION_SERVICE.md`, `docs/AXES_GOVERNANCE_AND_SAFEGUARDING.md`, and `docs/AXES_PLATFORM_PLAN.md`.

### 2.2 Sequencer/resequencer terminology baseline (implemented boundary)

Repository records already constrain resequencer language:

- `docs/AXES_PROJECT_FULFILLMENT_READINESS.md` defines "transaction-progress resequencer" and "price-list configuration resequencer" as **versioned organization**, not autonomous economic decisioning.
- `docs/URNUR_NON_MONETARY_RECOGNITION.md` and `docs/AXES_GOVERNANCE_AND_SAFEGUARDING.md` explicitly prohibit treating "resequencer/transmission/alignment" language as scientific, medical, diagnostic, influence, or personal-state claims.

This checkpoint reuses that same boundary: any light-sensing resequencer work below is an engineering proposal and must not be represented as validated cognitive/medical/spiritual instrumentation.

## 3) External Lighthouse research checkpoint (v13.3.0...main)

**Research source supplied by user:**
`https://github.com/GoogleChrome/lighthouse/compare/v13.3.0...main`

### 3.1 Agentic-web additions observed in the supplied comparison

From official Lighthouse source paths on `main` versus `v13.3.0`:

- **Agentic Browsing category retains/expands agent-focused audits** in `core/config/agentic-browsing-config.js`.
- **`llms.txt` audit remains part of agent discoverability input** (`core/audits/agentic/llms-txt.js`).
- **ARD is added** via:
  - gatherer: `core/gather/gatherers/agentic/ard.js`
  - audit: `core/audits/agentic/ard-schema.js`
  - config wiring in `core/config/agentic-browsing-config.js`
- **ARD discovery channels** in `ard.js`: robots.txt `Agentmap:`, HTML `<link rel="ai-catalog">`, HTTP `Link` header (`rel="ai-catalog"`), and `/.well-known/ai-catalog.json` fallback.
- **Schema-validation scoring behavior** in `ard-schema.js`:
  - errors -> score `0`
  - warnings-only -> score `0.9`
  - no issues -> score `1`
  - no explicit discovery signal and no catalog -> `notApplicable`
- **WebMCP scale warning** in `core/audits/webmcp-registered-tools.js`: warning when more than `40` tools are registered.
- **Abortable navigation + cleanup improvements** visible in `core/gather/driver/navigation.js` on `main` (adds optional `AbortSignal`, cancellation race handling, and listener cleanup), relevant to gatherer reliability/cleanup discipline.

### 3.2 Interpretation boundary for Keystone

These Lighthouse findings are external interoperability and quality-audit research. They are **not** authorization, identity, sandbox, or policy enforcement for Keystone runtime operations.

## 4) Proposed hardware light-sensing architecture (not implemented)

### 4.1 Candidate sensors (subject to verification)

Initial ambient-light candidates for prototype research:

- **TI OPT3001** (ambient light sensor, I2C)
- **Vishay VEML7700** (ambient light sensor, I2C)

Future spectral candidate:

- **ams OSRAM AS7341** (multi-channel spectral sensor, I2C)

Any numeric ranges, gain recommendations, integration-time tuning, and threshold defaults are **vendor/datasheet references only** until reproduced and validated on target hardware.

### 4.2 Data-model distinctions

Proposed separation of measurement classes:

- **Raw sensor units:** register-level counts/integration products (device-specific).
- **Lux:** normalized illuminance estimate (ambient-light derived; calibration dependent).
- **Spectral bands:** channelized intensity by wavelength buckets (AS7341-class data).

### 4.3 Linux + I2C + IIO normalization proposal

Proposed ingestion path:

1. sensor over **I2C**,
2. Linux driver exposure through **IIO/sysfs** interfaces where available,
3. adapter normalization into a Keystone event envelope with provenance metadata.

Normalization proposal includes:

- unit + scale metadata,
- integration/gain state,
- calibration profile/version,
- timestamp source and clock quality,
- device identity + driver version provenance.

### 4.4 Calibration, provenance, and sampling constraints

Proposed minimum provenance fields for each event batch:

- `calibrationState` (`uncalibrated|factory|field|invalid`)
- `calibrationProfileId`
- `calibrationAppliedAt`
- `sensorModel`, `driverPath`, `readMethod`
- `samplingHz`, `integrationMs`, `aggregationWindowMs`

Sampling constraints (proposal):

- cap high-rate collection by policy tier,
- aggregate by default for baseline telemetry,
- require explicit consent and elevated policy for historical or high-frequency streams,
- retain only what is necessary for declared purpose.

### 4.5 Privacy classification and access policy (proposal)

Proposed policy tiers:

- **Tier L0 (low):** coarse aggregated lux bands for non-personal environment adaptation.
- **Tier L1 (moderate):** timestamped transitions and trend windows.
- **Tier L2 (high):** high-rate traces, detailed spectral streams, or long-lived history.

Access model: deny by default; explicit capability grants by scope/time; operator-visible audit trail; revocable at runtime.

## 5) Proposed sequencer/resequencer signal pipeline (not implemented)

Proposed conceptual pipeline:

`sensor -> signal conditioning -> temporal sequencer -> resequencer -> normalized light event -> semantic/meaning anchor -> registry/policy/audit`

Operational proposal for components:

- **Temporal sequencer:** deterministic ordering/windowing of sensor samples across clock sources, dropouts, and batching boundaries.
- **Resequencer:** corrective re-ordering and reconciliation step that can:
  - align late/out-of-order frames,
  - annotate uncertainty,
  - preserve original sample provenance,
  - support replay and post-hoc correction without mutating original capture facts.

Expected outputs (proposal):

- canonical event IDs,
- lineage links to raw capture segments,
- correction records (if sequencing updates occur),
- replay-compatible normalized streams.

**Unimplemented status:** no production sensor driver, sequencer service, or resequencer runtime is currently shipped in this repository.

## 6) "Microcosmic lighthouse" language-translator and meaning-anchor proposal (not implemented)

This checkpoint defines "microcosmic lighthouse" as a **versioned symbolic/event vocabulary**, not as mysticism or as a physics claim.

Proposed artifact: `light-semantic-v1` (schema proposal)

Example token families:

- `lux.band.{very_low|low|mid|high|very_high}`
- `spectrum.band.{violet|blue|green|amber|red|nir}`
- `transition.{rise|fall|pulse|stable}`
- `confidence.{low|medium|high}`
- `calibration.{uncalibrated|factory|field|invalid}`
- `temporal.{before|during|after|coincident}`

Example normalized event envelope (proposal):

```json
{
  "schema": "light-semantic-v1",
  "eventId": "evt-2026-09-25T22:00:00.000Z-0001",
  "observedAt": "2026-09-25T22:00:00.000Z",
  "tokens": [
    "light-semantic-v1/lux.band.mid",
    "light-semantic-v1/transition.rise",
    "light-semantic-v1/confidence.medium",
    "light-semantic-v1/calibration.factory"
  ],
  "numeric": {
    "lux": 135.2,
    "samplingHz": 2
  },
  "provenance": {
    "sensorModel": "OPT3001",
    "calibrationProfileId": "factory-default-vendor"
  }
}
```

Purpose of this vocabulary proposal:

- stable cross-device interpretation layer,
- explicit uncertainty and calibration state,
- deterministic policy hooks,
- replay/correction compatibility via sequencer/resequencer lineage.

## 7) Constitution and governance alignment (required controls)

For any future implementation derived from this checkpoint:

1. **Discovery is not authorization.** Catalogs/manifests are discoverability metadata only.
2. **Deny by default.** No sensor stream access without explicit capability grant.
3. **Least privilege.** Scope by sensor, resolution, rate, retention, and caller identity.
4. **Consent for historical/high-rate access.** Elevated collection requires explicit user/operator consent path.
5. **Signed manifests and provenance.** Versioned, signed metadata for sensor adapters and semantic schemas.
6. **Revocation and rollback.** Grants must be revocable; prior policy state must be recoverable.
7. **Auditability.** Access, transforms, corrections, and replay operations produce attributable records.
8. **Platform enforcement.** Policy broker decisions must be enforced by runtime boundaries (process isolation, service authn/authz, OS-level controls), not by document claims.

## 8) Checkpoint summary

### Scope

- Add one durable engineering research/checkpoint document.
- Capture Lighthouse agentic-web comparison findings as external evidence.
- Define light-sensing + semantic anchoring architecture as proposal only.

### Current status

- **Implemented today:** governance and accountability framework; bounded automation controls; terminology boundaries.
- **External research evidence:** Lighthouse comparison findings listed above.
- **Not implemented:** light-sensor ingestion, sequencer/resequencer signal runtime, semantic alphabet execution path.

### Decisions recorded in this checkpoint

1. Keep strict evidence/proposal separation.
2. Use I2C + Linux IIO-style normalization as initial engineering direction.
3. Keep semantic light vocabulary explicitly versioned and auditable.
4. Preserve constitutional controls as non-negotiable implementation gates.

### Open questions

1. Which target platform(s) and kernel versions are first-class for sensor integration?
2. Minimum viable sampling profile for useful events without excessive privacy risk?
3. Whether ambient-only (lux) ships before spectral channels?
4. What signed-manifest format should carry sensor and semantic schema versioning?

### Validation plan (future implementation phase)

- Bench-test each sensor on supported Linux targets.
- Verify conversion repeatability against controlled light references.
- Validate timestamp and ordering behavior under dropouts/restarts.
- Run policy tests for deny-by-default, scoped grants, consent gates, revocation, and audit completeness.
- Perform security/privacy review before enabling any persistent historical stream.

## 9) Sources and references

### Lighthouse (external research)

- User-supplied comparison URL: https://github.com/GoogleChrome/lighthouse/compare/v13.3.0...main
- `core/config/agentic-browsing-config.js` (v13.3.0 and `main`)
- `core/gather/gatherers/agentic/ard.js` (`main`)
- `core/audits/agentic/ard-schema.js` (`main`)
- `core/audits/agentic/llms-txt.js`
- `core/audits/webmcp-registered-tools.js` (v13.3.0 and `main`)
- `core/audits/webmcp-form-coverage.js`
- `core/audits/webmcp-schema-validity.js`
- `core/gather/driver/navigation.js` (v13.3.0 and `main`)

### Sensor/kernel references (external research)

- TI OPT3001 product page: https://www.ti.com/product/OPT3001
- Vishay VEML7700 product page: https://www.vishay.com/en/product/84286/
- ams OSRAM AS7341 product page: https://ams-osram.com/products/sensor-solutions/ambient-light-color-spectral-proximity-sensors/ams-as7341-spectral-sensor
- Linux IIO subsystem documentation: https://docs.kernel.org/driver-api/iio/

### Repository evidence cited

- `docs/AXI_AUTOMATION_SERVICE.md`
- `docs/AXES_GOVERNANCE_AND_SAFEGUARDING.md`
- `docs/AXES_PLATFORM_PLAN.md`
- `docs/AXES_PROJECT_FULFILLMENT_READINESS.md`
- `docs/URNUR_NON_MONETARY_RECOGNITION.md`
