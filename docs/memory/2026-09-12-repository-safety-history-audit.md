# Repository-safety and history-integrity audit — 2026-09-12

## Context

The founder asked: "is our repor safe can any of it be erased, has any edit
devalued or assets and architecture." This followed the same day's
cryptographic-anchor verification work and a "was the IP registered"
follow-up (see `docs/memory/2026-09-12-cryptographic-anchor-verification.md`).
This record covers the separate, direct safety/integrity audit that
question prompted.

## What was checked

1. **GitHub-side access and settings**, via `gh api`, not assumption:
   repository visibility/archived/disabled status, the collaborator list
   and each collaborator's permission level, and branch-protection rules on
   `axaxiaxes-axiom-monorepo`.
2. **History-rewrite evidence**: re-resolved the three commit hashes already
   cited elsewhere in this project's register via a live `gh api` call, and
   pulled each commit's GitHub signature-verification object
   (`verification.verified`, `verification.reason`, `verification.verified_at`).
   Also ran `git fsck --full --unreachable` and inspected a sample
   unreachable object.
3. **Complete deletion search**: `git log --diff-filter=D --summary --all`
   across the entire history (not a recent window or a sampled set of
   files), to find every file ever removed from the repository.
4. **Net-negative edit search**: `git log --numstat` on the core founding
   and business documents (the two `docs/keystone/` founding files, the
   business plan, the governance/safeguarding doc, and `PROJECT_TIMELINE.md`)
   to find every commit where more lines were removed than added, then
   inspected each such commit's actual diff.

## Findings

- **Access:** `AxAxiAxes` is a single user account (the `orgs/.../members`
  endpoint returned 404, confirming it is not an organization). The
  collaborators endpoint lists only that one account, with admin/push
  access — no other collaborator exists. The repository is public (already
  recorded separately), active, not archived, not disabled.
- **Branch protection:** none configured on `axaxiaxes-axiom-monorepo`
  (`404 Branch not protected`). This means nothing at the GitHub level
  would stop a force-push or deletion by whoever holds that one account's
  credentials — but no second account has access, and this session's own
  tooling has no capability to force-push, rewrite history, or delete a
  branch or repository.
- **History integrity:** all three previously-cited commit hashes
  (`6a26824e7...`, `4af1eeca9...`, `258e14a58...`) still resolve, and each
  carries a real GitHub-issued PGP signature with `"verified": true,
  "reason": "valid"`, signed by GitHub's own `web-flow` identity (this is
  how GitHub signs commits made through its web UI/API, distinct from a
  personal GPG key). Two of the three have a `verified_at` that matches
  their own stated commit timestamp to the exact second (immediate,
  in-band signing at creation); the third — the earliest "Initial commit,"
  which states an author-date of 2026-06-07 — has a `verified_at` of
  2026-09-09, roughly three months later. Per GitHub's own documentation,
  `verified_at` reflects when GitHub's persistent-verification system last
  *checked* a signature, not necessarily when the commit was first created,
  so this gap is **not treated as proof the date was falsified** — it is
  recorded here as a genuine, checkable discrepancy, not a conclusion.
  `git fsck --unreachable` found 535 unreachable objects against 304
  reachable commits on this branch; a sampled unreachable commit's message
  ("copilot checkpoint: ...") identifies it as a routine internal session
  checkpoint, an expected squash-merge byproduct, not erased content.
- **The one real deletion:** across the entire commit history, excluding
  ordinary `node_modules` dependency-cleanup deletions, exactly one content
  file was ever deleted: `docs/URNUR_NON_MONETARY_RECOGNITION.md`. It was
  created 2026-09-10 and deleted the same day, in the same commit that
  recorded a founder-directed pivot ("URNUR is an intended monetary
  currency and future bank") and rewrote `docs/URNUR_FINANCIAL_READINESS.md`
  accordingly. `PROJECT_TIMELINE.md` recorded this transparently at the
  time (it was never hidden), including a same-day "two-layer direction"
  entry describing a currency path **plus** a separate non-monetary layer —
  meaning the file deletion went further than the founder's own recorded
  direction called for. The file's exact prior text was retrieved via
  `git show <parent-commit>:<path>` (fully recoverable; nothing about a
  normal git deletion is actually unrecoverable short of history rewriting
  plus garbage collection, neither of which occurred).
- **Net-negative edits:** across roughly 190 historical commits touching
  `PROJECT_TIMELINE.md`, exactly two had more removed than added lines.
  Both were inspected directly: the 2026-09-12 compaction commit's diff
  confirms its own claim (26 lines replaced with 26 tighter lines carrying
  the same facts/evidence links); a 2026-09-09 commit replaced an obsolete
  "blocked, here's how to unblock" instruction block with a "this was
  verified, here's what happened" record once that milestone completed —
  ordinary bookkeeping, not content loss. No core founding or business
  document showed any other net-negative edit.

## What was produced

- Restored `docs/URNUR_NON_MONETARY_RECOGNITION.md` verbatim from git
  history (commit `92b1a9a`), with a transparency note at the top
  explaining its deletion/restoration history, since the record it defines
  is still referenced as active direction and the file itself is purely
  protective governance scaffolding (no claims, no new capability, fully
  reversible).
- Cross-linked it from `docs/URNUR_FINANCIAL_READINESS.md`'s existing
  "Non-monetary contributor layer" summary section.
- Added a new crisis-register row and a full "2026-09-12 Repository-safety
  and history-integrity audit" section to
  `docs/AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md`.

## What was explicitly not done

- Did not alter GitHub repository settings (visibility, branch protection,
  collaborators) — those are the founder's own account-level decisions;
  this audit only observed and reported current settings.
- Did not treat the `verified_at` discrepancy on the first "Initial commit"
  as proof of backdating — GitHub's own documentation describes that field
  as a verification-check timestamp, not a creation timestamp, so this is
  recorded as an open, unresolved discrepancy rather than a conclusion.
- Did not modify the wording of the restored file from its original text.

## Next steps

- None required to close this specific question; flagged only for the
  founder's awareness: branch protection is not currently configured on
  the base branch, which is a GitHub account-level setting the founder may
  want to enable directly if desired (outside this session's authority to
  decide unilaterally, since it changes how the founder's own account can
  push to that branch).
