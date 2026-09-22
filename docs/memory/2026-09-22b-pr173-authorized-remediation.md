# 2026-09-22: Authorized PR #173 security and integrity remediation

## Authority and reviewed basis

This follows the [local preparation and approval hold](2026-09-22-pr173-review-preparation.md).
The coordinator relayed authorization for both reviewed security repairs,
the two reproduced evidence-integrity repairs, and a verified normal push
to the existing [Draft PR #173](https://github.com/AxAxiAxes/keystone-eternal-seed/pull/173).
Leaving Draft, merging, auto-merge, Actions approval, deployment, account
changes, and production-state changes remain outside this task.

Resumed review included `AGENTS.md`, `README.md`, `PROJECT_TIMELINE.md`
lines 1-39 and 244-401, the Genesis ownership, agent origin, and project-context
checkpoints, `docs/memory/README.md`, the preceding PR handoff, and
`AXES_BUILD_PROGRAM.md`, `AXES_PLATFORM_PLAN.md`, `AXI_AUTOMATION_SERVICE.md`,
`ENGINE_INTEGRATION.md`, `RAILWAY_DEPLOYMENT.md`,
`keystone/AGENT_SERVICE_DELIVERY_PROTOCOL.md`, and
`COPILOT_ACCOUNTABILITY_TRACKER.md` under `docs/`. The ledger service, portal
request handling/rendering, their tests, manifests, and continuity-validation
workflow were traced for these four repairs, not a new full security audit.

The resumed checkout was clean at
`e2471398d0592bb32e1724f2f09b2eab17a2cd9a`, preserving normal merge
`db8f449474040e5f3b63894f32b68b4f71946653`. Live PR head was still
`209cd40e67873e4a5428dbb5e3b63ad329eca7ee`; actual base-branch tip was
`4ba5c0ac4ce754cb5ef48cd7d85793600910ec4f`, distinct from the PR API's
recorded base `814638b946d531a4878619e846badc5f4c7e4705`.

## Repairs and supporting evidence

- `apps/axiom-freedom/accountability.html` now escapes stored rating notes
  with its existing `escapeHtml` helper. The UI test executes the page script
  with a controlled DOM substitute and checks the actual detail markup for
  both rating kinds. Hostile markup becomes escaped text; multiline plain
  notes remain readable. This is not a real-browser exploit exercise.
- `apps/axiom-freedom/server.js` requires JSON plus
  `X-AXIOM-Accountability: write` on the protected ledger POST, retains Basic
  authentication, and rejects supplied non-same-origin Fetch Metadata.
  The UI and authenticated CLI contract both include the exact header.
  Charset parameters remain accepted.
- The initial design premise that CORS was disabled was corrected during
  source tracing: the portal actually applied wildcard CORS globally.
  Only the ledger POST/preflight is now excluded. Its preflight returns 403
  with no CORS allow headers and without an engine call. Tests assert those
  properties for rejected writes/preflights, query/normalized-path forms,
  cross-site and same-site contexts, and forged forwarded headers. Unrelated
  preflight behavior retains its baseline. Synthetic TLS-termination and
  nonbrowser request shapes are accepted without trusting forwarded headers.
- `apps/axiom-engine/accountability-ledger-service.js` rejects non-boolean
  `humanConfirmed` values with an explicit TypeError/HTTP 400. Omission
  remains false for non-success outcomes; verified success still requires
  actual true, a confirmer, and verified evidence.
- The same service now shares one evidence-qualification check between the
  outcome write gate and current projections. Disputed, unverified, or
  not-applicable supporting evidence removes current success/completion
  eligibility and projects `blocked`; later explicit re-verification can
  restore eligibility. All required evidence must qualify, while unrelated
  evidence does not revoke success. Recorded outcomes, event hashes, and
  original file bytes remain intact. UI/Markdown labels distinguish recorded
  outcomes from current status, and Markdown retains recorded outcome history.

The reference checked on 2026-09-22 was OWASP's
[CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html),
specifically custom request headers, disallowing simple content types, and
Fetch Metadata. It supports a route-specific header/preflight defense without
new token storage or proxy-origin configuration. No repository/private content
was sent to the reference site.

## Validation and limitations

The pre-fix regression runs reproduced the defects:

| Working directory and command | Before | After |
| --- | --- | --- |
| `apps/axiom-engine`: `node --test --test-reporter=tap test\accountability-ledger-service.test.js test\engine.test.js` | 28 passed, 8 failed, 36 total | 36 passed, 0 failed |
| `apps/axiom-freedom`: `node --test --test-reporter=tap test\accountability-ui.test.js test\axiom-proxy.test.js` | 15 passed, 20 failed, 35 total | 35 passed, 0 failed |

Full engine validation subsequently passed 135/135, and full portal
validation passed 35/35, using `npm test -- --test-reporter=tap` in each
application. An added HTTP regression initially used an invalid empty
delivery-item fixture; the existing guard correctly rejected it. The fixture
was corrected rather than weakening that guard. HTTP coverage now exercises
both evidence loss and restoration with the same recorded outcome.

`dotnet test AXIOM.sln --configuration Release --no-restore --verbosity minimal`
passed 5/5 at repository root; `node --test --test-reporter=tap` in
`docs/fixtures/axes-directory` passed 10/10. `git diff --check` passed.
One bundled static Impeccable detector pass on `accountability.html` returned
no findings. No app build/lint/type-check script exists beyond the test
scripts. No dependency manifest, lockfile, workflow, or branch rule changed.

Local execution used Windows, Node 24.20.0, npm 11.19.0, and .NET SDK
8.0.425, with external-provider variables removed from the test subprocesses
and automation/monitoring/web-access activation disabled. Test state and
servers were disposable. Docker was unavailable locally; Ubuntu/Node 20 and
container evidence must come from the final published SHA's hosted checks.
Earlier green checks for `209cd40e...` are baseline only. The final handoff
must separately identify the committed/published SHA, its exact local results,
and its live hosted-check/mergeability snapshot.

Historical booleans already normalized by older code cannot reveal whether
their original input was a string. No retrospective confirmation is inferred,
and no retained ledger is rewritten. These repairs validate recorded input
and current recorded evidence state, not real-world identity, external
evidence, production success, invoices, satisfaction, or accounting.

## Resource accountability

The resumed-work estimate was 35-60 minutes, excluding indefinite hosted
approval or runner delays. Local repair/validation reached this checkpoint
about 14 minutes after authorization was relayed at 15:10 Pacific.
This is agent-session wall-clock span, not founder labor or a billing amount.
No external purchase was authorized or made; subscription/usage charges,
founder labor, and founder satisfaction are unknown. Provisional quality
self-rating: 8/10 for the bounded fixes and regression evidence, with hosted
final-head and real-browser/production evidence still separate.
