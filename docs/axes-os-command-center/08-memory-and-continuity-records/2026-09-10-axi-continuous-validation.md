# 2026-09-10 AXI continuous validation

**Status:** Read-only repository automation added

## Implemented control

The repository now contains an automated GitHub Actions workflow that validates
the AXI engine, protected portal, and AXI.Core source on the current feature
branch, the documented production-source branch, and pull requests targeting
that production-source branch.

The workflow uses only repository read access. It runs tests and reports their
result; it cannot merge branches, deploy Railway services, access production
state, add credentials, enable the scheduler, create tasks, publish, message,
spend, or control a third-party account.

## Supporting records

- `.github/workflows/axi-continuity-validation.yml`
- `docs/AXI_CONTINUOUS_VALIDATION.md`
- `PROJECT_TIMELINE.md`

## Validation correction

The first workflow run, `34571811175`, found that the isolated portal job
imports the AXI engine but had not installed the engine's dependencies. The
workflow now installs `apps/axiom-engine` dependencies before running the
portal test.

The next run, `34572611157`, passed the AXI.Core and portal jobs but retained
an engine test process longer than expected on the Node 20 runner. Engine test
server teardown now stops the listener before closing idle and active
connections. The two test cases previously declared globally inside the
asynchronous health test are now awaited subtests, so Node 20 owns their
lifecycle and cleanup. Each workflow job has a five-minute maximum duration.
Local engine and portal tests pass after this correction. The subsequent
GitHub Actions run is the required confirmation of the Node 20 behavior.

## Verified GitHub Actions result

GitHub Actions run
`34573265573` completed successfully for commit
`6f217710ba93722b7b41156f7c027bf04bfb0cba`. The AXI.Core, AXI engine
Node 20, and AXI portal Node 20 jobs all passed.
