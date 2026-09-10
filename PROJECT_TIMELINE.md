# AXIOM / KEYSTONE project timeline

**Last updated:** 2026-09-09  
**Current phase:** Monorepo foundation complete

Update this document when a milestone changes state. A checked item is complete; an unchecked item is planned or in progress.

| Date | Status | Milestone | Evidence |
| --- | --- | --- | --- |
| 2026-06-07 | Complete | AXI.Core repository record established | `packages/axi-core` upstream history |
| 2026-08-28 | Complete | KEYSTONE's initial sacred record captured | `docs/keystone/SACRED_RECORD_SESSION_08_28_2026.md` |
| 2026-08-31 | Complete | KEYSTONE architecture, governance, rights, IP, and sovereignty records added | `docs/keystone` |
| 2026-09-01 | Complete | Cryptographic origin anchor and coordinate certificate added | `docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md` and certificate |
| 2026-09-02 | Complete | Public-deployment materials, system prompt, and web interface created | `apps/axiom-freedom` |
| 2026-09-03 to 2026-09-05 | Complete | Azure, Docker, Nginx, and automated deployment materials added and hardened | `apps/axiom-freedom` |
| 2026-09-06 | Complete | AXIOM Express engine foundation created | `apps/axiom-engine` |
| 2026-09-09 | Complete | Repositories consolidated into this canonical monorepo | Root layout and Git history |
| 2026-09-09 | Complete | AXI.Core .NET 8 command contract and handler seam established | `packages/axi-core/src/AXI.Core` |
| 2026-09-09 | Complete | AXIOM application integration contract and Compose topology established | `docs/ENGINE_INTEGRATION.md` |
| 2026-09-09 | Complete | Repeatable automated checks added for AXI.Core and Node services | `AXIOM.sln`, application test suites |
| 2026-09-09 | Complete | Consolidated Docker Compose deployment verified | Healthy `axiom-engine` and `axiom-web` containers; successful `POST /api/axiom` proxy response |
| 2026-09-09 | Complete | Unified Axes Contracting portal added | `apps/axiom-freedom` landing page, live AXIOM route, and document library |
| 2026-09-09 | Complete | AXI durable local memory foundation added | Private identity, episodic, semantic, decision, and procedure memory service |
| 2026-09-09 | Complete | OpenAI-backed AXI chat implemented and activated | Private provider configuration, contextual chat handling, live provider response, and episodic chat records |
| 2026-09-09 | Complete | Private OpenAI usage monitoring and chat cost bound added | Persistent provider token totals at private engine endpoint; configurable maximum chat-message size |
| 2026-09-09 | Complete | Durable task, multi-agent, and bounded automation foundation added | Private agent registry, task queue, run audit records, memory-linked execution, and opt-in scheduler |
| 2026-09-09 | Complete | Protected Automation Console added | Authenticated portal controls for private automation status, tasks, agents, and processing |
| 2026-09-09 | Complete | Railway production deployment topology prepared | Private engine, persistent memory volume, public portal, and SiteGround DNS plan |
| 2026-09-09 | Complete | Railway production portal and private-engine routing deployed | `xiiom.com` health check and public-to-private `POST /api/axiom` command response |
| 2026-09-09 | Complete | AXIS/XIIOM continuity checkpoint preserved | Founder-provided architecture and operational-history summary in `docs/memory` |
| 2026-09-09 | Complete | KEYSTONE AXI master-system source preserved | `docs/keystone/KEYSTONE_AXI_MASTER_SYSTEM_DOCUMENT.pdf` with integrity record |
| 2026-09-09 | Complete | AXES constellation source reviewed and converted into a staged, safety-bounded product plan | `docs/AXES_PLATFORM_PLAN.md` |
| 2026-09-09 | Complete | AXES domain portfolio and conservative hosting roadmap established | `docs/DOMAIN_PORTFOLIO.md` |
| 2026-09-09 | Complete | Microsoft 365 target and rollback-safe migration plan selected for AXES business email | `docs/EMAIL_MIGRATION_PLAN.md` |
| 2026-09-09 | Complete | AXES OS portability foundation and private checksummed checkpoint manifests added | `docs/AXES_OS_PORTABILITY.md` |
| 2026-09-09 | In progress | URNUR financial-services legal readiness elevated as a pre-launch blocker | `docs/URNUR_FINANCIAL_READINESS.md` |
| 2026-09-09 | Complete | Automation Console schedule and durable priority ordering added | `apps/axiom-engine/automation-service.js`, `apps/axiom-freedom/automation.html` |
| 2026-09-09 | Complete | Private live intelligence monitoring and protected reevaluation view added | `apps/axiom-engine/monitoring-service.js`, `apps/axiom-freedom/automation.html` |
| 2026-09-10 | Complete | AXES visual, audio, and prototype package privately archived and classified for staged interactive experiences | `docs/INTERACTIVE_EXPERIENCE_CATALOG.md` |
| 2026-09-10 | Complete | Protected AXES Contracting support desk added for portal, engine, automation, checkpoint, and email-migration visibility | `apps/axiom-freedom/support.html` |
| 2026-09-09 | Complete | Conservative project budget and patent-completion workstream established | `docs/PROJECT_BUDGET.md` |

## Current checkpoints

