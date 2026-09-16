# AXI private source catalog

**Status:** Implemented private data-structuring foundation
**Catalog ID:** `axi-private-source-catalog-v1`
**Storage:** `source-catalog.jsonl` in the private AXI memory directory

## Purpose

The source catalog provides a durable, append-only index for the large body of
project material already held in the repository. It creates a structured
inventory without copying raw documents, media, datasets, private archives,
credentials, or personal information into AXI memory.

It is a metadata and integrity-evidence system, not a scraper, search index,
content-analysis service, or claim that AXI has read or fully understands any
cataloged source. It can now also store raw uploaded file bytes locally (see
"Uploaded sources" below), but only as an admin-authenticated, size-capped
storage step that is separate from, and does not replace, the operator
approval required to catalog a source.

## Approved entry fields

| Field | Requirement |
| --- | --- |
| `sourceId` | Unique lowercase kebab-case identifier, up to 120 characters. |
| `title` | Non-sensitive descriptive title, up to 200 characters. |
| `sourceType` | `application`, `dataset`, `document`, `media`, `record`, or `other`. |
| `classification` | `public`, `internal`, `private`, or `restricted`. |
| `sourceReference` | Repository-relative path, or an `uploads/<name>` path returned by the upload endpoint (see "Uploaded sources" below); absolute paths and traversal are rejected either way. |
| `sha256` | 64-character SHA-256 content hash supplied as integrity evidence. |
| `reviewStatus` | Set by the service to `operator-approved`. |

Every recorded entry also has a UUID, sequence number, timestamp, previous
catalog hash, and its own SHA-256 hash. Catalog history is append-only.

## Lifecycle

1. An authorized operator selects one repository-controlled source and
   determines its non-sensitive metadata and SHA-256 evidence.
2. The operator queues a `source.catalog` task assigned to
   `project-memory-manager` with `approvalRequired: true`.
3. The operator reviews and approves the task.
4. The Project Memory Manager appends the catalog entry and the automation
   service records the task run.
5. Protected operator views display the catalog status and recent entries.

Duplicate source IDs and invalid input are rejected. If retained catalog
history is malformed or hash validation fails, AXI preserves the file,
reports `source-catalog-invalid`, and blocks manual and scheduled automation
until an authorized review resolves the state.

## Uploaded sources

`POST /system/source-catalog/uploads` accepts raw file bytes as the request
body and stores them under this instance's own local data directory (never
the git repository, never an external/cloud store). It requires admin
credentials and is size-capped by `AXIOM_SOURCE_UPLOAD_MAX_BYTES` (default
5 MB). It returns a `sourceReference` (an `uploads/<uuid>.<ext>` path) and a
`sha256` computed from the stored bytes -- not a caller-supplied value.

Storing an upload does **not** create a catalog entry. An operator-approved
`source.catalog` task must still be queued and approved, referencing the
returned `sourceReference` and `sha256`, exactly as with a repository path.
This preserves the existing operator-approval boundary while allowing the
underlying file content to actually be stored, not just referenced by path.

## Boundaries

- The `source.catalog` action itself does not read, summarize, publish, or
  change raw source content -- it only records metadata and a hash.
- The separate upload endpoint stores raw bytes, but only to local disk on
  this instance, only for an admin-authenticated caller, and only up to the
  configured size cap; it never uploads, transmits, or publishes content to
  any external destination.
- Classification is an operational label, not a legal, privacy, ownership,
  or rights determination.
- Do not place credentials, personal data, sensitive titles, raw source
  material, provider prompts, or private archival content in the catalog.
- A SHA-256 value records supplied integrity evidence; it is not a legal
  ownership, patent, authenticity, or provenance determination.
- The catalog cannot access accounts, websites, cloud storage, DNS, TLS,
  payments, messaging, or external services.

## Persistence and recovery

`source-catalog.jsonl` is included in private checkpoint manifests and recovery
bundles. A checkpoint or bundle can preserve the catalog file but does not
prove that its recovery destination is independently durable. An authorized
operator must verify the configured destination and use an isolated restore
path before treating recovery as ready.

**Known limitation:** raw uploaded file bytes stored under `uploads/` by
`POST /system/source-catalog/uploads` are **not** currently included in
checkpoint manifests or recovery bundles -- those only cover the fixed set of
small state files listed in `checkpoint-service.js`'s `PERSISTED_FILE_NAMES`.
An uploaded file therefore currently survives only as long as the instance's
local disk does, until backup/recovery coverage is explicitly extended to the
`uploads/` directory as a separate, reviewed change (raw binary content does
not fit the existing JSON+base64 bundle format well at scale).

## Current onboarding state

The implementation starts with no seeded catalog entries. No repository source
has been automatically cataloged, interpreted, or published. This preserves
the distinction between building the data structure and asserting that large
existing source collections have been reviewed.
