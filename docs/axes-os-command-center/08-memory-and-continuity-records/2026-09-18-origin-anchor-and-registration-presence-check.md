# Cryptographic origin anchor + registration system: already present, verified

**Date:** 2026-09-18

## Request

Founder asked for "the cryptographic eternal origin anchor and registration
system" to be added to the GitHub copy of this repo.

## Finding: already present on `origin/axaxiaxes-axiom-monorepo`

Verified directly against `origin/axaxiaxes-axiom-monorepo` (the branch
Railway deploys), not just the local working copy:

- `docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md` — the origin anchor
  document — present (added in commit `1d32451`, "Organize KEYSTONE records
  for monorepo").
- `docs/AXES_AGENT_ORIGIN_REGISTRY.md` — present.
- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md` — present.
- `docs/keystone/PATENT_APPLICATION_64_078_819.md` — present.
- `apps/axiom-engine/service-registry-service.js`,
  `apps/axiom-engine/checkpoint-service.js`,
  `apps/axiom-engine/bead-passport-service.js` — present; these are the
  actual working, tested hash-linked append-only registration/checkpoint
  code (verified passing in the full test run earlier this session,
  "maintains a private append-only service registry" /
  "creates, verifies, and restores a private runtime timeline bundle" /
  "records approved source metadata in a hash-linked private catalog").

No new file needed to be added; nothing was missing from the GitHub-hosted
repository.

## Integrity note (already previously documented, restated for this check)

`CRYPTOGRAPHIC_ORIGIN_ANCHOR.md`'s SHA-256 hash, RSA digital signature block,
and OpenTimestamps/Bitcoin blockchain receipt are explicitly labeled
"Illustrative" placeholders in the document itself, not values actually
computed, signed, or anchored to a blockchain. Its claimed patent filing
("Patent Application 64/078,819, Filed: June 12, 2026") conflicts with
`docs/memory/2026-09-11-keystone-patent-direction-review.md` and
`docs/memory/2026-09-12-birth-record-and-patent-series-verification.md`,
which found no USPTO "64" series exists and no patent-counsel engagement or
filing has been confirmed. This is not a new finding — it restates existing,
already-recorded verification so it isn't mistaken for a live cryptographic
or legal proof.

The actual working cryptographic/registration mechanism in this repo is the
tested, hash-linked append-only code in `apps/axiom-engine`
(`service-registry-service.js`, `checkpoint-service.js`,
`bead-passport-service.js`, `continuity-record-service.js`) — that part is
real, running, and test-covered, distinct from the illustrative document.

## What this does not do

Does not compute a real SHA-256/RSA signature/blockchain anchor for the
illustrative document, file a patent, or alter any existing file. No repo
change was needed for this check.

## Related records

- `docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md`
- `docs/AXES_AGENT_ORIGIN_REGISTRY.md`
- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`
- `docs/memory/2026-09-11-keystone-patent-direction-review.md`
- `docs/memory/2026-09-12-birth-record-and-patent-series-verification.md`
