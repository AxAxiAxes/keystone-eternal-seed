# AXI continuity-memory and bounded capability plan

**Date:** 2026-09-23  
**Status:** Architecture and operations plan aligned to the current repository-controlled AXI foundation

## Relationship to existing records

This plan extends, and does not replace, the current bounded records in:

- `docs/AXI_AUTOMATION_SERVICE.md`
- `docs/AXI_SOURCE_CATALOG.md`
- `docs/ENGINE_INTEGRATION.md`
- `docs/RAILWAY_DEPLOYMENT.md`
- `docs/AXI_PROJECT_CONTEXT_CHECKPOINT.md`
- `docs/memory/README.md`

It keeps the existing governance rule intact: temporary chat context, upload
storage, durable memory writes, and approved source-catalog promotion are
distinct operations with different review boundaries.

## 1. Continuity memory layers

### 1.1 Episodic conversation memory

- Continue using the existing append-only `episodic` layer for chat turns,
  session-scoped where applicable.
- Record the user message text and AXI reply text only; do not silently promote
  attachment contents into durable memory just because a file was temporarily
  consulted during one reply.
- Preserve per-session isolation so one visitor cannot retrieve another
  visitor's history.

### 1.2 Semantic summaries and facts with provenance

- Keep `semantic` memory as the place for reviewed, durable facts and summaries.
- Require provenance references for every durable fact or summary.
- Do not allow ad hoc chat attachment use to auto-create semantic memory.

### 1.3 Decisions and procedures

- Continue using the existing `decision` and `procedure` layers for bounded,
  attributable operational conclusions and workflows.
- Durable promotion remains explicit and reviewable; temporary inference during
  a chat reply is not a durable decision.

### 1.4 Attachment and source-reference integrity

- Treat uploaded files as separately stored bytes under `uploads/`.
- Preserve `sourceReference`, `sha256`, size, original filename, and MIME type
  in bounded request/response state when a chat turn references an upload.
- Require the chat path to re-resolve only files under the configured upload
  directory and re-verify the SHA-256 before use.
- Keep `source.catalog` approval-gated for durable source registration.

## 2. Retrieval strategy and context-window budgeting

- Use recent session-scoped episodic memory plus bounded attachment extracts as
  the short-term context pack for a chat reply.
- Start with small, explicit limits:
  - at most 4 attachments per chat turn;
  - at most 1 MiB of declared attachment bytes across the request;
  - at most 64 KiB extracted from any one readable file for a reply;
  - at most 24,000 extracted attachment characters added to a reply context.
- Keep unsupported or truncated files visible in response metadata so AXI can be
  honest about what it did or did not read.

## 3. Compaction and summarization rules

- Summaries may compress context for retrieval efficiency, but they must never
  silently overwrite original source history.
- The append-only memory layers, continuity record, and source-catalog hashes
  remain the historical record; compaction products are derivative aids.
- Any future summarization job should record its own provenance, scope, and
  generation time as a separate entry rather than rewriting earlier records.

## 4. Retention, quotas, observability, and recovery

- Keep explicit quotas/attention signals for:
  - memory-directory growth;
  - upload-directory growth;
  - attachment-processing failures;
  - hash mismatches or missing files;
  - scheduler and monitoring readiness.
- Extend observability with per-capability counters and failure categories
  rather than generic “unavailable” responses.
- Preserve corruption detection via retained hashes and fail-closed readiness
  behavior when continuity/state files are malformed.
- Continue using checkpoints and independent recovery bundles for retained state
  files, and treat upload-binary backup coverage as a separate reviewed stage.
- Run restore drills only into the isolated recovery directory and record the
  result.
- Version future memory schema changes explicitly and provide migrations that
  preserve prior retained records.

## 5. Privacy classification, isolation, deletion, and correction

- Preserve per-session chat isolation for anonymous/public visitors.
- Keep durable promotion approval-gated for protected memory and source-catalog
  writes.
- Classify attachments and derived facts under the same privacy labels already
  used by the source catalog; classification is operational, not a legal claim.
- Add explicit operator workflows for deletion/correction of durable promoted
  memory while preserving append-only audit evidence of the correction itself.
- Do not mix one user's public-session context with another user's durable or
  protected records.

## 6. Railway limits and the path beyond a single persistent volume

- Railway's current persistent volume is adequate for bounded local memory and
  upload storage, but it is not the long-term durability target.
- Known limitations today:
  - one-instance local-disk dependency for uploaded bytes;
  - binary upload content not yet included in the current JSON-oriented
    checkpoint/recovery bundle format;
  - operational recovery still depends on separately verified backup storage.
- Target staged evolution:
  1. keep current bounded file-based storage for local/private continuity;
  2. move durable structured records to a reviewed database with explicit
     migrations, integrity checks, and backup policy;
  3. move larger uploaded objects to a reviewed object store with integrity
     metadata, lifecycle policy, and restore verification;
  4. keep approval-gated promotion semantics unchanged across the migration.

## 7. Acceptance criteria for continuity and coherence

- A public chat turn can use a supported text attachment only when the uploaded
  file reference, size, and SHA-256 all validate successfully.
- AXI can distinguish “uploaded,” “attached to this message,” “processed,” and
  “failed” without claiming unsupported interpretation.
- Unsupported document/image formats produce honest stored-but-unreadable
  results unless a separately tested processor is added.
- No temporary attachment use auto-creates a durable memory or source-catalog
  entry.
- Observability can distinguish configuration mismatch, missing route,
  unreachable engine, and integrity failure states.
- Recovery and migration procedures preserve original retained records and their
  auditability.

## 8. Least-privilege capability model for automation and web access

### 8.1 Capability posture

- Preserve the current allowlisted-capability model in
  `docs/AXI_AUTOMATION_SERVICE.md`.
- Every sensitive capability needs:
  - an explicit allowlist entry;
  - a separate enable flag when appropriate;
  - scoped credentials supplied by an operator, never generated by AXI;
  - audit history;
  - rate/size/time limits;
  - a kill switch or disable path.

### 8.2 Task automation boundaries

- Keep approval-gated tasks approval-gated.
- Prevent an agent from assigning, approving, or reactivating itself or another
  agent.
- Preserve retry bounds, dependency tracking, and durable run history.
- For future higher-risk automation, require explicit idempotency rules,
  dead-letter handling, and a founder-approved audit trail before activation.
- Repository access alone does not authorize deployment, billing, account,
  cloud, DNS, or messaging actions.

### 8.3 Web access boundaries

- Keep web access off by default and read-only unless a new reviewed stage is
  explicitly approved.
- Preserve SSRF blocking, private-network denial, response-size/time caps, no
  redirect following, and no credential/cookie forwarding.
- Add any broader web capability only through an explicit domain/action
  allowlist and its own tests; do not silently turn a fetch utility into a
  browser controller.

## 9. Attachment-processing implementation stages

- **Current stage (this plan's implementation companion):** verified upload
  references, bounded text extraction for `.txt`, `.md`, `.csv`, `.json`,
  honest unsupported responses for image/document formats, no durable promotion.
- **Follow-up stage (requires new review and tests):** PDF/DOC/DOCX extraction
  only if the repository adopts a reviewed dependency and regression coverage.
- **Follow-up stage (requires a tested vision-capable path):** image
  interpretation only after a model/tool path is actually implemented, bounded,
  and verified.
