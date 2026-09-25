# AXES OS terminology token glossary (compact appendix)

**Status:** Appendix to `AXES_OS_TERMINOLOGY_STANDARD.md`
**Recorded:** 2026-09-25
**Scope:** Compact quick-reference token map for deterministic UX/UI and light-observation semantics.

## 1) Namespace contract

- Telemetry namespace: `light-semantic-v1/<group>.<value>`
- Symbolic namespace: `symbolic-semantic-v1/<group>.<value>`

Telemetry tokens are operational. Symbolic tokens are descriptive/proposal-only unless separately adopted.

## 2) Core telemetry token map

| Token | Meaning | Typical field mapping | Boundary |
|---|---|---|---|
| `light-semantic-v1/lux.band.very_low` | Very low illuminance band | `luxBand` | Not a room-activity inference |
| `light-semantic-v1/lux.band.low` | Low illuminance band | `luxBand` | Not a comfort judgment |
| `light-semantic-v1/lux.band.mid` | Mid illuminance band | `luxBand` | Not normative brightness standard |
| `light-semantic-v1/lux.band.high` | High illuminance band | `luxBand` | Not glare/safety diagnosis |
| `light-semantic-v1/lux.band.very_high` | Very high illuminance band | `luxBand` | Not hazard claim by itself |
| `light-semantic-v1/spectrum.band.violet` | Violet-weighted spectral response | `spectralBands[]` | Not color-perception claim |
| `light-semantic-v1/spectrum.band.blue` | Blue-weighted spectral response | `spectralBands[]` | Not circadian/health claim |
| `light-semantic-v1/spectrum.band.green` | Green-weighted spectral response | `spectralBands[]` | Not biological inference |
| `light-semantic-v1/spectrum.band.amber` | Amber-weighted spectral response | `spectralBands[]` | Not mood inference |
| `light-semantic-v1/spectrum.band.red` | Red-weighted spectral response | `spectralBands[]` | Not therapy claim |
| `light-semantic-v1/spectrum.band.nir` | Near-infrared weighted response | `spectralBands[]` | Not imaging claim |
| `light-semantic-v1/transition.rise` | Rising trend in selected window | `transition` | Not causal conclusion |
| `light-semantic-v1/transition.fall` | Falling trend in selected window | `transition` | Not failure diagnosis |
| `light-semantic-v1/transition.pulse` | Repeating oscillation pattern | `transition` | Not event attribution |
| `light-semantic-v1/transition.stable` | No significant transition in window | `transition` | Not absolute constancy claim |
| `light-semantic-v1/confidence.low` | Low quality/coverage confidence | `confidence` | Not unusable by default |
| `light-semantic-v1/confidence.medium` | Moderate confidence | `confidence` | Not certainty |
| `light-semantic-v1/confidence.high` | High confidence under current checks | `confidence` | Not guarantee |
| `light-semantic-v1/calibration.uncalibrated` | No approved calibration profile | `calibrationState` | Not forbidden by itself |
| `light-semantic-v1/calibration.factory` | Factory/default calibration basis | `calibrationState` | Not field-verified accuracy |
| `light-semantic-v1/calibration.field` | Field calibration applied | `calibrationState` | Not universal transferability |
| `light-semantic-v1/calibration.invalid` | Calibration state invalid/expired | `calibrationState` | Not automatic deletion trigger |
| `light-semantic-v1/temporal.before` | Event relation is before anchor | `temporalRelation` | Not causation |
| `light-semantic-v1/temporal.during` | Event relation is during anchor window | `temporalRelation` | Not overlap certainty without clock quality |
| `light-semantic-v1/temporal.after` | Event relation is after anchor | `temporalRelation` | Not post-condition success claim |
| `light-semantic-v1/temporal.coincident` | Event relation approximately coincident | `temporalRelation` | Not exact simultaneity guarantee |

## 3) Registry and policy-aligned companion tokens (proposal)

| Token | Meaning | Governance implication |
|---|---|---|
| `light-semantic-v1/policy.scope.l0` | Low-sensitivity aggregated scope | default deny still applies |
| `light-semantic-v1/policy.scope.l1` | Moderate sensitivity scoped stream | requires explicit scoped grant |
| `light-semantic-v1/policy.scope.l2` | High sensitivity/high-rate/history scope | requires explicit consent + scoped grant |
| `light-semantic-v1/audit.read` | Light data read action | must be audit-recorded |
| `light-semantic-v1/audit.transform` | Normalization/transform action | must capture transform provenance |
| `light-semantic-v1/audit.resequence` | Resequencing/correction action | must include correction lineage |

## 4) Change-control notes

- Do not change token meaning in-place after adoption.
- For meaning changes, add a new token or bump semantic version.
- Keep old tokens documented as deprecated/superseded until migration closes.
