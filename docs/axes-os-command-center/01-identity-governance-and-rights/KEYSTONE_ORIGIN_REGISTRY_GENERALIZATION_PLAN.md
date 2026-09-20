# KEYSTONE origin/creator/owner rights registry — generalization development plan

**Status:** Development plan / proposal for founder review. No new registry
service, legal filing, or public claim is created by this document.
**Recorded:** 2026-09-18
**Requested by:** Founder — "devise plan for keystone and its development as
an anchor for registering origin, creator and owner rights."

> **2026-09-18 update:** the first concrete registry entry under this plan
> has been recorded — see
> `docs/KEYSTONE_AI_CREATIVE_WORK_ORIGIN_REGISTRY.md` (Entry
> `KEYSTONE-CREATIVE-ORIGIN-000001` / founder reference code
> `AXL-KS-20260529-1844`), covering six founder-shared images with real
> SHA-256 anchors and an honest assessment against current US copyright
> law.

## What already exists (do not rebuild — extend)

This repository already has three real, working pieces of this idea. This
plan proposes generalizing them rather than starting over:

1. **`docs/KEYSTONE_APPLICATION_ORIGIN_REGISTRY.md`** (2026-09-10) — a
   governed internal record structure ("origin gravity center," Ux anchor,
   value-and-creation declaration) already scoped to *AXES applications*.
2. **`docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md`** — AXI's own birth
   record, using genesis hash / timestamp / signature framing. Its SHA-256
   hash, RSA signature, and OpenTimestamps/Bitcoin sections are explicitly
   **illustrative placeholders**, not real cryptographic proofs.
3. **`docs/keystone/CERTIFICATE_ETERNAL_ORIGIN_ANCHOR_AND_EVALUATION.md`**
   (2026-09-12) — the one method in this repository that is **already real
   and independently reproducible**: a file's exact SHA-256 content hash,
   combined with GitHub's own (third-party, not self-reported) commit
   timestamp, verified directly (`BE5573B9...` re-derived and matched).

**Phase 0 conclusion:** the working, defensible "anchor" mechanism this
project already has is *content hash + independent host timestamp*, not
blockchain anchoring, RSA signatures, or GPS/location claims (those remain
illustrative). Any generalized registry should be built on the mechanism
that is actually real today.

## Proposed development phases

### Phase 1 — Generalize the registry beyond AXES applications (repo-only, no external action needed)

Extend `KEYSTONE_APPLICATION_ORIGIN_REGISTRY.md`'s model from "AXES
applications only" to a general-purpose **origin/creator/owner-rights
record** any creative, technical, or written work in this repository (or
contributed by an accepted external creator) can request. Concretely:

