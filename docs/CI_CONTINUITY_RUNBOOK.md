# CI continuity runbook (Copilot branches)

Use this runbook to keep Copilot branch delivery fluent when GitHub Actions may request manual approval.

## What is automated in-repository

- `AXI continuity validation` runs on push to:
  - `axaxiaxes-axes-directory-data-model`
  - `axaxiaxes-axiom-monorepo`
  - `copilot/**`
- `AXI continuity validation` runs on pull requests targeting `axaxiaxes-axiom-monorepo`.
- `AXI continuity validation` also receives a safe `workflow_run` continuity signal after `Running Copilot cloud agent` completes successfully on same-repository `copilot/` branches.
- Code-executing jobs are skipped for `workflow_run` events by design (security boundary).

Source: `.github/workflows/axi-continuity-validation.yml`.

## Owner one-time setup (external)

1. Open **Repository Settings → Actions → General**.
2. Confirm trusted internal Copilot runs do not get repeatedly blocked by manual approval policy.
3. If organization policy overrides repository policy, repeat in **Organization Settings → Actions**.

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
