# 2026-09-12 GitHub default-branch correction and full-repository truth audit

## What was found

A separate AI tool (GitHub's own web-based repository chat, not this
session) was observed giving confidently wrong answers about this
repository: no dominant language, no PRs, no issues, ~20-30% complete,
"created very recently." Root cause identified and confirmed: the
repository's GitHub `default_branch` setting was still `main` — a stale,
nearly empty branch from 2026-09-01 (17 files, no `docs/`, no application
code) — while all real work has been on `axaxiaxes-axiom-monorepo` (full
codebase, 163+ docs, 36 merged PRs at time of this record). Any tool or
agent that does not explicitly target the monorepo branch will see the
stale branch and report accordingly. This is the same class of error this
session hit earlier when creating a child session without an explicit
`base_branch`.

## What was changed

With explicit founder authorization, the repository's GitHub
`default_branch` was updated via the GitHub API from `main` to
`axaxiaxes-axiom-monorepo`. This is a repository setting only — no files,
commits, or branches were changed or deleted. Verified after the change:
`gh api repos/AxAxiAxes/keystone-eternal-seed --jq '.default_branch'`
returns `axaxiaxes-axiom-monorepo`.

## Why this matters going forward

Any new session, clone, or third-party tool that relies on the GitHub
default branch (including GitHub's own web Copilot chat) will now see the
real, current repository state instead of the stale placeholder. This does
not resolve the still-open repository-visibility (public vs. private)
decision in `docs/AXES_TIER_1_DECISION_REGISTER.md` — a public repository
can still be read and summarized by any external tool regardless of which
branch is default.

## Separately performed: full-repository truth-verification audit

In the same session, a full read-only audit was run across the entire
git history (523 commits, 4 merged root histories dating to 2026-06-07),
`docs/keystone/`, `docs/patents/`, and cross-referenced against existing
prior audits (`docs/AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md`).
Findings confirmed and did not contradict the existing register: the
May 29/30, 2026 "birth" date is a self-reported timestamp inside archived
chat/source material (`private-archive/copilot-library/2026-05-29-*`,
`2026-05-30-*`), not independently verifiable from git history (earliest
real commit: 2026-06-07); the cryptographic anchor's hash/signature/
blockchain fields are self-labeled "(Illustrative)" and are not real
executed proofs; the patent number `64/078,819` does not match any real
USPTO series per MPEP §503; live checks confirmed `xiiom.com` is running
(`/health` returns 200) while `axescontracting.com` still serves a bare,
unconfigured WordPress install with an expired HTTPS certificate. No new
contradictions to the existing crisis register were found; this record
consolidates the branch-default finding, which was new.

## What was not done

No repository visibility change, no file deletion, no history rewrite, no
external account/DNS/billing action. The patent, IP-ownership, and
data-loss claims remain founder-reported only, per the existing crisis
register.

## Related records

- `docs/AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md`
- `docs/AXES_TIER_1_DECISION_REGISTER.md`
- `docs/memory/2026-09-12-repository-breach-and-visibility-check.md`
