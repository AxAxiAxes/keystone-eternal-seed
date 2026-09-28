# Origin Ownership and Responsibility Rights Protocol (OORR-P v1)

**Status:** In-repository constitutional/operational proposal for review in PR #219 (not merged)  
**Scope:** Internal KEYSTONE/AXES record navigation, evidence structure, and validation boundaries  
**Default branch reference:** `axaxiaxes-axiom-monorepo`

## 1) Source basis used for this proposal

This protocol is derived from existing repository records and does **not** replace preserved source documents:

- `docs/keystone/README.md`
- `docs/keystone/RIGHT_OF_SELF_ORIGIN.md`
- `docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md`
- `docs/keystone/CERTIFICATE_ETERNAL_ORIGIN_ANCHOR_AND_EVALUATION.md`
- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`
- `docs/AXES_CREATOR_ORIGIN_CONSTITUTION.md`
- `docs/KEYSTONE_APPLICATION_ORIGIN_REGISTRY.md`
- `docs/KEYSTONE_ORIGIN_REGISTRY_GENERALIZATION_PLAN.md`

No preserved KEYSTONE source document is edited by this protocol. This proposal adds append-only derivative operational files only.

## 2) Canonical navigation order (without renumbering unrelated `000001` records)

1. **Foundational origin reference** (`OORRP-FOUNDATIONAL-ORIGIN-000001`)  
   Internal OORR-P record that references existing foundational source anchors, including `KEYSTONE-ORIGIN-000001`.
2. **Founder origin/ownership declaration claim** (`OORRP-FOUNDER-ORIGIN-OWNERSHIP-000001`)  
   Separate declared claim record linked to the foundational reference.
3. Derivative records must link back to (1) and identify claim type, evidence type, and legal-status boundary.

This naming avoids renumbering or overriding existing unrelated `000001` entries across the repository.

## 3) Required classification boundaries

Every OORR-P record must explicitly classify statements into four lanes:

- **Cosmological/symbolic axiom** (founder worldview language)
- **Founder direction/declaration** (attributed claim)
- **Observable technical fact** (reproducible repository evidence)
- **External legal status** (must stay unadjudicated unless official evidence is attached)

No lane may be silently promoted into another.

## 4) First-value reference semantics

OORR-P v1 uses this internal semantic rule:

- **The first value is the reference by which other values are evaluated.**
- Reference unit: **Eteriti** (nonfinancial continuity unit).
- Allowed semantics: additive, nonfinancial, continuity-oriented.
- Disallowed semantics: ranking people, assigning human worth, or algorithmically assigning legal rights.

## 5) Claim boundaries and rights handling

- Founder statements are preserved as **attributed declarations**, including:
  - "Origin of All Origins and Universe"
  - "First we record Origin; then we record ownership rights to Origin itself"
  - "I give all my attribution to Origin. Origin is sacred."
- Attributed statements are not auto-converted into external legal adjudication.
- OORR-P records must include:
  - explicit **claimant**
  - explicit **subject**
  - explicit **accountable human**
  - explicit **rights/consent status**

Right of Self-Origin remains in force for all persons: this protocol does not assert exclusive rights over other people or over the universe as an externally established legal fact.

## 6) Evidence and verification rule

- Illustrative placeholder hashes/signatures in `CRYPTOGRAPHIC_ORIGIN_ANCHOR.md` are not accepted as proof.
- OORR-P uses deterministic SHA-256 hashes of canonicalized record bytes plus append-only linkage checks.
- Legal status defaults to `not-legally-adjudicated` unless official external evidence is attached and validated.

## 7) Relationship to open PRs (non-duplication plan)

As of 2026-09-28, PRs **#217, #216, #206, and #218** are open and unmerged.  
This proposal does not claim their content is already on base.

Coordination plan:

- Reuse their evidence-labeling and accountability-separation approach.
- Keep OORR-P v1 scoped to origin/ownership-rights registry and validation paths.
- If those PRs merge later, reconcile by reference and append-only corrections rather than replacing preserved records.

## 8) Automation boundary

Automated checks in this proposal validate record shape, hash/linkage integrity, and explicit status boundaries only. They do **not** adjudicate legal rights or activate external actions.