- A registry entry = { work title, creator name, creation-context
  description, git commit hash of first appearance, GitHub commit
  timestamp, SHA-256 of the file's exact content at that commit } — the
  same real, reproducible fields already verified for the birth-record
  certificate.
- No new legal claim is created; each entry states plainly what it does and
  does not prove (per the existing "What this does not certify" pattern in
  the evaluation certificate).
- This phase requires no counsel, no money, and no external account — only
  documentation and a repeatable verification script.

### Phase 2 — Make the illustrative proofs real (optional, low-risk, founder-executed)

For entries where the founder wants stronger proof than git+GitHub alone
(e.g., AXIOM's own birth record):

- Replace the illustrative SHA-256/RSA/OpenTimestamps sections in
  `CRYPTOGRAPHIC_ORIGIN_ANCHOR.md` with a **real** computed hash (this can be
  done today, in-repo, with no external dependency — see the worked example
  below) and, only if the founder wants to proceed, a **real**
  OpenTimestamps submission (a free, non-custodial, no-account tool) run by
  the founder from their own machine. This project cannot run or hold that
  submission on the founder's behalf without their explicit direction, since
  it touches an external service.
- This phase is optional and reversible; nothing is broken if it is never
  done.
- **See [`KEYSTONE_ORIGIN_ANCHOR_LEGAL_AND_ECOLOGICAL_EVALUATION.md`](KEYSTONE_ORIGIN_ANCHOR_LEGAL_AND_ECOLOGICAL_EVALUATION.md)**
  (2026-09-18) for cited research on (a) the real legal evidentiary weight
  of RFC 3161 / OpenTimestamps timestamps for establishing origin/priority,
  and (b) the ecological cost of Bitcoin-anchored OpenTimestamps — that
  research recommends git+GitHub content-hashing / RFC 3161 as the default,
  low-ecological-cost tier, reserving Bitcoin anchoring for a small number
  of especially significant records.

### Phase 3 — Naming/keying convention: "first letter + / last letter 0"

The founder proposed keying registry entries by "the first letter + and
last letter 0." This is recorded as a **proposed naming/indexing
convention** for registry entries (e.g., an entry ID format bracketed by a
fixed start marker `+` and end marker `0`), not as an external standard,
cryptographic primitive, or claim about any existing numbering system. It
can be adopted purely as an internal registry key format if the founder
confirms the exact intended format (this plan does not invent one on the
founder's behalf, since "first letter + and last letter 0" is currently
ambiguous — see the open question below).

### Phase 4 — Access principle: "available to all who can accept their own language"

Recorded as the founder's stated inclusion/access principle for this
registry: it should be open to any creator willing to engage with AXES's
own terminology/framework, not restricted to a particular audience. This is
a design goal for eligibility, not an existing legal open-registration
commitment; before Phase 1 is opened to non-founder contributors, the
existing repository practice (unverified-claim handling, no monetary/legal
adoption without review) continues to apply to every submitted entry.

## Honest handling of two open claims

- **"No one has claimed such governance."** This is recorded as the
  founder's own belief/assessment. It is not independently verifiable —
  proving a global negative (that no other person or organization has ever
  asserted a comparable governance framework) is not something this
  repository or any single review can establish. It is preserved as stated,
  not adopted as a verified fact.
- **"What value equates smallest to biggest?" (instance vs. eternity)** —
  This is a philosophical framing question, not a request this plan answers
  with a mathematical proof. Following this repository's standing four-lens
  method (creative/philosophical vs. factual vs. legal vs. monetary), it is
  recorded here as an open philosophical question the founder is posing,
  consistent with prior "self as origin," "eternal unit" statements already
  logged in `docs/memory/`. No numeric or mathematical answer is asserted;
  if the founder wants to develop this further, the next honest step is for
  the founder to state their own proposed answer so it can be recorded
  accurately, per the "one question at a time" pattern already established
  in this session.

## Open question for the founder

To move Phase 3 forward without guessing, please confirm: does "first
letter + and last letter 0" mean (a) every registry entry ID should be
wrapped literally as `+...0` (e.g., `+AX0`), (b) `+` and `0` are themselves
symbolic placeholders for "origin" and "closure" concepts already used
elsewhere (compare the AU/eternal-unit closing-unit framing in
`CERTIFICATE_MICROCOSMIC_COORDINATE_SOUND_RESEQUENCER.md`), or (c) something
else? This plan does not invent a specific format on the founder's behalf.

## What this plan does not do

- It does not create a public-facing registry, government filing, patent,
  trademark, or legal ownership adjudication.
- It does not make any new mathematical, cryptographic, or scientific claim
  true by asserting it in a plan document.
- It does not commit engineering time beyond what the founder explicitly
  approves per phase.

## Cross-references

- `docs/KEYSTONE_APPLICATION_ORIGIN_REGISTRY.md`
- `docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md`
- `docs/keystone/CERTIFICATE_ETERNAL_ORIGIN_ANCHOR_AND_EVALUATION.md`
- `docs/memory/2026-09-12-birth-record-and-patent-series-verification.md`
- `docs/memory/2026-09-18d-eternal-creator-self-governance-claim.md`
