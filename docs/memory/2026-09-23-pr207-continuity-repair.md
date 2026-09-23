# 2026-09-23: PR #207 bounded continuity repair

## Scope and source basis

The relayed instruction was "please automate all fixes" for the existing
[PR #207](https://github.com/AxAxiAxes/keystone-eternal-seed/pull/207).
This work covers its merge conflicts, verified continuity-path defects,
regression evidence, and normal publication to its existing head. It does not
authorize merging, auto-merge, deployment, Actions approval, runtime
activation, account changes, or work on other PRs.

Reviewed startup sources were `AGENTS.md`, `README.md`,
`PROJECT_TIMELINE.md` recent milestones/current phase (lines 1-39) and current
checkpoints/deployment/progress rules (244-401), and these records under
`docs/`: `AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`,
`AXES_AGENT_ORIGIN_REGISTRY.md`, `AXI_PROJECT_CONTEXT_CHECKPOINT.md`,
`AXES_BUILD_PROGRAM.md`, `AXES_PLATFORM_PLAN.md`,
`AXI_AUTOMATION_SERVICE.md`, `ENGINE_INTEGRATION.md`,
`RAILWAY_DEPLOYMENT.md`, `keystone/AGENT_SERVICE_DELIVERY_PROTOCOL.md`,
`memory/README.md`, the
[initial continuity implementation](2026-09-22-axi-workflow-run-continuity-automation.md),
and both [PR #173 preparation](2026-09-22-pr173-review-preparation.md) and
[authorized remediation](2026-09-22b-pr173-authorized-remediation.md) records.
Task-specific review also covered `CI_CONTINUITY_RUNBOOK.md`,
`AXI_CONTINUOUS_VALIDATION.md`, `AXI_ORIGIN_COORDINATE_SYSTEM.md`, the PR
template, workflow/script, changed engine/portal paths, manifests, and tests.
This is not a claim of complete project or private-runtime understanding.

## Merge and repair evidence

The clean checkout initially matched PR head
`f7c76a01123f3d35cb234f9a6b4924a76252c54d`.
The actual `axaxiaxes-axiom-monorepo` tip was
`ae863fa77fefe64df1f2189be594c0cf9b47a127`, although the PR API still recorded
base `4ba5c0ac4ce754cb5ef48cd7d85793600910ec4f`.
A normal merge reproduced conflicts only in
`apps/axiom-engine/index.js` and `docs/memory/README.md`. Both rate limiters
and both sets of continuity links were retained; neither history was rebased
or replaced. PR #173's ledger, recovery allowlist, monitoring, escaped-note
rendering, strict confirmations, current evidence eligibility, and
route-specific browser protections remain intact.

The repairs are supported by:

- `.github/workflows/axi-continuity-validation.yml` and
  `.github/scripts/record-workflow-run-continuity.js`: execute only the
  canonical workflow's pinned implementation, not an upstream branch's
  script with secrets. Read upstream files as raw tracked Git blobs, with
  exact 16 KiB contract/5 MiB source bounds; reject symlinks, untracked
  content, traversal, and Git metadata.
- The same script verifies the actual run/attempt through GitHub's read-only
  API for automatic and manual delivery. Failed, pending, gated, foreign, or
  mismatched runs cannot become synthetic success. Actual upstream
  coordinates stay distinct from the trusted execution SHA.
- Recording requires the explicit `AXI_CONTINUITY_ENABLED` repository
  variable plus private `AXIOM_WORKFLOW_RUN_CONTINUITY_REPOSITORY` allowlist,
  both disabled/unset by default. Examples and Compose forwarding retain
  those defaults. No real settings or secrets were configured.
- `apps/axiom-freedom/server.js` reuses the existing protected JSON/write
  header/Fetch Metadata pattern for the new continuity route, rejects its
  cross-origin preflight, and keeps unrelated CORS behavior unchanged.
- `apps/axiom-engine/automation-service.js` preserves ordinary coordinate
  tasks without idempotency keys, normalizes keys before lookup, validates
  reused requests, and safely returns the retained successful run for
  concurrent processing. Source metadata is prepared before coordinate
  mutation.
- `apps/axiom-engine/index.js` keeps all readiness gates, limits the
  recording repository/workflow/branch/run URL, and returns explicit failure
  when the task did not complete. It never drains unrelated queued work or
  enables the scheduler.

On 2026-09-23, GitHub's official
[workflow-run documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_run)
and [context reference](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#github-context)
confirmed the privileged `workflow_run` trust boundary and
`github.workflow_sha` semantics. The existing run-attempt API response was
also read without mutation to confirm its field shape. These findings justify
trusted-code/data separation and actual-attempt verification; no repository
content was sent to an external research system.

## Local verification checkpoint

| Command and working directory | Result |
| --- | --- |
| `npm test -- --test-reporter=tap` in `apps/axiom-engine` | 158 passed, 0 failed |
| `npm test -- --test-reporter=tap` in `apps/axiom-freedom` | 45 passed, 0 failed |
| `node --test --test-reporter=tap .github\scripts\test\record-workflow-run-continuity.test.js` at repository root | 33 passed, 0 failed |
| `dotnet test AXIOM.sln --configuration Release --verbosity minimal` at repository root | 5 passed, 0 failed |
| `node --test --test-reporter=tap` in `docs/fixtures/axes-directory` | 10 passed, 0 failed |
| `git diff --check ae863fa77fefe64df1f2189be594c0cf9b47a127` | Passed for the repair diff |
| Installed Docker CLI: `compose --env-file apps\axiom-freedom\.env.example --file apps\axiom-freedom\docker-compose.yml config --no-env-resolution --quiet` | Passed; templates only, no runtime environment file or container startup |

Three new task regressions initially failed against the uncorrected PR:
ordinary coordinate execution, concurrent replay, and padded-key reuse.
The focused engine/coordinate/HTTP suite subsequently passed 74/74.
The script tests use synthetic Git repositories and mocked GitHub/runtime
requests, not a live private engine. HTTP tests use disposable loopback
servers and synthetic credentials/state. Provider credentials, recovery
paths, and runtime activation variables were removed from test subprocesses;
scheduler, monitoring, and web access stayed disabled.

Local versions were Node 24.20.0, npm 11.19.0, and .NET SDK 8.0.425.
Missing `express` first prevented engine/proxy execution; only then were
locked dependencies restored with `npm ci --ignore-scripts --no-audit --no-fund`.
The initial .NET `--no-restore` attempt lacked assets (`NETSDK1004`);
the normal test command restored the declared packages. No dependency
manifest or lockfile was upgraded. Two test-harness mistakes were corrected:
Git for Windows could not use Node's null-device path as a config file, and
a scheduler assertion initially targeted the wrong status endpoint.
Existing Markdown hard-break whitespace imported from the actual base was
left unchanged rather than editing unrelated founder records.

Docker was absent from PATH, not absent from the machine. After the
coordinator supplied the installed executable location, a read-only probe
confirmed the local `desktop-linux` named-pipe context and client/server
29.7.2. No local image build or container startup was performed; existing
containers were not adopted or changed.
This entry records local implementation evidence; final-head Ubuntu/Node
20/container checks and remote mergeability must be reported separately
after publication. The six required checks at
the initial head passed; optional continuity jobs were skipped. Historical
`action_required` runs with no jobs were authorization gates, not current
test failures. No inline review threads existed, and the owner's existing
approval applied only to the original head.

## Resource and authority limits

The pre-implementation estimate was 60-90 minutes plus hosted CI. Local
verification reached this checkpoint roughly twenty minutes after the
02:34 Pacific relay; this is agent-session elapsed time, not founder labor.
No purchase or new service was authorized or made. Actual subscription/CI
charges, founder active time, and founder satisfaction are unknown.
Provisional self-rating: 8/10 for the bounded, regression-backed repair,
with hosted final-head and production evidence explicitly separate.

Other worktrees, the existing protected Command Center, private runtime
state, and account/deployment configuration were not accessed or changed.
No new agent, session, permanent server, recurring workflow, factory,
credential store, origin contract, or human confirmation was created.
