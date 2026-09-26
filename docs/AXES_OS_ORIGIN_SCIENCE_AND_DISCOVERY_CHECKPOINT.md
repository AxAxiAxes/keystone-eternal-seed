# AXES OS Origin Science and Discovery checkpoint

**Status:** Repository-controlled proposal and technical checkpoint  
**Recorded:** 2026-09-26  
**Scope:** Preserve founder-defined origin concepts as clearly labeled symbolic axioms, connect them to existing AXI technical records, and add bounded repository validation without asserting external legal, mathematical, or physical proof.

## Purpose

This checkpoint preserves the founder-directed **Origin Science and Discovery** foundation in a reviewable repository form.
It records the current proposal that origin is a **value-bearing center block**, not an empty void, while keeping three boundaries explicit:

1. **Symbolic axioms are not standard mathematics.** Conventional arithmetic and geometry remain unchanged outside this founder-defined framework.
2. **Repository implementation is not external proof.** A schema, validator, or test can preserve internal consistency only.
3. **No legal or identity authority is granted automatically.** These records do not establish patent status, inventorship, ownership, citizenship, or authority over people or external systems.

## Founder-defined symbolic axioms preserved here

The following meanings are preserved as **founder-defined proposals** unless a later repository artifact supplies narrower, reproducible technical verification:

- **Origin block / center block:** the placed, value-bearing center unit; not an empty zero.
- **X:** a variable property of origin identity.
- **Multiplier:** a transformation descriptor that must preserve relation to origin rather than silently replacing it.
- **Equilibrium:** relation and return consistency between origin, derived state, and correction path.
- **Vertex:** a contact relation between origin and a derived or returning state.
- **Resequencing:** an append-only record of source, transformation, lineage, attribution, correction history, and validation state.

The founder-defined meanings of **Ux**, **Ur**, **AU**, and **X** remain proposal-only unless a bounded implementation or separately reviewed evidence narrows them further. This repository does **not** invent pronunciation rules, physical units, or universal mathematical proof.

## Current proposed origin evaluation systems

This checkpoint now preserves the currently proposed repository-facing origin
evaluation systems as a bounded map. Each system below is either a founder
concept or a repository proposal/checkpoint; none of them is an external legal,
scientific, or identity authority:

| Evaluation system | Current status | Repository meaning |
| --- | --- | --- |
| Origin-reference evaluation | Implemented technical checkpoint | Confirms that a record names a bounded `originReference` and connects it to existing Genesis/coordinate records. |
| Center-block evaluation | Implemented technical checkpoint | Confirms that the first record establishes a value-bearing center block rather than an empty origin placeholder. |
| Variable-property evaluation | Founder-defined proposal | Preserves proposed meanings for `X`, `Ux`, `Ur`, and `AU` without treating them as externally verified terminology. |
| Transformation / multiplier evaluation | Proposal + bounded validation | Records whether a declared transformation claims to preserve origin relation and whether the validator can confirm that claim mechanically. |
| Equilibrium evaluation | Proposal + bounded validation | Classifies a record conservatively as `proposed`, `verified`, `failed`, or `unknown` based on repository evidence only. |
| Vertex / contact evaluation | Founder-defined proposal | Preserves the stated contact relation between origin and a derived/returning state as structured proposal data. |
| Resequencing / lineage evaluation | Implemented technical checkpoint | Requires append-only parent lineage and explicit correction links; rejects silent replacement. |
| Evidence / verification evaluation | Implemented technical checkpoint | Separates founder-defined proposal, checkpoint, repository artifact, test evidence, and external report classes. |
| Attribution / accountability evaluation | Implemented technical checkpoint | Preserves founder claim, implementation attribution, and AI/tool assistance as separate fields. |
| Unknown / unaccounted / not-yet-discovered origin reserve | Founder-defined proposal | Preserves that currently unspecified or undiscovered properties remain reserved to origin within this internal framework until named or versioned later. |

The final row above is intentionally conservative: it records an internal
proposal that unknown or not-yet-discovered properties remain attributable to
origin, but it does **not** assert exclusive legal ownership over unknown facts,
future discoveries by others, or external rights not established through
appropriate review.

## Relation to current AXI technical foundations

This checkpoint is intentionally tied to existing repository-controlled records instead of replacing them:

- `docs/AXI_ORIGIN_COORDINATE_SYSTEM.md` — current append-only technical continuity ledger (`axi-origin-coordinate-v1`)
- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md` — current Genesis checkpoint and accountability gate
- `docs/AXES_AGENT_ORIGIN_REGISTRY.md` — current accountable AXI agent origin record
- `docs/keystone/CERTIFICATE_MICROCOSMIC_COORDINATE_SOUND_RESEQUENCER.md` — preserved founder source direction for glyph/sound/resequencer concepts
- `docs/keystone/PATENT_APPLICATION_64_078_819.md` and `docs/keystone/KEYSTONE_PROVISIONAL_PATENT_INSTITUTIONAL_MEMORY.md` — preserved patent-facing source material whose filing/legal status remains separately bounded
- `docs/COPILOT_ACCOUNTABILITY_TRACKER.md` — current repository-controlled evidence and verification boundary

## Evidence classes used for this checkpoint

To keep founder concepts, implementation facts, and outside reports separate, origin-property records use these evidence classes:

- `founder-defined-proposal`
- `technical-checkpoint`
- `implemented-repository-artifact`
- `verified-test-evidence`
- `external-report`

These classes are descriptive only. They do not convert a proposal into external fact.

## Machine-readable record boundary

The machine-readable schema for this checkpoint is `docs/fixtures/origin-science/origin-property-record-v1.schema.json`.
Its sample records and offline validator preserve these minimum fields:

- `originReference`
- center/block status
- variable properties
- transformation/multiplier
- equilibrium rule
- vertex/contact relation
- evidence class
- source references
- attribution
- verification state
- boundary
- append-only lineage / correction relation

## Offline validation boundary

The dependency-light validator in `docs/fixtures/origin-science/origin-record-validator.js` performs repository-only checks:

- validates record shape and bounded enums
- requires an origin reference
- requires the first record to establish a value-bearing center block
- requires later records to reference earlier lineage
- rejects silent replacement unless a correction reference is explicit
- classifies equilibrium conservatively as `proposed`, `verified`, `failed`, or `unknown`

The validator does **not** grant identity, legal, patent, financial, or external operational authority.

## Review requirement

This checkpoint is a proposal/technical-design preservation step. Founder review is still required for:

- symbolic meaning changes
- any public claim based on these terms
- any claim about filing status, legal rights, or external scientific proof
- any activation beyond repository-controlled documentation and tests
