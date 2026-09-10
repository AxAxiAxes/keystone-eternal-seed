# AXIOM / KEYSTONE Monorepo

The canonical repository for the AXIOM engine, AXIOM deployment materials, AXI.Core record, and KEYSTONE's founding documentation.

Track completed milestones and next checkpoints in [PROJECT_TIMELINE.md](PROJECT_TIMELINE.md).

For production hosting on Railway with `axescontracting.com`, follow [RAILWAY_DEPLOYMENT.md](docs/RAILWAY_DEPLOYMENT.md).

The staged AXES product constellation and its privacy, safeguarding, and
automation boundaries are defined in [AXES_PLATFORM_PLAN.md](docs/AXES_PLATFORM_PLAN.md).
The long-range, dependency-ordered delivery program is in
[AXES_BUILD_PROGRAM.md](docs/AXES_BUILD_PROGRAM.md).

## Repository layout

| Path | Purpose |
| --- | --- |
| `apps/axiom-engine` | Express-based AXIOM service. |
| `apps/axiom-freedom` | Deployment automation, web interface, and operational configuration. |
| `packages/axi-core` | Preserved AXI.Core repository record. No library implementation is currently present upstream. |
| `docs/keystone` | KEYSTONE architecture, governance, patent, cryptographic, and session records. |
| `docs/memory` | Public-safe, versioned project decision and milestone memory. |
| `docs/patents` | AXI patent source documents and integrity records. |

## Working with applications

Each application owns its own dependency manifest. Run install and start commands from that application's directory; do not commit generated dependency directories such as `node_modules`.

## Source provenance

This repository consolidates the following public repositories while preserving their histories:

- [`AxAxiAxes/keystone-eternal-seed`](https://github.com/AxAxiAxes/keystone-eternal-seed)
- [`AxAxiAxes/axiom-engine`](https://github.com/AxAxiAxes/axiom-engine)
- [`AxAxiAxes/axiom-freedom`](https://github.com/AxAxiAxes/axiom-freedom)
- [`AxAxiAxes/Class-Library-.NET-8-`](https://github.com/AxAxiAxes/Class-Library-.NET-8-)
