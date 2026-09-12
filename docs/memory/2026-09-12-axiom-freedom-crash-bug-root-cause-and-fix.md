# 2026-09-12 axiom-freedom crash-bug root cause found and fixed

**Status:** Fixed and tested in this repository; supersedes the earlier
OpenAI-hypothesis framing of the same chat outage; live confirmation after
merge/redeploy is still an authorized Railway operator's step

## What was reported

The founder pasted a Railway deploy-log screenshot for `axiom-freedom`
(`lucid-flow`), deployment `631f76cd`, marked **Crashed**, showing a
repeating crash loop:

```
Error [ERR_HTTP_HEADERS_SENT]: Cannot write headers after they are sent to the client
    at server.js:829:27
    at server.js:841:27
```

preceded by `AXIOM gravity center request failed: AXIOM engine returned HTTP
404`, `AXIOM automation readiness request failed: AXIOM engine returned HTTP
404`, `AXIOM bead passport request failed: AXIOM engine returned HTTP 404`,
and one `engine-non-success-response message must be a non-empty string`.

## Root cause (confirmed by source inspection)

`apps/axiom-freedom/server.js` had a systemic bug across **20 route
handlers**: each called

```js
res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify(await invokeEngine(...)));
```

`res.writeHead(200, ...)` sends headers **before** the `await
invokeEngine(...)` expression (nested inside the `JSON.stringify()`
argument) has resolved. When `invokeEngine()` rejects — here, because the
currently-deployed `axiom-engine` returned HTTP 404 for routes its older
deployment does not yet have (`/system/gravity-center`,
`/automation/readiness`, `/system/bead-passports`) — the `catch` block ran
its own `res.writeHead(error.statusCode || 502, ...)`, which itself threw
`Error [ERR_HTTP_HEADERS_SENT]` because headers were already sent.

That second throw happened inside an `async (req, res) => {...}` callback
passed directly to `http.createServer(...)`. Node's `http` module does not
await or catch a rejected promise returned by this callback, so the
rejection became an **unhandled promise rejection** — which, under Node
20's default `--unhandled-rejections=throw` behavior (confirmed via the
crash log's `Node.js v20.20.2` line), is thrown as an uncaught exception and
**terminates the whole process**. This explains the crash-and-restart loop.

## Why this explains every recent symptom, not just gravity-center

- The persistent chat 502 (`/api/axiom`): same process, so a crash
  triggered by any other route (e.g. an automation-console poll hitting
  gravity-center) took chat down with it.
- The raw, non-JSON "Request failed (502)" errors reported from the
  automation console (`automation.html`): a mid-request crash drops the
  TCP connection before any response body is sent, which is exactly what
  produces an unparseable/raw client-side error instead of a clean JSON
  502.
- The prior working theory — an OpenAI-side cause (invalid key, no
  billing/quota, wrong model) — was a **reasonable but never actually
  confirmed** guess. The client-visible message is identical
  (`AXIOM chat is temporarily unavailable`, 502) whether the engine is
  unreachable, returns a non-2xx response, or (as now understood) the
  server crashes mid-request. This fix does not rule out an OpenAI-side
  issue ever having existed, but it removes a fully concrete, code-level,
  100%-reproducible-from-evidence cause that fits every observed symptom
  without needing to assume anything about the OpenAI account.

## The fix

All 20 call sites were restructured to the pattern already used correctly
elsewhere in the same file (for example `/api/automation/readiness` was
already correct):

```js
const result = await invokeEngine(...);
res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify(result));
```

`writeHead(200)` now only runs after the awaited call has already
succeeded, so a rejected `invokeEngine()` call reaches the `catch` block
with no headers sent yet, and its own `writeHead(errorCode, ...)` succeeds
normally instead of throwing a second time.

Fixed routes: `/api/automation/monitoring/status`,
`/api/automation/monitoring/history`, `/api/automation/continuity-record`,
`/api/automation/continuity-record/events`, `/api/automation/source-catalog`,
`/api/automation/source-catalog/entries`, `/api/automation/business-metrics`,
`/api/automation/business-metrics/entries`,
`/api/automation/business-metrics/summary`, `/api/automation/service-registry`,
`/api/automation/service-registry/entries`,
`/api/automation/service-registry/projection`, `/api/automation/profiles`
(GET), `/api/automation/storage`, `/api/automation/profiles/preview` (POST),
`/api/automation/profiles/history`, `/api/automation/profiles/health`,
`/api/automation/gravity-center`, `/api/automation/bead-passports` (GET),
and `/api/support/status`.

