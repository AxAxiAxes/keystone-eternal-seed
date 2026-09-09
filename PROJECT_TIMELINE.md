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
| 2026-09-09 | Complete | Railway production deployment topology prepared | Private engine, persistent memory volume, public portal, and SiteGround DNS plan |
| 2026-09-09 | Complete | AXIS/XIIOM continuity checkpoint preserved | Founder-provided architecture and operational-history summary in `docs/memory` |

## Current checkpoints

- [x] Preserve the upstream histories for all four repositories.
- [x] Separate deployable applications, package records, and KEYSTONE documents.
- [x] Remove generated `node_modules` from version control and prevent future commits.
- [x] Define the AXI.Core library implementation and public API.
- [x] Specify how `axiom-engine` and `axiom-freedom` communicate and share configuration.
- [x] Add automated checks for the engine and deployment configuration.
- [x] Run and record a complete deployment verification from the consolidated repository.
- [x] Configure `OPENAI_API_KEY` in the local secret store and verify a live provider response.
- [ ] Create the Railway project and deploy the private `axiom-engine` and public `axiom-web` services.
- [ ] Connect the Railway `axiom-web` service to `axescontracting.com` through SiteGround DNS.

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
