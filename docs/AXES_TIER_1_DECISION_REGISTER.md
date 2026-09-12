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
| P0 | Restore provider-backed production chat, if the founder chooses to operate it | **Still failing as of 2026-09-12 05:11 UTC**, after the founder reported the Railway `axiom-engine` service already has an `OPENAI_API_KEY` variable listed. Re-tested live twice (45 seconds apart) with identical results both times: HTTP 503, `{"error":"AXIOM chat is not configured"}` | A direct, reproducible live test of `POST https://xiiom.com/api/axiom` (`action: "chat"`) returns HTTP 503 with `{"error":"AXIOM chat is not configured"}`. Source inspection of `apps/axiom-engine/chat-service.js` shows this exact status/message is thrown only when the engine's own `apiKey` (wired from `process.env.OPENAI_API_KEY` in `apps/axiom-engine/index.js`) is falsy. This rules out "engine unreachable/crashed" (a network-level failure would surface as the portal's separate `unreachable-private-engine` category, not this one) — the `axiom-engine` Railway service is up and responding. Railway's variable list masks a row identically whether it holds a real value or an empty string, so the variable's mere presence does not confirm it is filled in or that the running deployment has picked it up; environment variables are read once at process startup (`apps/axiom-engine/index.js`), so a variable change never takes effect without an explicit redeploy/restart. A newly observed complication: the Railway dashboard shows **two separate projects** (`lucid-flow`, `handsome-motivation`), each with services online; if the `OPENAI_API_KEY` checked so far is in the project that is not actually bound to `xiiom.com`, that would fully explain why nothing has changed regardless of the variable's value — see `RAILWAY_DEPLOYMENT.md` | Authorized Railway operator must (1) confirm which project's service has the `xiiom.com` custom domain (Settings > Networking > Custom Domain), (2) in that specific project, open the `OPENAI_API_KEY` variable and confirm it holds a real, non-empty OpenAI API key, (3) explicitly redeploy/restart that project's `axiom-engine` service, then (4) confirm chat succeeds; requires authorized external Railway access and an actual OpenAI API key/credential — neither can be created, retrieved, or set from this repository; do not disclose or commit credentials |
| P0 | Keep `xiiom.com` and all Railway services online past the current trial period | **New 2026-09-12.** The Railway dashboard displayed "24 days or $4.62" of trial credit/time remaining, with an "Upgrade to keep your services online" prompt, across both observed projects | Founder-reviewed Railway billing/plan page showing current plan, remaining credit or trial window, and the specific date/threshold at which services would be suspended if not upgraded | This is a billing decision requiring the founder's Railway account access and payment method; it cannot be assessed, authorized, or acted on from this repository. If the trial lapses without action, all services in both projects (not just chat) are at risk of going offline |
| P0 | Merge PR #1 (`axaxiaxes-axes-directory-data-model` → `axaxiaxes-axiom-monorepo`) to deploy the built AXI agent/automation governance system | **Resolved 2026-09-12.** Founder authorized autonomous merging in-session; PR #1 merged (`e9d4f98`), followed by PR #2 (chat-diagnostics/engine-error-forwarding fix, `9b68843`) and PR #3 (vendor/subscription audit checklist, `a2960e8`). All CI green on each merge. Post-merge live check confirmed `xiiom.com/health` returns `{"status":"ok"}`, `/origin-continuity` renders the expected content, and `/support` still correctly returns 401 without credentials | Founder go-ahead was given for autonomous merging in this session; future merges of this scale should still get an explicit founder go-ahead per this row's original intent | Redeploy occurred automatically via Railway's existing branch integration; no manual Railway/DNS action was taken or required |
| P0 | Determine patent/invention filing status and preservation path | Pending | Founder-reviewed private source/filing inventory, dates, and qualified counsel scope if pursued | Requires founder decision and any professional engagement outside this repository |
| P0 | Define URNUR's permitted scope | Pending | Written legal/compliance guidance for the actual proposed jurisdiction and feature scope | Financial, banking, currency, token, marketplace, trading, and collectible-exchange work remains inactive |
| P1 | Activate AXES design/materials consultation candidate `AXES-DMC-001` | Not approved | Completed activation record, scope, owner, price basis, terms, capacity, rights/accessibility review, and low/base/high assumptions | No publication, outreach, paid delivery, or professional-service claim before founder approval |
| P1 | Activate KEYSTONE creator-origin setup candidate `KEYSTONE-COS-001` | Not approved | Completed activation record, private data handling, terms, capacity, legal/privacy review, and low/base/high assumptions | Recordkeeping only; no legal conclusion, filing, enforcement, public registry, payment, or financial service |
| P1 | Run a productivity-tool evaluation | Not measured | Founder-reviewed non-sensitive test with manual baseline, assisted time, correction time, quality decision, and permitted account/data settings | Do not use private material or claim productivity savings before measured review |
| P1 | Advance AXIOM Engine and AXIOM Freedom draft registry records | Draft / unverified | Named human owner, Ux relationship, verified source/credit record, bounded authority scope, data/retention record, security/continuity review, and release decision | No KEYSTONE Origin Unit authority, legal-right conclusion, deployment authorization, or public claim from draft records |
| P1 | Approve a specific source asset for reuse | Not approved | Individual asset-use record with source, rights basis, credit/consent, accessibility, privacy, technical-quality, and human decision | Keep private archives and excluded references private; no provider or public reuse without approval |
| P2 | Connect AXES Contracting domain and complete email migration | Pending | Founder-approved access inventory, rollback plan, exact provider records, and post-change verification. **Verified 2026-09-11:** `axescontracting.com`/`www.axescontracting.com` still resolve via `ns1.siteground.net` (legacy SiteGround), not Railway; HTTPS fails with an expired certificate; plain HTTP returns stale legacy content, not the `axiom-web` portal. See `RAILWAY_DEPLOYMENT.md` "Current deployment state." The destination once connected is now a **private, admin-gated command center** (root requires `ADMIN_PASSWORD`), not a public hub page. | Requires authorized Railway, DNS, and mail-provider action; do not change settings from this repository |
| P2 | Prepare AXES OS backup/restore phase | Planned | Founder-approved private encrypted backup destination, retention policy, checkpoint transfer, and documented restore drill | No private data transfer or infrastructure procurement without explicit approval |
| P2 | Confirm Railway redeployed `xiiom.com`'s `axiom-web` service after PR #6 merged (`56d71d1`) | Pending | New routes `/design-desk` and `/axescontracting` still returned 404 on `xiiom.com` roughly 10 minutes after merge, while `/health` and `/materials` responded normally; this needs an authorized operator to check the Railway dashboard's deployment history/logs for the `axiom-web` service to confirm the build triggered, succeeded, and rolled out | Requires authorized Railway dashboard access; no deploy can be triggered or inspected from this repository |

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
