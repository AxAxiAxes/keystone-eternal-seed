# 2026-09-15 Raw source-file upload capability (founder-authorized)

## What was asked

Following the read-only discovery-endpoints work (PR #78), the founder was
asked whether to actually implement raw file-byte upload/storage for the
source catalog -- a capability previously and deliberately not built because
it reversed a documented safety boundary. The founder replied "yes."

Before implementing, one design parameter was surfaced for founder input
(max upload size, since it affects disk-exhaustion risk on the Railway
instance); the founder was not available to answer synchronously, so a safe,
conservative default (5 MB per file, admin-authenticated, local-disk-only)
was applied and documented as adjustable via an environment variable.

## What was implemented

- **`POST /system/source-catalog/uploads`** (new route, admin-authenticated
  via the existing HTTP Basic `requireAdmin` gate): accepts raw file bytes
  as the request body, stores them to this instance's own local data
  directory under a new `uploads/` subdirectory (never the git repository,
  never an external/cloud store), and returns a `sourceReference`
  (`uploads/<uuid>.<ext>`) and a `sha256` **computed server-side from the
  stored bytes** -- not a caller-supplied value, closing a class of
  integrity-spoofing risk that existed in the metadata-only path.
- Size-capped via `AXIOM_SOURCE_UPLOAD_MAX_BYTES` (default 5 MB / 5,242,880
  bytes); oversized requests fail with a clear `413` and a message stating
  the configured limit, handled via a dedicated body-parser error branch.
- Upload filenames are only ever used to preserve a short, sanitized file
  extension (e.g. `.pdf`) on the stored name -- the caller-supplied name or
  path is never used to construct a filesystem path, closing a path-
  traversal vector.
- `describeOptions()` and `GET /system/source-catalog/options` now report
  the upload route, its auth requirement, and the configured size cap, so
  this is discoverable rather than requiring hardcoded knowledge.
- 8 new tests added (4 unit tests in `source-catalog-service.test.js`
  covering byte-for-byte storage, sha256 correctness, filename sanitization
  against a path-traversal attempt, and empty-buffer rejection; 2 HTTP
  integration tests covering the 401/201 auth boundary and byte-identical
  round-trip; 1 HTTP test for the 413 size-limit path; 1 updated
  `describeOptions()` test for the new `upload` field). Full
  `apps/axiom-engine` suite: **94/94 passing**.

## What deliberately did NOT change

- **Cataloging still requires operator approval.** Storing an upload's bytes
  is a separate step from creating a `source.catalog` entry: the automation
  service still hard-codes `approvalRequired: true` and
  `agentId: "project-memory-manager"` for that action. An uploaded file
  existing on disk does not, by itself, become a catalog entry.
- **No backup/recovery coverage yet.** `recovery-backup-service.js` only
  captures a fixed list of small state files (`PERSISTED_FILE_NAMES`), not
  an arbitrary/recursive scan of the data directory. Raw uploaded bytes
  under `uploads/` are **not** currently included in checkpoint manifests or
  recovery bundles -- documented as a known limitation in
  `docs/AXI_SOURCE_CATALOG.md`, not silently glossed over. Extending
  backup/recovery to cover bulk binary content is a separate, larger design
  question (the existing bundle format is JSON+base64, which does not scale
  well to binary blobs) and was intentionally left out of this change.
- No new npm dependency was added; the upload route uses Express's built-in
  `express.raw()` body parser rather than a multipart-parsing library like
  multer, since the API only needs whole-file-as-body semantics.

## Founder decision it operationalizes

This directly implements the founder's explicit "yes" to the follow-up
question raised in the prior document-filing/options-discovery memory entry
(`2026-09-15-document-filing-and-intake-options-discovery.md`), which had
declined to build this without that explicit authorization. The max-upload-
size question was answered with a conservative default (5 MB) since the
founder was not available synchronously; this remains adjustable and open
to founder revision.
