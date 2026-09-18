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
| `axescontracting.com` | Private, admin-only AXES command center | Root requires admin sign-in (`apps/axiom-freedom/server.js`); not a public marketing site. Connect to the public portal service only after this private-root behavior is understood by the operator |
| `xiiom.com` | Home of AXI and private operations entry | Active public portal; private engine remains inaccessible from the internet |
| `axoux.com` | Creator projects and collaboration | Park or redirect until the creator pilot is ready |
| `auxaous.com` | Private self-design and reflection tools | Park or redirect until the self-design pilot is ready |
| `urnur.com` | Future monetary currency and banking direction | Park or redirect pending the blocking banking and legal-readiness review; no application, banking claim, issuance, deposits, payments, token, market, or trading functionality |
| `axaxaxu.com` | Founder-defined future product or cultural direction | Park pending a scoped product brief |
| `axianaxiunaixia.com` | Founder-defined future product or cultural direction | Park pending a scoped product brief |
| `axaxiaxes.com` | Founder-defined future product or cultural direction | Park pending a scoped product brief |
| `axaxes.com` | Newly reported AXES site | Park pending confirmed registration, purpose, owner, privacy classification, budget, and operating model |
| `uxaxu.com` | Founder-defined future product or cultural direction | Park pending a scoped product brief |
| `owawawao.com` | Founder-defined future product or cultural direction | Park pending a scoped product brief |
| `aulaux.com` | Founder-defined future product or cultural direction | Park pending a scoped product brief |
| `axpur.com` | Unverified | Verify registration and ownership before assigning a role |

## Rollout order

1. **AXES Contracting:** Connect `axescontracting.com` to the existing public
   Railway portal. Its root now requires admin authentication and serves the
   private AXES Command Center (`command-center.html`), not a public hub page,
   while `xiiom.com` retains its current public home page.
2. **XIIOM:** Finish monitoring, task controls, production chat verification,
   and source-connected deployment. Do not expose the private engine.
3. **AXOUS through AXOUX and the School of Love & Ethics:** Use an invite-only
   creator and learning pilot before activating a separate public domain.
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

## 2026-09-18 update: expanded SiteGround registrar list + Main Deck statement

**Source:** Founder-provided SiteGround registrar screen, pasted directly
(message appeared to be cut off mid-list at `axaxes.com`, whose expiry/status
were not shown — treat the list below as partial pending confirmation of the
remainder).

The founder also stated that `axescontracting.com` is the main AXIOM chat and
the "everything combined" hub — the "Main Deck" they operate from, with
multiple branches (products/sites) being built simultaneously. This differs
from this document's 2026-09-09 characterization of `axescontracting.com` as
a **private, admin-only** command center (see the registry row above). That
row is not corrected here because it has not been independently verified
against the current deployment; see the live-check note below.

**Live check performed 2026-09-18:** `https://xiiom.com/health` responded
normally (`{"status":"ok","service":"AXIOM","version":"2.0.0"}`).
`https://axescontracting.com/health` and `https://axescontracting.com/` both
failed with a transport-level failure (DNS/connection/TLS) from this
environment's fetch tool — no content served at all, not even an auth wall.
This could mean DNS/hosting isn't live yet, or that it's blocked to this
specific tool; it is not confirmed which. Recommend the founder verify
`axescontracting.com`'s live status directly (browser or Railway dashboard)
before any routing/DNS change is made based on the Main Deck statement.

### Newly reported domains (SiteGround, 2026-09-18)

None of these have a defined product purpose recorded yet. Per the portfolio
principle above, they remain parked until a product brief exists.