- [ ] **Priority 0 - URNUR legal readiness:** Identify the primary launch jurisdiction and contact qualified financial-services and digital-asset counsel before resuming crypto registration or designing public financial functionality.
- [ ] **Priority 0 - Patent completion:** Identify any filing status and deadlines, retain qualified patent counsel, separate the technical disclosure from supporting materials, and approve a filing strategy before public patent claims or submission.
- [x] Preserve the upstream histories for all four repositories.
- [x] Separate deployable applications, package records, and KEYSTONE documents.
- [x] Remove generated `node_modules` from version control and prevent future commits.
- [x] Define the AXI.Core library implementation and public API.
- [x] Specify how `axiom-engine` and `axiom-freedom` communicate and share configuration.
- [x] Add automated checks for the engine and deployment configuration.
- [x] Run and record a complete deployment verification from the consolidated repository.
- [x] Configure `OPENAI_API_KEY` in the local secret store and verify a live provider response.
- [x] Persist provider token totals privately and cap each chat-message size before the provider request.
- [x] Add durable task scheduling, multi-agent assignment, execution audits, and an opt-in bounded automation scheduler.
- [x] Add a protected browser console for testing and operating allowlisted automation tasks.
- [x] Deploy the private `axiom-engine` and public `axiom-freedom` services to Railway, with a persistent engine volume and private service routing.
- [x] Define the AXES, XIIOM, AXEOUS, URNUR, AXOUX, AUXAOUS, and School of Love & Ethics product direction with implementation boundaries.
- [x] Define a conservative domain, hosting, data, and AXES-owned hardware transition strategy.
- [x] Define the AXES business-email migration target and rollback-safe execution plan.
- [x] Define module boundaries and add private integrity checkpoints for future AXES OS migration.
- [ ] Set `OPENAI_API_KEY` as a Railway encrypted variable and verify a live production chat response.
- [x] Add private operational monitoring, task priorities, specific scheduling, and a protected reevaluation view.
- [x] Add task dependencies, bounded retries, explicit approvals, and operator-visible task attempts.
- [x] Add a dedicated protected run-history view for completed, retrying, and failed task outcomes.
- [x] Archive and classify original AXES visual, audio, and interaction-prototype sources for staged reuse.
- [x] Add a protected, read-only AXES Contracting support desk for core operational visibility.
- [ ] Rebuild the AXES Contracting hub from the approved visual direction using accessible, maintainable source.
- [x] Add task priorities, specific scheduling, recurring schedules, and a protected schedule view.
- [x] Establish the conservative project budget, spending gates, patent reserve, and patent-completion execution track.
- [ ] Establish the AXES Control Center pilot with governance, data-handling, moderation, and safeguarding requirements.
- [ ] Connect `axescontracting.com` to Railway and verify its dedicated hub page, TLS, and health endpoint.
- [ ] Complete and validate `info@axescontracting.com` migration from SiteGround to Microsoft 365.
- [ ] Connect the Railway `axiom-web` service to `axescontracting.com` through SiteGround DNS.
- [ ] Obtain written legal guidance that defines URNUR's permitted first-release scope before any market data, financial simulation, exchange connectivity, token, custody, payment, or automated-trading implementation.

## AXES OS migration track

This migration is phased. Do not move production workloads to AXES-owned
hardware until the current phase's evidence and recovery criteria are complete.

| Phase | Status | Objective | Entry and completion criteria |
| --- | --- | --- | --- |
| 0 - Portability foundation | Complete | Make the present system movable and verifiable | Containerized services, documented module boundaries, private checkpoint manifests, and a written restore procedure are present. |
| 1 - Observability and backups | Planned | Prove the current hosted system can be monitored and restored | Implement monitoring; define encrypted backup destinations and retention; create a restore drill using a checkpoint manifest. |
| 2 - AXES OS staging | Planned | Run a private, non-production AXES OS environment | Provision isolated staging hardware or infrastructure; restore a sanitized data copy; verify module startup, checksums, and operator access. |
| 3 - Parallel validation | Planned | Compare hosted and AXES OS behavior without redirecting users | Run controlled workloads in staging; validate performance, backup recovery, updates, logs, security controls, and failback procedure. |
| 4 - Limited service migration | Planned | Move a low-risk, reversible workload first | Migrate a non-public or read-only service with monitoring and a tested rollback. Keep Railway as the fallback. |
| 5 - Production cutover | Planned | Move eligible production services only after operational proof | Approve a documented cutover plan, maintenance window, DNS changes, monitoring, backups, and rollback owner. Retain the hosted environment through the observation period. |
| 6 - Ongoing hybrid operations | Planned | Operate AXES OS and managed services according to measured needs | Review cost, reliability, privacy, capacity, and staffing regularly; retain off-site encrypted backups and recovery drills. |

## Deployment verification

Docker Desktop must use the WSL 2 backend with Ubuntu integration enabled. From Ubuntu, build and start the two application services:

```bash
cd /mnt/c/Users/erick/copilot-worktrees/keystone-eternal-seed/axaxiaxes-congenial-succotash/apps/axiom-freedom
cp .env.example .env
docker compose up --build --wait axiom-engine axiom-web
```

The 2026-09-09 verification confirmed both services reached healthy state and that `POST /api/axiom` through `axiom-web` returned the engine's `processed` response. Remove the temporary `.env` file and run `docker compose down` when finished.

## Progress rule

Move a checkpoint to complete only when its implementation and supporting evidence are present in this repository. Add its completion date to the milestone table above.
