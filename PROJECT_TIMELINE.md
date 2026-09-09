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

## Current checkpoints

- [x] Preserve the upstream histories for all four repositories.
- [x] Separate deployable applications, package records, and KEYSTONE documents.
- [x] Remove generated `node_modules` from version control and prevent future commits.
- [ ] Define the AXI.Core library implementation and public API; the imported source currently contains only its repository record.
- [ ] Specify how `axiom-engine` and `axiom-freedom` communicate and share configuration.
- [ ] Add automated checks for the engine and deployment configuration.
- [ ] Run and record a complete deployment verification from the consolidated repository.

## Progress rule

Move a checkpoint to complete only when its implementation and supporting evidence are present in this repository. Add its completion date to the milestone table above.
