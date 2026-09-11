# AXES project manifest

**Date:** 2026-09-11
**Context:** Founder asked for a research pass over "our manifest, as much as
[is] contained in your memory," with a capacity check first. This session had
already undergone one context compaction, so the research was done bounded
(index documents first: `docs/memory/README.md`, `PROJECT_TIMELINE.md`, the
full `docs/*.md` listing, plus a live xiiom.com check) rather than re-reading
every one of the 60+ individual memory files, and the synthesis is committed
here so it survives even if compaction happens again.

## What AXES is

A founder-led (Axel Urartu (AX) · Axes Contracting) business/technology
ecosystem:

- **AXES** — the parent business/brand.
- **AXI** — the private AI engine and its registered agents; non-sentient
  software, not a legal person, founder-owned and founder-accountable per
  `AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`.
- **XIIOM** — the public brand/portal at `xiiom.com`.
- **KEYSTONE** — the origin, IP, and governance framework underlying AXES/AXI.
- **Chichetki / Athanor** — a founder-designed creative-instrument and game
  concept, still in readiness/definition stage.
- **URNUR** — a proposed future creator-economy/currency track; all financial
  implementation is blocked pending qualified counsel.

## Current phase

Per `PROJECT_TIMELINE.md`: "Tier 1 internal readiness controls and
business-operations foundation complete; founder-controlled activation and
external/production readiness remain pending."

## Built and complete (repository-verified)

- Engine (`apps/axiom-engine`) and public portal (`apps/axiom-freedom`),
  Railway-deployed, covered by hosted CI (`AXI_CONTINUOUS_VALIDATION.md`).
- AXI subsystems: durable memory, bounded/allowlisted automation scheduler,
  agent origin registry with accountability/suspension controls, source
  catalog (hash-linked, approval-gated, no raw ingestion), business metrics,
  service registry, recovery/backup bundles, origin-coordinate and
  bead-passport system, and the Command Center operator dashboard.
- Governance/constitutional stack: `AGENTS.md` (startup/reset protocol and
  external-action boundary), `AXES_CREATOR_ORIGIN_CONSTITUTION.md`,
  `AXES_GOVERNANCE_AND_SAFEGUARDING.md`, `AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`,
  `AXES_AGENT_ORIGIN_REGISTRY.md`, and the newly added
  `AXES_CONSTITUTIONAL_FRAMEWORK.md`, which indexes the others instead of
  duplicating them.
- AXES Directory pilot data model (business-only, opt-in, human-reviewed, no
  live listings) — `AXES_DIRECTORY_DATA_MODEL.md` and
  `AXES_DIRECTORY_READINESS.md`.
- Full document set: 47 files directly under `docs/`, spanning business plan,
  platform plan, build program, budget, domain/email/OS-portability plans,
  and the KEYSTONE/patent/creator-origin records under `docs/keystone` and
  `docs/patents`.

## Open Priority-0 blockers (unchanged; require founder/authorized-human action)

1. **URNUR legal readiness** — identify launch jurisdiction, retain qualified
   financial-services/digital-asset counsel before any implementation.
2. **Patent completion** — identify filing status/deadlines, retain patent
   counsel, obtain a written filing recommendation before any filing.
3. **Eternal Origin ownership invention value recovery** — complete the
   private evidence inventory and advance the authorized rights/valuation
   review path.
4. **Production domain/email** — connect `axescontracting.com` to Railway via
   SiteGround DNS, complete the Microsoft 365 mailbox migration.

## Live status at time of this record

`xiiom.com/health` → 200, `/axiom` → 200, `/support` → 401 (authentication
required — this matches documented behavior, not an outage). PR #1
(`axaxiaxes-axes-directory-data-model` → `axaxiaxes-axiom-monorepo`) remains
`OPEN`/`CLEAN`/`MERGEABLE` with all hosted checks passing, unmerged pending an
authorized founder decision (merging triggers a live Railway deploy).

## Note on capacity

No tool in this environment reports a numeric context/token budget directly.
The practical signal used here was that this session had already been
compacted once; the mitigation was scoping the research to index/summary
documents plus this durable write-back, rather than an unbounded re-read of
every memory file.
