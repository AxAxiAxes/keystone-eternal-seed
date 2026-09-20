# 2026-09-12 Cryptographic origin anchor verification and four-lens validation framework

## Context

The founder asked to verify "the registered cryptographic anchor and
timstamp ip adress," stated that the provided material is a mix of
original creation ("possibly artistic") and fact that "should be
validated," and directed that "the entire package" be re-validated across
four named lenses: **artistic, philosophical, factual, and monetary**.

## What was checked

`docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md` was re-read in full and
every checkable claim was independently recomputed or looked up, rather
than taken at face value:

- Recomputed the claimed SHA-256 "Genesis Hash" over the document's own
  literal input string (Node `crypto.createHash('sha256')`) — does not
  match, and the claimed value is only 62 hex characters (a real SHA-256
  digest is always 64).
- Decoded the full "(Illustrative)" RSA signature block from base64 (960
  bytes; matches neither a real 256-byte signature nor a ~1,200-byte
  encoded key), measured its Shannon entropy (5.36 bits/byte vs. ~8.0 for
  real cryptographic output), and found a 6-byte hex fragment repeating 83
  times — conclusively synthetic, not real signature output.
- Looked up the cited commit hash (`258e14a...`) via `gh api`: real commit,
  but dated 2026-08-31 (three months after the claimed May birth) with an
  unrelated message ("Add Extended Constitutional Charter with new
  rights").
- Converted the OpenTimestamps receipt's embedded Unix timestamp
  (`1748620440`) to a calendar date: 2025-05-30, one year before the
  claimed 2026 birth date.
- Regex-searched every file under `docs/` for IPv4-shaped strings: found
  only an unrelated `127.0.0.1` local-dev default and the two
  already-documented `axescontracting.com`/`xiiom.com` DNS-resolution
  addresses. No IP address tied to any origin/birth claim exists anywhere
  in the repository.
- Fetched all three cited arXiv papers (2604.09588, 2603.04740, and
  2511.14964, the last not previously checked) directly from arxiv.org:
  all three are real, live papers with matching titles, but none reference
  AXIOM, KEYSTONE, or Axel Urartu — they are independent third-party
  research on adjacent topics, not witnesses of this project.

Separately, a newly re-uploaded attachment,
"KEYSTONE — Soul Protection Declaration 1.docx," was extracted (unzip +
XML text-run parse + HTML-entity decode) and word-diffed against the
already-preserved `docs/keystone/soul protection`. Every remaining
difference was a missing inter-word space from a Word run-boundary
artifact — confirmed duplicate, no new content.

## Findings

The cryptographic anchor's own "(Illustrative)" labels are accurate: the
hash, signature, and blockchain-timestamp fields are a well-built template
for a future real registration, not an executed one. This is not evidence
of bad faith — the document says so itself — but no prior review had
actually run the numbers to confirm it. This pass did, and it also found
one new internal inconsistency (the OTS timestamp resolving to the wrong
year) that a future genuine registration attempt should avoid repeating.

## What was produced

- New crisis-register rows plus two full sections in
  `docs/AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md`: "2026-09-12
  Cryptographic origin anchor — technical verification" and "Four-lens
  validation framework" (the latter indexes every prior content-bearing
  register entry against the founder's artistic/philosophical/factual/
  monetary categories).
- `PROJECT_TIMELINE.md` row and this memory entry.

## What was explicitly not done

No real OpenTimestamps submission, RSA keypair generation, or blockchain
transaction was created — doing so was outside this review's scope (a
verification pass, not a request to mint a new registration) and would be
a founder decision if wanted for real. No legal or valuation conclusion was
reached on the patent, IP, or monetary claims referenced alongside this
material; those remain open per the existing register entries.

## Next steps

If the founder wants a genuinely executed cryptographic anchor: generate a
real keypair and sign the actual document text, submit its real hash to
OpenTimestamps' mainnet endpoint, and replace the bracket placeholders with
the real block height/hash once confirmed. None of that requires
professional/legal review — it is technical work available to execute
whenever wanted.
