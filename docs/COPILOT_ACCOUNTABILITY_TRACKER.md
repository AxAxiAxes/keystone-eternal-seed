# Copilot accountability tracker

This repository now includes a private **directive-versus-delivery
accountability ledger** for founder-directed Copilot work.

## What it records

- The founder's **exact original directive verbatim**
- Project, repository, branch, session/task identifier, requested deliverable,
  constraints, deadline, dependencies, budget/time cap, and definition of done
- Detailed subrequirements
- Amendments and superseded instructions
- Agent interpretation
- Delivery claims, separated into repository artifacts vs. working outcomes
- Evidence items with type, locator, verification state, verifier, and timestamp
- Requirement-by-requirement comparison states
- Deviations
- Outcome state
- Founder ratings and assistant self-assessment
- Loss/resource entries that keep founder-confirmed hours separate from
  assistant/session elapsed time
- Append-only event history
- Markdown/JSON report exports
- Missing-direction / missing-evidence reporting

## What it can prove

- What was recorded in the append-only local ledger
- Whether a recorded `verified_success` has explicit human confirmation and
  its referenced evidence is still marked verified in the ledger
- Whether a directive currently has missing evidence or missing exact direction
- Proven totals from **confirmed inputs only**
- Estimated exposure ranges when estimates are entered explicitly

## What it cannot prove

- External invoices, billing dashboards, registrar/domain charges, cloud bills,
  or bank/account totals that are not separately supplied by a human
- That a repository artifact alone equals a successful founder outcome
- That all historical founder directions have been captured
- Exact founder labor time when only assistant/session elapsed time is known
- Production deployment state, external account state, or third-party actions
  outside the evidence actually attached to the record
- Complete historical Copilot session access when those sessions are not present
  in repository-controlled records

## Local UI and API

Private web UI:

- `/accountability`

Private web proxy endpoints:

- `GET /api/accountability`
- `GET /api/accountability/events`
- `GET /api/accountability/directives`
- `GET /api/accountability/summary`
- `GET /api/accountability/missing`
- `GET /api/accountability/directives/:directiveId`
- `GET /api/accountability/directives/:directiveId/report?format=json|markdown`
- `POST /api/accountability/events`

Private engine endpoints:

- `GET /system/accountability`
- `GET /system/accountability/events`
- `GET /system/accountability/directives`
- `GET /system/accountability/summary`
- `GET /system/accountability/missing`
- `GET /system/accountability/directives/:directiveId`
- `GET /system/accountability/directives/:directiveId/report?format=json|markdown`
- `POST /system/accountability/events`

The directive, summary, and missing-report queries accept `ratingMin` as a
decimal integer from `-10` through `10`, including URL query strings. Unrated
directives do not match a minimum-rating filter; invalid values are rejected.

### Protected write requests

`POST /api/accountability/events` requires the existing administrator Basic
authentication, `Content-Type: application/json` (including normal charset
parameters), and the explicit `X-AXIOM-Accountability: write` header. The UI
sends that header automatically. Simple form content types, missing or invalid
write headers, and any supplied `Sec-Fetch-Site` value other than `same-origin`
are rejected before calling the engine. The POST and its preflight do not
inherit the portal's wildcard CORS headers; preflight receives 403 with no
CORS allow headers. Other endpoints' CORS behavior is unchanged.

Authenticated nonbrowser clients must also send the write header; they need
not synthesize browser Fetch Metadata. For example, with a reviewed synthetic
event in a local `event.json` file, curl prompts for the administrator password:

```powershell
curl.exe --user admin --header "Content-Type: application/json" --header "X-AXIOM-Accountability: write" --data-binary "@event.json" "http://127.0.0.1:8080/api/accountability/events"
```

Use the approved HTTPS portal address outside local development. This
non-secret request marker is a browser-CSRF defense, not authentication,
human confirmation, or evidence of approval. Its protection depends on
rejecting cross-origin preflight on this route. No `Forwarded` or
`X-Forwarded-*` header is trusted to establish an origin, so TLS termination
does not require a new origin configuration. The private engine API retains
its existing authentication contract.

### Recorded outcomes versus current verification

When supplied, `outcome.recorded.payload.humanConfirmed` must be an actual JSON
boolean. Strings (including `"false"`), numbers, null, arrays, and objects are
errors, not confirmation. Omission retains the existing non-success default
of false; `verified_success` still requires true, `confirmedBy`, and explicit
qualifying evidence IDs.

`currentOutcome`, `outcomes`, list/report `outcomeState`, and the `outcome`
filter describe recorded outcomes. They are not rewritten when evidence is
disputed, unverified, or marked not applicable. UI and Markdown labels identify
these as recorded facts. `currentStatus`, `evidenceBackedCompletion`, success
counts, completion rates, and the `status` filter describe current eligibility.
They reuse the write gate's evidence check: every referenced item must exist
and currently be marked verified. A recorded success that loses that support
projects as `blocked`, stops counting as a current success, appears in the
missing-evidence report, and has no current time-to-verifiable-outcome value.
Later explicit evidence re-verification can restore eligibility for the same
recorded outcome; it does not append or manufacture a new human confirmation.
Unrelated evidence does not revoke an otherwise supported outcome.

These checks do not independently verify an external artifact or prove who
supplied a past confirmation. Older events already normalized to boolean true
do not retain their original input type and cannot be retroactively corrected
by guessing. The service neither migrates nor rewrites those records.

## Durability and readiness

The private `accountability-ledger.jsonl` file is included in continuity
checkpoint checksums and runtime recovery bundles. Restore remains limited
to the separately configured, isolated recovery directory; a local bundle
does not prove independent storage durability or authorize a live restore.

An invalid retained ledger blocks automation processing and produces
`accountability-ledger-unavailable` in private monitoring attention. Monitoring
reports the condition without rewriting ledger history or enabling the scheduler.

## Manual reconstructed sample

`docs/COPILOT_ACCOUNTABILITY_RECONSTRUCTED_SAMPLE.json` contains a manually
reconstructed example bundle based on current repository records. It is
explicitly labeled reconstructed/incomplete and is **not** an audited financial
claim. Import each event manually through `POST /api/accountability/events` or
`POST /system/accountability/events`.

`docs/COPILOT_ACCOUNTABILITY_RECONSTRUCTED_SAMPLE.md` shows the same example as
a human-readable reconciliation report.
