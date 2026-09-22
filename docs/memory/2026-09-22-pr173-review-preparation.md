# 2026-09-22: PR #173 review preparation, local fixes, and approval hold

Subsequent authorization and remediation are recorded in the
[2026-09-22 follow-up](2026-09-22b-pr173-authorized-remediation.md).
The hold and verification details below describe this earlier checkpoint.

## Reviewed source basis and scope

Prepared [PR #173](https://github.com/AxAxiAxes/keystone-eternal-seed/pull/173)
for review, not merge or deployment. The reviewed startup basis was
`AGENTS.md`, `README.md`, the recent milestones and current checkpoints in
`PROJECT_TIMELINE.md` (lines 1-39 and 244-401), and these records:

- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`,
  `docs/AXES_AGENT_ORIGIN_REGISTRY.md`, and
  `docs/AXI_PROJECT_CONTEXT_CHECKPOINT.md`.
- `docs/AXES_BUILD_PROGRAM.md`, `docs/AXES_PLATFORM_PLAN.md`,
  `docs/AXI_AUTOMATION_SERVICE.md`, `docs/ENGINE_INTEGRATION.md`, and
  `docs/RAILWAY_DEPLOYMENT.md`.
- `docs/memory/README.md`,
  [the ledger implementation handoff](2026-09-19h-copilot-accountability-ledger-mvp.md),
  and [the latest base handoff](2026-09-20b-s1-dashboard-paperwork-section.md).
- `docs/COPILOT_ACCOUNTABILITY_TRACKER.md`,
  `docs/AXI_CONTINUOUS_VALIDATION.md`, `docs/CI_CONTINUITY_RUNBOOK.md`,
  `docs/AXES_OS_PORTABILITY.md`,
  `docs/keystone/AGENT_SERVICE_DELIVERY_PROTOCOL.md`, and
  `.github/PULL_REQUEST_TEMPLATE.md`.

The PR's changed code, tests, packaging, and source-declaration documents
were inspected. This is a task-specific source basis, not complete project
knowledge or an external legal, financial, or deployment determination.

## Branch and conflict evidence

- Initial local and live PR head:
  `209cd40e67873e4a5428dbb5e3b63ad329eca7ee`.
- The PR API's recorded base and original merge base:
  `814638b946d531a4878619e846badc5f4c7e4705`.
- Actual current `axaxiaxes-axiom-monorepo` branch tip:
  `4ba5c0ac4ce754cb5ef48cd7d85793600910ec4f`.
- `git merge-tree` reproduced exactly one conflict, in
  `docs/memory/README.md`: independent additions under Latest handoff.
  Both sets of links were preserved.
- Normal local merge commit:
  `db8f449474040e5f3b63894f32b68b4f71946653`, with the initial PR head and
  actual base tip as its two parents. No rebase, force push, or shared-base
  ref rewrite was used.

The remote PR remained Draft, `mergeable=false`, `mergeable_state=dirty`,
and auto-merge unset at the 2026-09-22 14:47 Pacific recheck. That remote
state still describes the initial head, not the unpublished local merge.

## Reproduced correctness fixes

- `apps/axiom-engine/accountability-ledger-service.js`: minimum-rating
  filters now accept bounded decimal query-string integers. Invalid values
  remain errors, and unrated records do not match a rating threshold.
- `apps/axiom-engine/checkpoint-service.js`: the shared persisted-file
  allowlist now includes `accountability-ledger.jsonl`, covering both
  checkpoint hashes and recovery bundle creation/isolated restoration.
- `apps/axiom-engine/monitoring-service.js`: an invalid ledger now produces
  `accountability-ledger-unavailable`, with the existing deduplicated
  attention-notification behavior.

Five failing regression cases reproduced these three issues before the
fixes; the same targeted run subsequently passed all 35 tests. Coverage is
in the existing accountability, engine, checkpoint, recovery, and monitoring
test files. Related tracker, automation, and portability documents were
updated. The original founder-declaration documents were not changed.

## Verification

Local platform: Windows, Node.js `v24.20.0`, npm `11.19.0`, .NET SDK
`8.0.425`. Hosted Node validation uses Node 20 on Ubuntu.

| Command and working directory | Result |
| --- | --- |
| `npm test -- --test-reporter=tap` in `apps/axiom-engine` | 128 passed, 0 failed after the correctness fixes; merged baseline was 126 passed |
| `npm test -- --test-reporter=tap` in `apps/axiom-freedom` | 14 passed, 0 failed |
| `node --test --test-reporter=tap` in `docs/fixtures/axes-directory` | 10 passed, 0 failed |
| `dotnet test AXIOM.sln --configuration Release --verbosity minimal` at repository root | 5 passed, 0 failed |
| `git diff --check` | Passed |

The initial Node attempts failed because `express` was absent. Only then
were locked engine dependencies restored using
`npm ci --ignore-scripts --no-audit --no-fund`. The first .NET
`--no-restore` attempt failed with `NETSDK1004`; the normal test command
then restored the missing assets. No dependency manifest or lockfile was
upgraded. Neither app defines an additional lint, build, or type-check script.
Docker was not available on the local PATH, so no local image build is claimed.

For the original remote head, all six required jobs actually ran and passed
in [run 35707033504](https://github.com/AxAxiAxes/keystone-eternal-seed/actions/runs/35707033504).
The seventh, workflow-run-only continuity signal was intentionally skipped
on that push. There were no legacy commit-status contexts; their aggregate
`pending` value is not a failure of the six completed check runs.

The older [failed run 35474287886](https://github.com/AxAxiAxes/keystone-eternal-seed/actions/runs/35474287886)
reported the engine image's missing `accountability-ledger-service` module,
already fixed by existing PR commit `f31fd2278c2c823fc82a1cdf9640853dd26d4864`.
The initial-plan [run 35473629756](https://github.com/AxAxiAxes/keystone-eternal-seed/actions/runs/35473629756)
was `action_required` with no jobs, not a current-head code failure.

## Outstanding review and publication gates

The coordinator explicitly held security remediation and publication pending
the requested follow-up decision. No security fix or remote push is claimed
by this checkpoint. Outstanding reproduced concerns:

- Rating notes are interpolated into HTML without escaping. The independent
  read-only reviewer reported this at the original head; local rendering
  reproduction confirmed raw markup, not execution in a real browser.
- The ledger's browser-authenticated POST accepts a cross-origin plain-text
  body and forwards it as privileged JSON. A disposable loopback proxy
  reproduction returned 201; no external service or real data was used.
- A string-valued `humanConfirmed` input can be coerced to true.
- Disputing previously verified evidence does not clear the projected
  evidence-backed completion or verified-success count.

The last two integrity findings were relayed separately for a narrowly
scoped decision. Historical events must remain intact; no new human
confirmation may be inferred or manufactured.

There were no inline review threads. The existing owner approval applied to
`f31fd2278c2c823fc82a1cdf9640853dd26d4864`, not the subsequent or local
commits. Eventual review requires the outstanding findings to be resolved or
explicitly decided, a fresh remote-head check before normal publication,
all required checks on the published final SHA, and explicit authorization
before leaving Draft or merging. Local success cannot replace those gates.

No deployment, scheduler/provider activation, Actions approval, branch-rule
change, account action, or other worktree/process modification was performed.
Temporary test servers were closed. No new Command Center or memory system
was created.

## Resource and service-accountability limits

The pre-implementation estimate for the remaining preparation was 45-75
minutes, not a billing commitment. Work reached this approval hold about
30 minutes after the task relay; the full request is not complete. No
external spending was requested or authorized. Founder labor time,
subscription charges, invoices, and satisfaction are not determinable from
this work and are not recorded as confirmed values.

Provisional quality self-rating: 7/10 for the bounded local preparation and
regression coverage; security/integrity remediation and hosted final-head
readiness remain unresolved. A founder rating has not been supplied.
