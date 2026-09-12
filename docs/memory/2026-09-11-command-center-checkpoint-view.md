# Command Center checkpoint view

**Recorded:** 2026-09-11
**Status:** Implemented and validated in the current branch; not yet promoted to the documented live source branch.

## Implementation

The protected AXES Command Center now provides:

- a browser-local clock that updates once per second;
- the current phase and checkpoint list parsed from the versioned
  `PROJECT_TIMELINE.md` record;
- the existing governance, agent, task, and run continuity tree; and
- the existing browser-side public endpoint observation table.

`GET /api/command-center/checkpoints` requires the same HTTP Basic
authentication as the Command Center page and returns only the current phase,
checkpoint title, completion state, and response timestamp. It does not expose
private engine state, modify the timeline, create work, or control a service.

The portal Dockerfile now includes `command-center.html` and
`PROJECT_TIMELINE.md`. This corrects the production-image omission that would
otherwise make the Command Center route unavailable after source promotion.

## Validation and current live boundary

- The portal integration suite passed locally, including unauthorized and
  authorized checks for the Command Center page and checkpoint endpoint.
- Docker is unavailable in the current local environment. The read-only
  `portal-image` GitHub Actions job now builds the exact production Dockerfile
  on relevant branch pushes and pull requests.
- A fresh public check returned `404` for
  `https://xiiom.com/command-center`. The documented deployment branch does
  not contain the Command Center source or continuous-memory service.

The current feature branch includes the implementation, but it is not evidence
that Railway has deployed it. Publishing the view to XIIOM requires an
authorized, reviewed promotion to the configured production-source branch and
subsequent production verification.

## Boundaries

The clock is not server uptime, a production-deployment assertion, or proof of
external service health. The page remains a protected, read-only
build-management view. It cannot edit arbitrary repository content, enable
automation, deploy, alter Railway/DNS/TLS, access accounts, send messages,
publish, process payments, collect personal data, or make consequential
decisions.
