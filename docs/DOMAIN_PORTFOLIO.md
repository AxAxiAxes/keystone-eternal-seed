# AXES domain portfolio and conservative hosting plan

**Status:** Planning record  
**Recorded:** 2026-09-09  
**Source:** Founder-provided SiteGround domain inventory.

## Portfolio principle

AXES Contracting is the hub, not an instruction to build eleven independent
applications. Keep unused domains parked or redirected until a product has a
defined purpose, owner, privacy classification, budget, and operating model.
One shared platform can serve several domains through host-based routing while
each product remains separately branded.

## Domain registry

The founder reported eleven registered SiteGround domains. `axpur.com` was also
listed but its registration status was not provided and must be verified before
it is planned or used.

| Domain | Product role | Initial status |
| --- | --- | --- |
| `axescontracting.com` | Central AXES hub and control center | First public pilot; connect only to the public portal service |
| `xiiom.com` | Home of AXI and private operations entry | Active public portal; private engine remains inaccessible from the internet |
| `axoux.com` | Creator projects and collaboration | Park or redirect until the creator pilot is ready |
| `auxaous.com` | Private self-design and reflection tools | Park or redirect until the self-design pilot is ready |
| `urnur.com` | Contribution recognition and lineage direction | Park or redirect; no payments, token, or trading functionality |
| `axaxaxu.com` | Founder-defined future product or cultural direction | Park pending a scoped product brief |
| `axianaxiunaixia.com` | Founder-defined future product or cultural direction | Park pending a scoped product brief |
| `axaxiaxes.com` | Founder-defined future product or cultural direction | Park pending a scoped product brief |
| `uxaxu.com` | Founder-defined future product or cultural direction | Park pending a scoped product brief |
| `owawawao.com` | Founder-defined future product or cultural direction | Park pending a scoped product brief |
| `aulaux.com` | Founder-defined future product or cultural direction | Park pending a scoped product brief |
| `axpur.com` | Unverified | Verify registration and ownership before assigning a role |

## Rollout order

1. **AXES Contracting:** Connect `axescontracting.com` to the existing public
   Railway portal. It receives a dedicated hub page while `xiiom.com` retains
   its current home page.
2. **XIIOM:** Finish monitoring, task controls, production chat verification,
   and source-connected deployment. Do not expose the private engine.
3. **AXOUX and the School of Love & Ethics:** Use an invite-only creator and
   learning pilot before activating a separate public domain.
4. **AUXAOUS and AXEOUS:** Activate only after privacy, moderation,
   safeguarding, export, and deletion capabilities exist.
5. **URNUR and remaining domains:** Keep parked until they have documented
   product scope and any required legal, financial, or policy review.

## Shared platform model

| Concern | Lean first implementation | Future upgrade path |
| --- | --- | --- |
| Web delivery | One Railway public portal, host-based pages, and redirects | AXES-owned hardware or a managed container platform behind a CDN |
| Core database | Managed PostgreSQL with row-level access rules | Dedicated Postgres cluster with read replicas, backups, and managed failover |
| AI memory | Structured records plus `pgvector`; source and consent metadata required | Separate retrieval/search capacity as usage demonstrates a need |
| Files and media | Private object storage with lifecycle rules | S3-compatible object storage under AXES-controlled accounts or hardware |
| Video | Embed or managed video for a small pilot | Dedicated streaming service or self-hosted video only after staffing and demand justify it |
| Observability | Engine health, queue, scheduler, memory, and usage monitoring | Central metrics, alerts, backup validation, and disaster-recovery exercises |

## Conservative operating budget

Use the lowest tier that supports backups, private access, and monitoring.
Treat these as planning caps, not current vendor quotations; verify prices and
terms before purchasing.

| Stage | Monthly cap | Included services |
| --- | ---: | --- |
| Foundation | $25-$75 | Existing public hosting, one private engine, backups, basic monitoring, and domain renewals already owned |
| Pilot | $75-$200 | Managed Postgres, small private object storage, transactional email if needed, and limited video or moderation tooling |
| Validated growth | $200-$750 | Production database backups, higher storage/egress, monitoring alerts, moderation operations, and a small media budget |
| AXES-owned infrastructure evaluation | Budget only after usage data | Hardware, power, secure network, replacement parts, off-site backups, operations time, and disaster recovery |

Do not purchase AXES-owned hardware simply to replace low early-stage cloud
costs. Evaluate it after the public pilot has measured storage, bandwidth,
availability, privacy, and staffing needs. Keep an off-site encrypted backup
regardless of where the primary hardware runs.

## Immediate domain tasks

1. Enable registrar privacy for every eligible registered domain.
2. Record registrar, renewal date, registrant account, DNS provider, nameserver,
   intended product, and owner in a private operational inventory. Do not store
   registrar credentials in this repository.
3. Add only Railway's specified DNS record for `axescontracting.com`; do not
   alter Microsoft 365 or unrelated mail records.
4. Confirm TLS and `/health` after DNS propagation.
5. Park, redirect, or place a minimal holding page on all unassigned domains.

## AXES-owned hardware readiness

The future AXES hardware plan should begin as a portable deployment design:
containerized services, documented environment variables, managed database
exports, encrypted off-site backups, infrastructure-as-code where appropriate,
and a tested restoration procedure. Hardware should be an optional deployment
target, not the only location of critical records.
