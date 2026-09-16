# 2026-09-15 AXI document filing + source-catalog/automation options discovery

## What was asked

Two related founder follow-ups after the automation-readiness work
(PR #75-#77):

1. "can we send him documents to review and file in his memory?"
2. "please optimize his intake to all type of files and optimize hiz
   options"

## Part 1: live-verified document filing (no PR at the time; folded in here)

Investigated the two real mechanisms AXI has for "filing" something:

- `memory-store.js`: plain text notes only, four kinds
  (`episodic|semantic|decision|procedure`), bounded by the default
  `express.json()` body limit (~100KB). No file/binary support.
- `source-catalog-service.js`: an append-only, hash-chained **metadata**
  catalog. A caller supplies `sourceId`, `title`, `sourceType`,
  `classification`, `sourceReference` (a repo-relative path string — not
  verified to exist), and an independently computed SHA-256. It does not
  read, copy, upload, or store the underlying file. `reviewStatus` is
  hard-coded to `"operator-approved"`. The only way to write to it is via
  an automation task with `action: "source.catalog"`, which
  `automation-service.js` hard-codes to require `approvalRequired: true`
  and assignment to the `project-memory-manager` agent.

Live-verified end-to-end on a disposable local instance (temp data dir,
throwaway admin password, no production state touched):

1. Computed the real SHA-256 of `docs/AXI_AUTOMATION_SERVICE.md`.
2. `POST /automation/tasks` with `action: "source.catalog"` and
   `approvalRequired: true` (confirmed the service rejects the task
   without this flag, with `"source.catalog tasks require operator
   approval"`).
3. `POST /automation/tasks/:id/approval` with `{"approved": true}`
   (confirmed the field name is `approved`, a boolean — not `decision`).
4. `POST /automation/process` — task executed, catalog entry created with
   the correct SHA-256 and `reviewStatus: "operator-approved"`.
5. Filed a companion `semantic` memory note via `POST /memory/semantic`
   summarizing the reviewed document.
6. Tore down the demo instance and temp directory.

**Conclusion:** founder can already send AXI documents to review today, by
reference (path + hash) plus a plain-text summary note, through the
existing approval-gated pipeline. What AXI cannot do (and was not asked to
do here) is accept and store raw uploaded file bytes.

## Part 2: read-only discovery endpoints (shipped in PR #78)

The literal ask ("optimize intake to all type of files") could be read as
"accept raw file uploads." That would reverse a documented, deliberate
safety boundary in `docs/AXI_AUTOMATION_SERVICE.md`: `source.catalog`
"does not read, copy, upload, classify, or interpret raw source content."
Lifting that is a capability-allowlist change requiring explicit founder
authorization, not a routine repository change — so it was **not**
implemented.

Instead, shipped the safe, additive interpretation of "optimize his
options" — making every existing choice discoverable via the API instead
of requiring hardcoded/tribal knowledge:

- `GET /automation/actions`: every allowlisted automation action, its
  approval requirement, fixed agent (if any), and expected payload fields.
- `GET /system/source-catalog/options`: valid `sourceType`
  (`application`/`dataset`/`document`/`media`/`record`/`other`) and
  `classification` values, plus field constraints. `sourceType` already
  covers every kind of file as a metadata classification — not a
  file-extension allowlist — with `other` as an explicit catch-all.

Both routes are read-only, unauthenticated GETs (matching the existing
`/automation/*` and `/system/*` open-GET pattern), added no new
dependencies, and changed no existing behavior.

Verified with `node --test` in `apps/axiom-engine`: 90/90 passing,
including 4 new tests covering catalog/allowlist parity, the options
schema, and both new HTTP routes.

## Founder decision point (open)

If the founder wants AXI to actually accept and store raw file bytes (true
upload/ingestion, not reference-by-path), that is a deliberate capability
expansion requiring:

- adding a new versioned action (or extending `source.catalog`) to the
  allowlist in `docs/AXI_AUTOMATION_SERVICE.md`,
- a storage/size/type policy decision, and
- explicit founder sign-off, since it reverses a stated safety boundary.

Not implemented pending that decision.