| Domain | Registrar status shown | Expires |
| --- | --- | --- |
| `uxruxu.com` | Verification required | Sep 16, 2027 |
| `axtux.com` | Verification required | Sep 16, 2027 |
| `nuxiux.com` | Verification required | Sep 16, 2027 |
| `nuxuxun.com` | Verification required | Sep 16, 2027 |
| `uxaxaxu.com` | Verification required | Sep 16, 2027 |
| `xaxux.com` | Verification required | Sep 16, 2027 |
| `uxrax.com` | Verification required | Sep 16, 2027 |
| `haiuhi.com` | Verification required | Sep 16, 2027 |
| `axrux.com` | Verification required | Sep 16, 2027 |
| `axraxrax.com` | Verification required | Sep 16, 2027 |
| `axtamar.com` | Verification required | Sep 16, 2027 |
| `axaxox.com` | Verification required | Sep 16, 2027 |
| `axaxau.com` | Verification required | Sep 16, 2027 |
| `axescontracting.com` | Verified; privacy not yet added | Feb 3, 2029 |
| `urartuhi.com` | Verified; privacy not yet added | Sep 16, 2027 |
| `axarar.com` | Verified; privacy not yet added | Sep 16, 2027 |
| `axaxar.com` | Verified; privacy not yet added | Sep 15, 2027 |
| `axaxur.com` | Verified; privacy not yet added | Sep 15, 2027 |
| `axelurartu.com` | Verified; privacy not yet added | Sep 13, 2027 |
| `axaxes.com` | Reported, row cut off before status/expiry captured | Unknown — re-confirm |

Notes:
- `axaxar.com` is already registered by the founder at SiteGround. This
  matches (by name only) the new GitHub repository
  `AxAxiAxes/axaxar.com` created the same day for the Axaxar.com
  architecture draft — the domain registration and the draft repo are not
  yet connected (no DNS, no deployment).
- `xiiom.com` (documented above as the live public AXIOM home) does not
  appear in this newly reported SiteGround list; it may be registered under a
  different registrar/account, or simply not included in the founder's
  paste. Needs confirmation, not assumed.
- "Verification required" and "Add privacy" are registrar-side actions
  (SiteGround account) outside repository access; recorded here for
  inventory purposes only, not actioned.
- Several of these domains were already listed in the 2026-09-09 registry
  above under different-looking names (e.g. `axaxaxu.com`, `axaxiaxes.com`);
  cross-check for duplicates/typos once the founder confirms the full,
  uncut list.

## 2026-09-18 update: GitHub repo reserved for every tracked domain

Per founder request, a placeholder GitHub repository named after each of the
31 domains tracked in this document (all rows above plus the "Newly
reported domains" table) now exists under the `AxAxiAxes` account, matching
the naming convention already used for `axaxar.com` and `urartuhi.com`.
Each placeholder repo contains only a `README.md` stating its current role
(copied from this file), that it is reserved/not yet built, and that no
product work should start there without founder approval — no application
code, no DNS, no hosting, and no account/payment setup was created.

Two domains already had dedicated repos before this pass and were left
untouched: `axaxar.com` (draft architecture, see
`docs/keystone/AXAXAR_LAUNCH_PLAN.md`) and `urartuhi.com` (live gallery site
on GitHub Pages, not yet DNS-connected). All other 29 domains now have a
freshly created, empty-except-README repo at
`https://github.com/AxAxiAxes/<domain>`.

This is namespace reservation only. It does not change any domain's
registration, DNS, hosting, or product status — see `PRODUCT_BRANCH_DOMAIN_MAP.md`
for the current status of each branch, and follow the same section's
"Maintenance" note to keep the map in sync as these repos gain real content.

## Immediate domain tasks

1. Enable registrar privacy for every eligible registered domain.
2. Migrate `info@axescontracting.com` from SiteGround mail to Microsoft 365
   using the rollback-safe procedure in `EMAIL_MIGRATION_PLAN.md`. Keep website
   and email DNS changes separate.
3. Record registrar, renewal date, registrant account, DNS provider, nameserver,
   intended product, and owner in a private operational inventory. Do not store
   registrar credentials in this repository.
4. Add only Railway's specified DNS record for `axescontracting.com`; do not
   alter Microsoft 365 or unrelated mail records.
5. Confirm TLS and `/health` after DNS propagation.
6. Park, redirect, or place a minimal holding page on all unassigned domains.

## AXES-owned hardware readiness

The future AXES hardware plan should begin as a portable deployment design:
containerized services, documented environment variables, managed database
exports, encrypted off-site backups, infrastructure-as-code where appropriate,
and a tested restoration procedure. Hardware should be an optional deployment
target, not the only location of critical records.
