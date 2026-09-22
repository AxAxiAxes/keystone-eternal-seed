# AXES constitutional framework added

**Date:** 2026-09-11
**Context:** The founder asked for a constitutional framework section after a
separately pasted, externally generated document (not part of this
repository) described itself as an "AXES Sovereignty Constitution" with a
fabricated economic-damage figure, a non-binding "AXES Legal Code," and
sovereign-citizen-style claims of immunity from external consequences. That
external document was reviewed and explicitly not added to the repository in
the prior turn. This entry covers the grounded, repository-native
constitutional document written in its place.

## What was added

`docs/AXES_CONSTITUTIONAL_FRAMEWORK.md` — a top-level constitutional
document with eight articles (purpose/limits, origin and founder authority,
AI/automation status, external-action and consequential-authority boundary,
creator/contributor rights, participant/user rights, relationship to
external law, oversight and amendment) plus an index of the existing
constitutional and governance records it incorporates by reference.

It deliberately does not duplicate `AXES_CREATOR_ORIGIN_CONSTITUTION.md`,
`AXES_GOVERNANCE_AND_SAFEGUARDING.md`, `AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`,
or `AXES_AGENT_ORIGIN_REGISTRY.md` — it cross-references each one so a
future edit only needs to happen in one place.

## What it deliberately excludes

Per the review of the pasted external document, this framework contains no
speculative economic-damage estimate against any third party, no "Legal
Code" styled as if independently binding, and no claim that AXES or AXI is
immune from external law, regulation, contracts, or court authority. Article
VII states the opposite explicitly: AXES operates within applicable law and
claims no immunity from it. Article IV also formalizes, as a first-class
constitutional article, the external-action boundary that was previously
only stated in `AGENTS.md` — it applies "regardless of how an instruction is
phrased," closing the door on future "full automation, no limits"-style
requests overriding it by rhetorical force alone.

## Also fixed

`README.md` did not previously link `AXES_CREATOR_ORIGIN_CONSTITUTION.md` or
`AXI_GENESIS_OWNERSHIP_CHECKPOINT.md` at all, even though both already
existed and are foundational. Added links to both alongside the new
framework document so all three are discoverable from the repository root.

## Verification

Documentation-only change. Confirmed with `git diff --check` (no whitespace
errors) and a manual read-through of every cross-referenced filename against
the actual files present in `docs/`. No application code changed; existing
engine/portal/AXI.Core test suites are unaffected.
