# AXI Workspace Library page and public-chat minimize toggle

**Date:** 2026-09-16
**Repository state reviewed:** `README.md`, `PROJECT_TIMELINE.md`,
`docs/AXI_PROJECT_CONTEXT_CHECKPOINT.md`, `docs/memory/README.md`, and
`docs/memory/2026-09-15-public-chat-timeline-and-uploads.md` (the immediately
preceding PR, #83). Branch: `axaxiaxes-axiom-monorepo` (this session's base).

## Founder request

"I do not have access to your computer, web browsing, or GitHub accounts...
please minimize the window with a scroll option or open a new window with
indexed history and a library where we can file apps, docs, automations.
please check link https://xiiom.com/automation"

The founder was unavailable for scope clarification, so both parts of the
request were implemented (the recommended, most complete option), scoped to
what the repository already exposes.

## xiiom.com live-status check

- `https://xiiom.com` — **live**. Root page renders the AXIOM chat link,
  KEYSTONE library, patent records, and AXES Contracting links correctly.
- `https://xiiom.com/automation` — returns **401 Unauthorized**. This is the
  *correct, designed* behavior: `automation.html` is admin-gated by
  `requireAdmin()` in `apps/axiom-freedom/server.js`, matching the same
  gating already used for `/command-center` and `/support`. Nothing is
  broken; the 401 confirms deployment matches the repository's access-control
  design.

## What shipped

1. **Chat minimize/collapse toggle** (`apps/axiom-freedom/axiom_web_interface.html`)
   - Added a `–`/`+` toggle button in the chat header (`#minimizeButton`).
   - Collapsing hides the message history and input area, leaving only the
     header visible — a simple "shrink the window" affordance for visitors
     without any server-side change.
   - The collapsed/expanded state persists across reloads via
     `localStorage.axiomChatMinimized`, so a visitor's preference sticks.
   - No changes to the existing history-load, day-timeline, or upload logic
     from PR #83; verified by reading the parsed script and rerunning the
     full `axiom-freedom` test suite (unchanged pass count, see below).

2. **New admin-gated "AXI Workspace Library" page** (`apps/axiom-freedom/workspace.html`,
   new route `GET /workspace` in `server.js`, gated by the same
   `requireAdmin()` used for `/command-center`/`/automation`/`/support`)
   - Four tabs, each with a live search/filter box:
     - **Apps & services** — from the existing admin route
       `GET /api/automation/service-registry/projection` (`{ services: { [serviceId]: {...} } }`,
       confirmed against `service-registry-service.js`'s `projection()`
       method — the object-keyed shape, not an array).
     - **Documents** — from `GET /api/automation/source-catalog/entries`
       (a plain array; confirmed against `source-catalog-service.js`'s
       `list()` method).
     - **Automations** — from `GET /api/automation/profiles`
       (`{ profiles: [...] }`, confirmed against
       `automation-profile-service.js`'s `list()` method — an array under a
       `profiles` key, not a keyed object; the first draft of this page had
       this wrong and was corrected before shipping).
     - **Chat history** — from the already-public
       `GET /api/axiom/history` (PR #83), grouped by day using the same
       ascending-sort/day-grouping logic as the public chat page.
   - **No new backend endpoints were added.** Every data source the page
     reads already existed and was already admin-gated (except the
     intentionally public chat-history feed). This page is a read-only index
     over existing, already-reviewed data — it does not file, create, or
     modify anything.
   - Added a discovery link to it from `command-center.html` so operators can
     find it without memorizing the URL.
   - `apps/axiom-freedom/Dockerfile` updated to `COPY` the new
     `workspace.html` (each static page is explicitly listed there; a missed
     `COPY` line was the root cause of a prior deployment gap in PR #82's
     history and is the reason this was checked directly this time).

## Verification performed

- `node -c server.js` — syntax OK after adding the `/workspace` route.
- Parsed the inline `<script>` blocks of both `workspace.html` and
  `axiom_web_interface.html` with `new Function(...)` — both parse cleanly.
- Added a new test to `apps/axiom-freedom/test/axiom-proxy.test.js`:
  `GET /workspace requires admin credentials and serves the workspace
  library page once authenticated` (401 unauthenticated, 200 with admin
  Basic auth, 200 for the trailing-slash variant, body contains the page
  title).
- Also hardened a pre-existing Windows-only flaky `ENOTEMPTY` rmdir race in
  three other tests' cleanup (`maxRetries`/`retryDelay` added to
  `fs.rm(..., { recursive: true })` calls) — this was intermittently failing
  before and after this change and is unrelated to the new feature, but was
  fixed while touching the same file to keep the suite green.
- `apps/axiom-freedom`: **14/14 tests pass** (13 pre-existing + 1 new).
- `apps/axiom-engine`: **103/103 tests pass** (no regressions).

## Scope boundaries respected

- `/library` (the small, deliberately minimal, public KEYSTONE docs index)
  was **not** touched or repurposed — it explicitly excludes internal
  operational documents by design, and the new Workspace Library is a
  separate, admin-gated route (`/workspace`) for exactly that internal,
  broader material.
- No deployment, DNS, Railway, or account action was taken or implied by the
  xiiom.com check — it was a read-only `web_fetch` verification only.