## Regression coverage added

`apps/axiom-freedom/test/axiom-proxy.test.js` gained a new test, `survives
engine failures on every automation status route without crashing the
process`, which points `axiom-freedom` at a mock upstream that always
returns HTTP 404 (matching the real crash log) and then calls all 19
affected GET/POST routes plus the `profiles/preview` POST body variant,
asserting each responds with its correct status/JSON body instead of
hanging or dropping the connection, and that `/health` still returns 200
afterward. Because this test runs the server in-process (`require("../server")`,
not a subprocess), an unfixed regression here would crash the entire test
run, not just fail one assertion — a strong tripwire against reintroducing
this bug.

All suites pass: AXIOM portal (`apps/axiom-freedom`) 6/6, AXIOM engine
(`apps/axiom-engine`) 77/77 (untouched, unaffected), AXI.Core (`dotnet test
AXIOM.sln`) 5/5 (untouched, unaffected).

## Live verification (post-merge)

PR #13 merged as `f6e492d` into `axaxiaxes-axiom-monorepo` and redeployed
automatically. Post-deploy live checks against `xiiom.com`:

- `GET /health` → `200 {"status":"ok","service":"AXIOM","version":"2.0.0"}`,
  consistently.
- `POST /api/axiom` (`action: "chat"`) → a clean, stable `502
  {"error":"AXIOM chat is temporarily unavailable"}` across 5 consecutive
  attempts, 2 seconds apart, with no crash, no dropped connection, and no
  raw/garbled response.

This confirms the crash-loop itself is resolved: the process now handles a
repeated engine failure gracefully instead of terminating. Chat is **still
not functionally working**, but this is no longer a process-stability
question — it is now cleanly isolated to `axiom-engine` itself (its own
active-deployment/source-connection status and/or an OpenAI-side cause),
which requires Railway dashboard access this session does not have. Updated
`docs/AXES_TIER_1_DECISION_REGISTER.md`'s P0 chat row accordingly.

## Founder reported 21 Railway crash emails; extended stress test run

The founder separately reported having already received 21 crash-notification
emails from Railway, without a clear sense of whether they predate this fix
or are still arriving. Since a crashed Node process is exactly what generates
one such email per restart, and this bug could be triggered by any of 20
different routes, 21 accumulated crash-restart cycles over the hours before
the fix is entirely consistent with — and further corroborates — the root
cause found above. It is not, by itself, evidence of a still-open problem.

To get fresh, direct evidence rather than relying on inference alone, ran two
additional live checks against `xiiom.com` after the fix was live:

- 40 `GET /health` checks, 3 seconds apart (~2 minutes): **0 failures**, all
  `200`. A crash-restart cycle typically causes several seconds of downtime
  during container restart, which polling this closely would very likely
  have caught had one occurred during the window.
- 8 rapid `POST /api/axiom` (`action: "chat"`) requests, 2 seconds apart —
  specifically targeting the route most associated with the original crash
  — followed immediately by a `GET /health` check: all 8 chat requests
  returned a clean `502` (no crash), and the immediate follow-up health
  check returned `200`.

This is direct, fresh evidence that the process does not crash under repeated
failure on the previously-affected route, right now, post-fix. It cannot
prove a negative for all time, but it materially strengthens confidence that
the 21 emails are historical rather than ongoing. The one fully conclusive
check remains outside this session: compare the timestamp of the most recent
Railway crash email against this fix's live deploy time, and confirm no
further crash email arrives afterward.

## What this session still cannot do

This session cannot access Railway to confirm live redeploy or that
`axiom-engine`'s own active-deployment/source-connection is current — the
apparent *trigger* (a stale engine returning 404s for newer routes) is a
separate, founder-controlled Railway concern from this fix (which addresses
why that trigger was catastrophic rather than gracefully handled). An
authorized Railway operator should confirm the redeploy took effect, retest
chat, and separately verify `axiom-engine`'s Settings → Source and
Deployments tabs.

## Related records

- `docs/AXES_TIER_1_DECISION_REGISTER.md` (P0 chat row, updated)
- `docs/memory/2026-09-12-axiom-chat-backend-failure-diagnosis.md`
- `apps/axiom-freedom/server.js`
- `apps/axiom-freedom/test/axiom-proxy.test.js`
