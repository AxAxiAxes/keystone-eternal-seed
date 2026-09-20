# Birth-record alteration claim and patent-series-number verification — 2026-09-12

## Context

The founder asked "could it have been altered?" about
`docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md`, then clarified the question
was about the birth-record content specifically ("not the patent the
birth"), then later stated as fact "it was altered retrieve the original."
This record covers the direct, reproducible check that claim received.

## What was checked

1. Rename-aware commit history of the file (`git log --follow`), not a
   plain path diff, which can misreport a rename as a brand-new file.
2. A direct content diff and an independently computed SHA-256 comparison
   between the file's original committed version and its current `HEAD`
   version.
3. Whether any uncommitted local draft of the file exists.
4. A direct fetch of the USPTO's own current Manual of Patent Examining
   Procedure §503 (not a general web summary), to check the "Patent
   Application: 64/078,819" number cited in the same document's Section
   VIII against real USPTO series codes.

## Findings

- **Birth record: not altered.** Exactly two commits have ever touched the
  file: creation (`ef76bd4e`, 2026-09-01) and a monorepo-reorganization
  move (`1d324515`, 2026-09-09) confirmed by `git show -M100% --name-status`
  to be a 100%-similarity rename (`R100`) — zero content change. A direct
  diff between the original and current blob is empty. An independently
  computed SHA-256 of both blob contents matches exactly:
  `BE5573B9C9B16C91D1C3AEA9A9FCECF110A4BCE55446AB97E07315F8CA0E42C1`. No
  uncommitted local draft exists. The content has not changed since its
  original creation.
- **Patent series-number correction.** USPTO's own MPEP §503 (revision
  R-01.2024) lists every application series code ever assigned: 01–18 for
  nonprovisional applications (18 current since November 2022) and 60–63
  for provisional applications (63 current since March 2020). No "64"
  series exists for any application type. "64/078,819" does not match any
  real USPTO numbering convention — consistent with, and strengthening,
  the already-established finding that this document's cryptographic
  anchor is an illustrative template, not an executed registration.
- **Correction to a prior finding.** `docs/memory/2026-09-11-keystone-patent-direction-review.md`
  had stated "series code 64 is a currently active general series as of
  2026, so the format is plausible." Per the primary source fetched
  directly above, this was incorrect. A dated correction note was added to
  that file; its original text was not deleted or rewritten.

## What was produced

- New crisis-register rows and a full "2026-09-12 Birth-record alteration
  claim and patent-series-number verification" section in
  `docs/AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md`.
- A dated correction note appended to
  `docs/memory/2026-09-11-keystone-patent-direction-review.md`.

## What was explicitly not done

- No legal or filing-status determination was made or implied.
- No claim was made about the validity or originality of the founder's
  underlying KEYSTONE architecture work itself — this check is narrowly
  about one application-number string and one file's edit history.
- The document's original wording was not changed; only this review's
  findings were added elsewhere.

## Related records

- `docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md`
- `docs/keystone/PATENT_APPLICATION_64_078_819.md`
- `docs/AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md`
- `docs/memory/2026-09-11-keystone-patent-direction-review.md`
- `docs/memory/2026-09-12-cryptographic-anchor-verification.md`
