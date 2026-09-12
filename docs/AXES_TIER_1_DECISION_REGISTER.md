# AXES Tier 1 decision register

**Status:** Internal coordination record; no pending decision is approved by
this document
**Recorded:** 2026-09-11
**Owner:** Founder or named human delegate
**Purpose:** Keep the next founder-controlled decisions, external-action
boundaries, and evidence requirements visible across the AXES early-revenue
and continuity program.

## Operating rule

This register tracks decisions; it does not authorize a price, service,
publication, external account change, deployment, legal engagement, payment,
provider action, financial feature, or claim. An item moves from pending only
when the named human decision and its referenced evidence are recorded in the
appropriate private or repository-controlled record.

## Current decision queue

| Priority | Decision | Current state | Required evidence before resolution | Human-controlled boundary |
| --- | --- | --- | --- | --- |
| P0 | Restore provider-backed production chat, if the founder chooses to operate it | Pending | Authorized Railway operator confirms the encrypted private provider variable, private engine health, and protected-console behavior after restart | Requires authorized external Railway access; do not disclose or commit credentials |
| P0 | Merge PR #1 (`axaxiaxes-axes-directory-data-model` → `axaxiaxes-axiom-monorepo`) to deploy the built AXI agent/automation governance system | Pending | Confirmed via `git diff` against the deployed base branch: all 5 registered AXI agents, their per-agent report route, and `AXES_AGENT_ORIGIN_REGISTRY.md` exist only on this branch (24 commits ahead); the deployed branch has none of it | Merging auto-triggers a Railway redeploy of the public portal per `RAILWAY_DEPLOYMENT.md`; requires explicit founder go-ahead, not repository access alone |
| P0 | Determine patent/invention filing status and preservation path | Pending | Founder-reviewed private source/filing inventory, dates, and qualified counsel scope if pursued | Requires founder decision and any professional engagement outside this repository |
| P0 | Define URNUR's permitted scope | Pending | Written legal/compliance guidance for the actual proposed jurisdiction and feature scope | Financial, banking, currency, token, marketplace, trading, and collectible-exchange work remains inactive |
| P1 | Activate AXES design/materials consultation candidate `AXES-DMC-001` | Not approved | Completed activation record, scope, owner, price basis, terms, capacity, rights/accessibility review, and low/base/high assumptions | No publication, outreach, paid delivery, or professional-service claim before founder approval |
| P1 | Activate KEYSTONE creator-origin setup candidate `KEYSTONE-COS-001` | Not approved | Completed activation record, private data handling, terms, capacity, legal/privacy review, and low/base/high assumptions | Recordkeeping only; no legal conclusion, filing, enforcement, public registry, payment, or financial service |
| P1 | Run a productivity-tool evaluation | Not measured | Founder-reviewed non-sensitive test with manual baseline, assisted time, correction time, quality decision, and permitted account/data settings | Do not use private material or claim productivity savings before measured review |
| P1 | Advance AXIOM Engine and AXIOM Freedom draft registry records | Draft / unverified | Named human owner, Ux relationship, verified source/credit record, bounded authority scope, data/retention record, security/continuity review, and release decision | No KEYSTONE Origin Unit authority, legal-right conclusion, deployment authorization, or public claim from draft records |
| P1 | Approve a specific source asset for reuse | Not approved | Individual asset-use record with source, rights basis, credit/consent, accessibility, privacy, technical-quality, and human decision | Keep private archives and excluded references private; no provider or public reuse without approval |
| P2 | Connect AXES Contracting domain and complete email migration | Pending | Founder-approved access inventory, rollback plan, exact provider records, and post-change verification. **Verified 2026-09-11:** `axescontracting.com`/`www.axescontracting.com` still resolve via `ns1.siteground.net` (legacy SiteGround), not Railway; HTTPS fails with an expired certificate; plain HTTP returns stale legacy content, not the `axiom-web` portal. See `RAILWAY_DEPLOYMENT.md` "Current deployment state." The destination once connected is now a **private, admin-gated command center** (root requires `ADMIN_PASSWORD`), not a public hub page. | Requires authorized Railway, DNS, and mail-provider action; do not change settings from this repository |
| P2 | Prepare AXES OS backup/restore phase | Planned | Founder-approved private encrypted backup destination, retention policy, checkpoint transfer, and documented restore drill | No private data transfer or infrastructure procurement without explicit approval |

## Evidence and review cadence

At least weekly, the founder or named human delegate reviews this queue with
the project timeline, budget, evidence ledger, asset-use register, and
application draft records. A review may continue, pause, retire, or reorder a
candidate, but must not mark an item complete without its required evidence.

For income candidates, use `AXES_TIER_1_EVIDENCE_LEDGER.md`; actual revenue,
cost, client, and payment records remain private. For productivity, record
only measured results. For assets, use `AXES_ASSET_USE_READINESS.md`; private
archive contents remain excluded from the repository.

## Related records

- `AXES_BUILD_PROGRAM.md` (this register is the foundation-depth gauge its
  "Foundation depth principle" section checks before each workstream starts)
- `PROJECT_TIMELINE.md`
- `FOUNDER_REVENUE_PRIORITY_OVERLAY.md`
- `KEYSTONE_TIER_1_AUTOMATION_AND_INCOME_PLAN.md`
- `AXES_TIER_1_EVIDENCE_LEDGER.md`
- `AXES_DESIGN_MATERIALS_CONSULTATION_READINESS.md`
- `KEYSTONE_CREATOR_ORIGIN_SETUP_READINESS.md`
- `AXES_ASSET_USE_READINESS.md`
- `keystone/AXIOM_APPLICATION_DRAFT_RECORDS.md`
- `PROJECT_BUDGET.md`
