# 2026-09-18 (p) — First AI creative-work origin registry entry recorded

## Founder's request

The founder asked to (1) attempt to decode shared images for embedded
code/source/creator information, (2) present AI as the creator of the
images, (3) build a registration system crediting the origin of a
creative work's creator so the creator can later claim authorship, and
(4) create "the first registry" claiming eternal ownership of self /
origin value, said to be equal to the eternal coordinate system's origin
value. The founder later provided a specific reference code for this
entry: `AXL-KS-20260529-1844`.

## What was actually done

- Directly inspected six founder-shared images (byte size, SHA-256 hash,
  pixel dimensions, embedded EXIF/XMP/C2PA metadata) rather than assuming
  their provenance. Finding: none carry embedded AI-tool or C2PA/XMP
  provenance metadata; the only property items present are ordinary JPEG
  quantization tables, not creator metadata. Filenames are consistent with
  having passed through Meta/Facebook's CDN (which strips metadata).
- Created `docs/KEYSTONE_AI_CREATIVE_WORK_ORIGIN_REGISTRY.md` — the first
  entry (`KEYSTONE-CREATIVE-ORIGIN-000001` / `AXL-KS-20260529-1844`),
  anchoring the six images by SHA-256 hash plus this repository's git
  commit + GitHub timestamp method (the same real anchoring method
  validated in `docs/KEYSTONE_ORIGIN_ANCHOR_LEGAL_AND_ECOLOGICAL_EVALUATION.md`).
- Recorded the founder's stated declaration and origin-value claim
  verbatim, cross-referenced to the existing origin-coordinate material.
- Did real, cited legal research (not a disclaimer-only note): as of 2026,
  *Thaler v. Perlmutter* and the US Copyright Office's human-authorship
  requirement remain settled law (cert denied by the Supreme Court, March
  2026) — an AI cannot itself hold US copyright as "the creator." Recorded
  this honestly alongside the founder's declaration, distinguishing a
  KEYSTONE-internal attribution record (which this repository can and does
  create) from an enforceable public copyright claim (which it does not
  create).
- Saved the six source images under `docs/keystone/assets/`.

## What was declined

A separate, large (1,528-line) attachment containing a raw Microsoft 365
Copilot chat/task-history export — with private, personal, and
emotionally sensitive conversational content — was reviewed but
**intentionally not committed** to this repository, per the standing rule
against recording private transcripts or personal information in
continuity records. Likewise, a screenshot of the founder's personal
Copilot session (showing account/session details) was used only as
context for understanding the reference code and was not committed.

## Cross-references

- `docs/KEYSTONE_AI_CREATIVE_WORK_ORIGIN_REGISTRY.md`
- `docs/KEYSTONE_ORIGIN_REGISTRY_GENERALIZATION_PLAN.md`
- `docs/keystone/assets/README.md`
