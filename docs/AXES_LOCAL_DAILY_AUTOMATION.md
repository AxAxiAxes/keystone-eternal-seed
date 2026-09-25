# AXES local daily reconciliation automation (repository-only, zero provider cost)

This document describes a free local automation baseline for daily
reconciliation and diary drafting from repository facts only.

## What this script automates for free

`scripts/prepare-axes-daily-diary.js` generates a **draft** daily reconciliation
entry using only:

- Node.js built-ins
- read-only local `git` commands
- repository files in this clone

It gathers bounded, verifiable facts:

- date basis (`--date YYYY-MM-DD` or local current date)
- branch and HEAD SHA
- clean/dirty working-tree status with changed paths only (no file contents)
- bounded recent commit summary (subject/author/date)
- unchecked checkpoints from canonical root `PROJECT_TIMELINE.md`
- required governance/accountability/automation source-file presence checks
- explicit local-only references and external-state disclaimers

## Run modes

Preview (default, no file writes):

```bash
node scripts/prepare-axes-daily-diary.js --date 2026-09-25
```

Write mode (creates only one new draft file):

```bash
node scripts/prepare-axes-daily-diary.js --date 2026-09-25 --write
```

Output path:

```text
docs/memory/drafts/YYYY-MM-DD-daily-reconciliation-draft.md
```

Write mode is fail-closed:

- malformed `--date` values are rejected
- missing canonical `PROJECT_TIMELINE.md` aborts
- repository-root detection failure aborts
- unsafe output path generation aborts
- existing output file is never overwritten

## Manual founder/operator promotion flow

The generated file is always a **DRAFT** and is not canonical evidence by
itself.

Manual promotion path:

1. Review each generated fact against repository evidence.
2. Add human interpretation, decisions, and any external evidence manually.
3. Create a final dated continuity entry under `docs/memory/`.
4. Update `PROJECT_TIMELINE.md` and `docs/memory/README.md` manually when
   appropriate.

The script never auto-edits those canonical records.

## What remains human-controlled

This local script does **not** activate or change:

- scheduler/runtime state
- Railway deployment settings
- DNS/TLS/domain routing
- mailbox/account/billing/vendor settings
- secrets or provider keys
- external services
- commits, pushes, PR creation, publication, or deployment

## Relationship to AXIOM bounded task automation

This script can later be invoked as a bounded local task after required runtime
accountability and recovery readiness checks are verified by an authorized
operator (see `docs/AXI_AUTOMATION_SERVICE.md` and `AGENTS.md`).

Using this script from a bounded task does not expand action authority: it
remains repository-only draft preparation with operator review.

## Provider-cost boundary

This local diary draft script does not call model/provider APIs and has no
provider token cost by itself.

Agent Chat or other model-generated interpretation paths still require a
configured provider key (for example `OPENAI_API_KEY`) and may incur cost.
