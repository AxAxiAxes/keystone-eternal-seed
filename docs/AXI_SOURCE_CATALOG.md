# AXI private source catalog

**Status:** Implemented private data-structuring foundation
**Catalog ID:** `axi-private-source-catalog-v1`
**Storage:** `source-catalog.jsonl` in the private AXI memory directory

## Purpose

The source catalog provides a durable, append-only index for the large body of
project material already held in the repository. It creates a structured
inventory without copying raw documents, media, datasets, private archives,
credentials, or personal information into AXI memory.

It is a metadata and integrity-evidence system, not a file uploader, scraper,
search index, content-analysis service, or claim that AXI has read or fully
understands any cataloged source.

## Approved entry fields

| Field | Requirement |
| --- | --- |
| `sourceId` | Unique lowercase kebab-case identifier, up to 120 characters. |
| `title` | Non-sensitive descriptive title, up to 200 characters. |
| `sourceType` | `application`, `dataset`, `document`, `media`, `record`, or `other`. |
| `classification` | `public`, `internal`, `private`, or `restricted`. |
| `sourceReference` | Repository-relative path only; absolute paths and traversal are rejected. |
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

## Boundaries

- Cataloging does not read, upload, copy, summarize, publish, or change raw
  source content.
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

## Current onboarding state

The implementation starts with no seeded catalog entries. No repository source
has been automatically cataloged, interpreted, or published. This preserves
the distinction between building the data structure and asserting that large
existing source collections have been reviewed.
