# CI continuity runbook (Copilot branches)

Use this runbook to keep Copilot branch delivery fluent when GitHub Actions may request manual approval.

## What is automated in-repository

- `AXI continuity validation` runs on push to:
  - `axaxiaxes-axes-directory-data-model`
  - `axaxiaxes-axiom-monorepo`
  - `copilot/*` (single-segment branch names)
  - `copilot/**` (nested Copilot branch names)
- `AXI continuity validation` runs on pull requests targeting `axaxiaxes-axiom-monorepo`.
- `AXI continuity validation` also receives a safe `workflow_run` continuity signal after `Running Copilot cloud agent` completes successfully on same-repository `copilot/` branches.
- Validation jobs are skipped for `workflow_run` events. Push/PR validation
  never receives continuity credentials or calls a private runtime.
- Continuity recording is **off by default**. Only after an authorized owner
  configures the opt-in below can a successful same-repository `copilot/` run
  supply an explicit contract at `.github/axi/origin-coordinate.json` (or a
  manually supplied alternate path).
- The recording job executes the implementation pinned to
  `github.workflow_sha` from the canonical branch, in `continuity-runner`.
  The upstream SHA is checked out separately in `continuity-source` and used
  only for raw Git blob reads. No upstream script, package, action, hook, or
  checkout filter supplies executable code to the credential-bearing step.
- Both event delivery and manual replay verify the actual GitHub run/attempt,
  repository, workflow name, `copilot/` branch, SHA, completed status, and
  successful conclusion before the authenticated recording request.

Source: `.github/workflows/axi-continuity-validation.yml`.

## Owner one-time setup (external)

This is a separate human-controlled activation decision, not an instruction to
activate recording during a code repair or validation run.

1. Review the canonical workflow/script, proposed contract, protected role
   reports, private readiness, and recovery procedure. Repository code or a
   successful CI run is not that approval.
2. Set `AXIOM_WORKFLOW_RUN_CONTINUITY_REPOSITORY` on the private engine to
   exactly the approved `owner/repo`. Unset/blank disables this endpoint; a
   different repository is rejected. Compose forwards this setting from its
   `.env`, without a nonempty default.
3. Add these repository secrets for the continuity automation call path:
   - `AXI_CONTINUITY_PROXY_URL` — the public/admin-gated AXIOM web base URL that can reach the private engine, for example `https://xiiom.com`
   - `AXI_CONTINUITY_ADMIN_PASSWORD` — the same secret value configured as `ADMIN_PASSWORD` on `axiom-web`
4. Only after accepting that bounded recording path, set the repository
   variable `AXI_CONTINUITY_ENABLED` to the literal string `true`. Neither a
   contract nor existing admin credentials alone enable the job.
5. Keep repository/organization approval policies and required checks intact.
   An `action_required` run is an authorization gate for the responsible
   human, not a code failure or permission for an agent to bypass protection.

The URL must be an HTTPS origin without embedded credentials, path, query, or
fragment; redirects are rejected. The workflow does **not** require a GitHub
PAT and does **not** need direct
network reachability to the private `axiom-engine` service. The public
`axiom-web` route remains admin-gated and forwards to the private engine using
its already-configured `AXIOM_ENGINE_ADMIN_PASSWORD`.
The recording job alone also receives `actions: read` for its ephemeral
`GITHUB_TOKEN` to verify run metadata. It has no GitHub write permission.
Its POST requires JSON and `X-AXIOM-Workflow-Continuity: record`; the portal
rejects cross-origin preflight and non-same-origin browser Fetch Metadata.
This does not enable the scheduler or authorize any broader AXI action.

## Explicit continuity contract

The workflow never infers coordinates from commit messages, PR prose, or chat
text. It reads only a bounded JSON contract checked into the same repository
commit that the upstream workflow completed on:

```json
{
  "schemaVersion": 1,
  "label": "Record workflow-run origin continuity",
  "sourceRecord": "KEYSTONE-ORIGIN-000001",
  "originCheckpoint": "axi-coordinate-foundation",
  "sourceReference": "docs/AXI_ORIGIN_COORDINATE_SYSTEM.md"
}
```

Rules:

- The file path must be repository-relative (default:
  `.github/axi/origin-coordinate.json`).
- `sourceReference` must also be repository-relative and identify a regular
  tracked file in the upstream commit. The script reads its committed blob,
  not a mutable working-tree file. Symlinks, directories, untracked files,
  `.git` metadata, traversal, drive paths, and control characters are refused.
- Contract JSON is capped at 16 KiB; the source blob is capped at 5 MiB.
- If the contract is missing on a `workflow_run`, the job exits with a clear
  "skipped-no-contract" status and records nothing.
- If the contract is present but actual run verification, credentials,
  repository configuration, or runtime readiness is missing, the job fails
  explicitly. A pending/failed runtime task cannot be reported as recorded.
