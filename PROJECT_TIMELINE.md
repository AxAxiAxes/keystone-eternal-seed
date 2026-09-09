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

## Current checkpoints

- [x] Preserve the upstream histories for all four repositories.
- [x] Separate deployable applications, package records, and KEYSTONE documents.
- [x] Remove generated `node_modules` from version control and prevent future commits.
- [x] Define the AXI.Core library implementation and public API.
- [x] Specify how `axiom-engine` and `axiom-freedom` communicate and share configuration.
- [x] Add automated checks for the engine and deployment configuration.
- [ ] Run and record a complete deployment verification from the consolidated repository. **Blocked:** Docker Desktop requires WSL, which must be installed from an elevated PowerShell and followed by a Windows restart.

## Deployment prerequisite

Run the following in an elevated PowerShell, restart Windows, then start Docker Desktop:

```powershell
wsl --install
```

After Docker Desktop is running, build and start the two application services from `apps/axiom-freedom`:

```powershell
Copy-Item .env.example .env
docker compose up --build --wait axiom-engine axiom-web
```

The deployment checkpoint is complete when `POST /api/axiom` through `axiom-web` returns the engine's `processed` response.

## Progress rule

Move a checkpoint to complete only when its implementation and supporting evidence are present in this repository. Add its completion date to the milestone table above.
