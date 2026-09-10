# AXI project memory — production automation and platform plan

**Recorded:** 2026-09-09  
**Scope:** Production operations, bounded automation, private archival, and AXES
product direction.

## Durable decisions

- The canonical repository remains `AxAxiAxes/keystone-eternal-seed`; all
  reviewed implementation and public-safe documentation belongs here.
- `xiiom.com` is the public entry point for the AXIOM portal. The
  `axiom-engine` service remains private on Railway's internal network and
  stores durable state in its mounted `/app/data` volume.
- The automation system is intentionally bounded. It supports only
  `memory.record` and `automation.noop`; arbitrary shell execution, account
  access, deployment, browser control, financial operations, and undeclared
  integrations are prohibited.
- AXES Contracting is the intended central hub for the future product
  constellation. XIIOM is its private automation and operations environment;
  AXEOUS, URNUR, AXOUX, AUXAOUS, and the School of Love & Ethics are staged
  product directions, not completed services or legal institutions.
- Raw founder-provided material and Copilot Library exports are private by
  default. They are retained only beneath Git-ignored `private-archive/` with
  SHA-256 manifests. Public documentation contains only reviewed,
  non-sensitive conclusions.

## Verified accomplishments

- Consolidated the four upstream repositories into the canonical monorepo
  while preserving upstream history and separating applications, packages, and
  reviewed documentation.
- Established .NET 8 AXI.Core command contracts and Node service test suites.
- Implemented the private AXIOM engine, public portal proxy, durable memory
  layers, OpenAI Responses API integration, private provider-usage records, and
  a chat-message size bound.
- Prepared and deployed the Railway topology: public `axiom-freedom`, private
  `axiom-engine`, private internal routing, health configuration, and a
  persistent engine volume.
- Verified a public-to-private `POST /api/axiom` request reached the engine
  and returned `processed`.
- Implemented durable automation state, task queueing, deterministic
  capability-based agent assignment, recurring schedules, execution audits,
  and scheduler polling with explicit configuration bounds.
- Added the password-protected Automation Console at `/automation`, with task
  controls, agent visibility, status, and review-only Agent Chat.
- Confirmed a production allowlisted `automation.noop` task completed with one
  recorded run.
- Added a review-only Agent Chat contract: agents may provide analysis and UI
  proposals but cannot claim or perform editing, deployment, account access,
  or arbitrary external actions.
- Reviewed a founder-provided AXES product briefing and translated it into
  `docs/AXES_PLATFORM_PLAN.md`, including governance, privacy, safeguarding,
  moderation, and non-financial recognition boundaries.
- Recorded the material's provenance as original founder-and-Copilot work and
  created `docs/AXES_BUILD_PROGRAM.md`, a dependency-ordered plan from reliable
  XIIOM operations through controlled product pilots.

## Current operational state

| Area | State |
| --- | --- |
| Canonical monorepo | Complete and active |
| Public portal and private engine routing | Deployed and previously verified |
| Durable memory and bounded automation | Implemented; a production no-op execution was confirmed |
| Automation Console | Deployed and protected by a portal-only secret |
| Private engine source deployment | Not yet connected to the GitHub monorepo; updates require a manual upload deployment until configured |
| OpenAI production chat | Key configuration and a restart occurred, but a real post-restart production response has not been independently verified |
| Live intelligence monitoring | Planned; not implemented |
| Priority, dependency, retry, and approval controls | Planned; not implemented |
| AXES Control Center and future product worlds | Direction defined; no public service pilot implemented |

## Conclusion and recommendations

The project has a solid, testable operational core: a canonical codebase,
private persistence, a publicly reachable portal, and deliberately constrained
automation. The correct next move is to improve operational reliability before
expanding the public product surface.

1. Implement private monitoring and task controls first: scheduler heartbeat,
   engine health, memory availability, queue depth, failures, run outcomes,
   token totals, priorities, dependencies, bounded retries, and explicit
   approvals.
2. Verify production chat with a non-sensitive review-only prompt and confirm
   that response usage is recorded only in private storage.
3. Connect `axiom-engine` to the monorepo source in Railway so reviewed changes
   deploy reproducibly rather than requiring manual uploads.
4. Build AXES as a small, honest control-center and service-registry pilot
   before attempting citizenship, identity, social, currency, or virtual-world
   features.
5. Begin the School of Love & Ethics as an accessible, moderated learning and
   project-invention pilot. Any service for minors, direct messaging, dating,
   virtual interaction, identity verification, or transferable value requires
   its own safeguarding, moderation, privacy, legal, and operational review
   before implementation.

This sequence protects the founder vision by making the system dependable,
truthful about its capabilities, and safe to extend.

## Supporting references

- `PROJECT_TIMELINE.md`
- `docs/AXES_PLATFORM_PLAN.md`
- `docs/AXI_AUTOMATION_SERVICE.md`
- `docs/ENGINE_INTEGRATION.md`
- `docs/RAILWAY_DEPLOYMENT.md`
- `private-archive/copilot-library/2026-09-09-pasted-text-f2b84109/`
- Commits: `d588c9e`, `9c79b4a`, `a22bbb7`