- Re-running the same upstream workflow run with the same contract is
  idempotent, including concurrent delivery. Different attempts of the same
  run and SHA reuse the first retained task/run/coordinate; a different SHA
  has a different key. Existing terminal failures/readiness holds still
  require operator review rather than bypassing governance to retry.

The engine trusts the authenticated, explicitly configured recording caller
for GitHub metadata; it does not independently contact GitHub. The trusted
workflow verifies that metadata. Recorded success is a workflow/coordinate
fact, never a manufactured founder confirmation, deployment result, or
accountability-ledger `verified_success`.

## Manual replay path

If the upstream `workflow_run` payload cannot be used directly, run
`AXI continuity validation` manually with `workflow_dispatch` **from
`axaxiaxes-axiom-monorepo` only**, after the same opt-in, and provide:

- `upstream_run_id`
- `upstream_head_branch`
- `upstream_head_sha`
- optional `upstream_run_attempt` (verifies that exact attempt; omission
  resolves and verifies GitHub's latest attempt)
- optional `continuity_contract_path` (defaults to
  `.github/axi/origin-coordinate.json`)

The optional `upstream_workflow_name` remains restricted to
`Running Copilot cloud agent`. The supplied branch/SHA/run/attempt must match
the GitHub response. The manual path reads the same contract from the
upstream commit but executes only the trusted workflow implementation. It
cannot turn a failed, pending, foreign, or gated attempt into success.
The retained coordinate uses the actual upstream SHA, not the trusted
implementation SHA. Workflow-run concurrency is isolated from push/PR
validation and does not cancel an in-flight recording operation.

## Per-PR monitored operating loop

1. Open **Actions** tab for the repository.
2. Monitor:
   - `Running Copilot cloud agent`
   - `AXI continuity validation`
3. Target state per commit:
   - Copilot workflow: `success`
   - Validation workflow: `success`
4. If `AXI continuity validation` shows `action_required`:
   - open the run;
   - approve and re-run from the GitHub UI;
   - confirm the new attempt is `success`.

## Checkpoint timing and efficiency targets

Use these checkpoints to keep operations measurable and predictable.
These times are initial operating targets (planning estimates), not strict SLA penalties.
Source basis: latest observed repository run behavior plus conservative operator planning assumptions, to be refined by weekly measurements.

| Checkpoint | Target time | Success gate |
| --- | --- | --- |
| Baseline validation | 15-20 min | Latest attempts for both workflows are `success` |
| Policy confirmation (one-time) | 10-15 min | No repeated approval prompts for trusted internal Copilot runs |
| Three-run fluency check | 30-90 min total | Three consecutive Copilot updates pass both workflows |
| Exception handling (per incident) | 3-8 min | `action_required` resolved to `success` in one retry cycle |
| Weekly efficiency review | 10 min/week | Persistent `action_required` near 0; low intervention time |
| Escalation package prep | 10-20 min | Complete evidence package ready for admin/support |

Measurement definitions:

- Baseline validation: start when you open the Actions list for the branch; end when you confirm the latest attempts for both workflows.
- Policy confirmation: start when you open Actions settings; end when repository (and, if needed, organization) policy review is complete.
- Three-run fluency check: start at first Copilot branch update timestamp; end when the third consecutive update reaches success on both workflows.
- Exception handling: start when a run first shows `action_required`; end when the rerun reaches `success`.
- Weekly efficiency review: start at review open time; end when metrics for the prior 7 days are logged.
- Escalation package prep: start when repeat failure threshold is confirmed; end when run URL/ID/time/branch/rerun-result bundle is ready.
- Source of truth for all timestamps/status values: GitHub Actions run pages for `Running Copilot cloud agent` and `AXI continuity validation`.
- Recording location: fill one row per week in the "Monitoring log template" table in this runbook.

## Weekly efficiency review method

Review the last 7 days and record:

1. Count of `action_required` runs.
2. Count of reruns required to reach green.
3. Average time from first blocked run to successful run.
4. Total manual operator time spent on approvals/reruns.

Target trend:

- persistent `action_required` events near zero,
- rerun-to-green within one retry,
- operator time under 10 minutes per week.

## Monitoring log template

Use this table each week:

| Week (UTC) | Copilot updates observed | `action_required` count | Avg blocked-to-success time | Manual minutes | Escalated? |
| --- | ---: | ---: | --- | ---: | --- |
| YYYY-MM-DD | 0 | 0 | 0m | 0 | No |

## Fluent-state acceptance check

Treat the workflow as fluent when all three conditions hold:

1. Three consecutive Copilot branch updates complete without persistent `action_required`.
2. Each update has a successful `AXI continuity validation` result.
3. Each update has a successful `Running Copilot cloud agent` result.

## Escalation threshold

Escalate to repository/organization admin policy owner (or GitHub Support) when:

- `action_required` repeats after policy confirmation and manual re-run, or
- runs show `action_required` with no jobs started.

Capture and provide:

- workflow run URL,
- run ID,
- timestamp,
- branch name,
- whether a re-run succeeded.
