# AXES project budget and approval model

**Status:** Conservative planning baseline  
**Recorded:** 2026-09-09  
**Currency:** USD  
**Purpose:** Guide human-approved spending across the AXES, XIIOM, and future
product program. This is a planning model, not an authorization to spend.

## Budget principles

1. Protect legal, patent, security, backup, and continuity obligations before
   discretionary product expansion.
2. Operate one shared platform for the domain portfolio; do not fund eleven
   separate applications.
3. Keep fixed monthly costs low until a pilot demonstrates active use.
4. Require written quotes and a designated human approver before purchases,
   subscriptions, contracts, filings, or professional engagements.
5. Keep a contingency reserve. Automation may record approved budgets but must
   never spend money, accept terms, open accounts, or sign agreements.

## 12-month conservative budget

| Category | Monthly planning range | First-year planning range | Purpose and control |
| --- | ---: | ---: | --- |
| Domains, privacy, DNS | $0-$35 | $0-$420 | Existing registrations are separate sunk cost; enable eligible privacy and track renewals privately |
| Public portal and private engine | $25-$75 | $300-$900 | Existing Railway-style hosting, health checks, and private service routing |
| Business email | $10-$30 | $120-$360 | Microsoft 365 mailbox license and conservative migration contingency |
| Database, backups, and object storage | $25-$125 | $300-$1,500 | Begin only when structured AXES data or media requires it; include encrypted backup capacity |
| Monitoring, transactional email, and security tools | $0-$75 | $0-$900 | Add only as the public pilot requires them |
| Pilot design, moderation, and accessibility | $0-$250 | $0-$3,000 | Small, invite-only creator and learning pilot; no broad social launch |
| Patent search, counsel, and filing reserve | N/A | $12,000-$30,000 | Highest near-term professional reserve; obtain written scope and quotes |
| URNUR financial-services counsel | N/A | $2,000-$10,000 | Discovery and classification only; no financial product work before legal direction |
| Contingency reserve | N/A | $3,000-$10,000 | Unplanned recovery, migration, security, and professional costs |
| **Planning total** | **$60-$590** | **$17,720-$57,080** | Lower end supports the operational core; upper end includes major legal and patent readiness |

The professional-fee ranges are deliberately broad. The existing patent packet
is technically and legally complex, so counsel must provide a written estimate
after reviewing the actual filing scope, entity status, claim count, figures,
prior art, and deadlines. Confirm current USPTO fees directly from the
[USPTO fee schedule](https://www.uspto.gov/learning-and-resources/fees-and-payment/uspto-fee-schedule).

## Spending gates

| Priority | Gate | Maximum planned commitment | Approval required |
| --- | --- | ---: | --- |
| P0 | Patent and URNUR legal discovery | $3,000-$7,500 | Founder plus written scope from qualified counsel |
| P1 | Patent filing and prosecution reserve | $12,000-$30,000 | Founder plus patent-attorney filing plan and quote |
| P1 | AXES operational core | $75 per month initially | Founder approval; review usage monthly |
| P2 | Microsoft 365 mailbox migration | $500 one-time including contingency | Founder approval after migration inventory and cutover plan |
| P2 | AXES database and backup pilot | $150 per month initially | Founder approval after data model, retention, and restore requirements |
| P3 | Creator/learning pilot | $3,000 maximum before results review | Founder approval after moderation and safeguarding design |
| Deferred | Community, media, financial, or hardware expansion | No commitment | Requires measured demand, a written plan, legal/safety review, and explicit approval |

## Patent-completion workstream

The preserved patent packet is a source and preparation record, not evidence
that an application has been filed, is pending, or will be granted. Do not make
those claims without verified filing records and counsel review.

1. Identify any existing application numbers, filing receipts, deadlines,
   correspondence, entity-status determinations, and prior public disclosures.
2. Create a private invention-disclosure package that separates technical
   mechanisms, figures, embodiments, and evidence from philosophy, valuation,
   allegations, and supporting materials.
3. Retain a registered patent attorney or patent agent to conduct a scoped
   claim review and prior-art search strategy.
4. Obtain a written recommendation on provisional, nonprovisional,
   continuation, division, international, and publication strategy as
   applicable.
5. Approve a filing budget, claim scope, inventor/assignee information, and
   evidence package before any submission.
6. Track filing receipts, deadlines, office actions, attorney invoices, and
   maintenance fees in a private legal register outside the public repository.

### Rights and value-recovery readiness

AXI is an active, revisable development effort. Before claiming, seeking, or
presenting any legal right, recovery, valuation, damages, licensing value, or
ownership conclusion, use the staged evidence and professional-review path in
`AXI_INTENT_AND_RIGHTS_READINESS.md`. The budget reserve supports scoped
professional review; it is not a determination that a right, recovery, or
valuation exists.

## Monthly review

At the beginning of each month, the founder reviews:

- Actual operating spend versus the approved cap.
- Domain and subscription renewals due within 90 days.
- Backup and restoration evidence.
- Patent and legal engagement status.
- Whether a proposed new service has earned its next spending gate.

Update this document only after a human approves a changed budget. Keep invoices,
account numbers, payment methods, credentials, legal advice, and client data in
private records, never in this repository.

## Accounting-balance ledger — Command Center

**Status:** Repository-local internal recordkeeping scaffold; no accounts or
entries recorded initially. **Recorded:** 2026-10-03.

The existing protected `/command-center` includes the **Accounting-balance
ledger**, distinct from the Copilot Accountability Ledger (task delivery).
Its canonical editable source is [`accounting-balances.json`](accounting-balances.json).
The read-only `GET /api/command-center/accounting-balances` validates that source
and returns balances and entries without contacting an engine, bank, provider,
or external accounting system. Other methods are rejected; there is no UI write
or approval action.

This is not a financial instrument, payment service, double-entry accounting
system, tax record, bank reconciliation, valuation, or authority to spend.
An approved balance is a sum of internally reviewed signed entries, not proof
of cash, ownership, obligations, or externally verified financial facts. The
budget ranges above are forecasts and must not be imported as actual balances.

### Structured record format (schema version 1)

| Record | Required fields / rule |
| --- | --- |
| Source | `schemaVersion: 1`, `scope: "internal-recordkeeping"`, `accounts`, `entries`; no extra fields |
| Internal account | Unique `id` (lowercase letters/digits/hyphens, max 64), nonempty `label` (max 80), uppercase three-letter `currency` label; no actual financial-account identifiers |
| Entry | Unique `id`, real calendar `date` (`YYYY-MM-DD`), existing `accountId`, signed `amount` string, nonempty `description` (max 240), `evidenceRef`, `status`, `approvalRef`; no extra fields |
| Amount | Exactly two decimal places, up to 18 integer digits, no exponent, grouping, leading zeros, or negative zero; positive adds, negative subtracts |
| Evidence | `evidenceRef` points to an existing repository `docs/.../*.md` record, optionally with a heading fragment; no external/private links, traversal, credentials, or personal data |
| Review | `status` is `draft` with `approvalRef: null`, or `approved` with an existing `docs/.../*.md` approval reference; validator checks presence, not authenticity or authority |
| Balances | Exact integer arithmetic in hundredths, separately per account/currency; approved entries alone determine `approvedBalance`; `draftChange` is shown separately and never included |

All currency labels use two-decimal **internal** units in this version; this is
not a currency precision registry or exchange-rate service. Do not use it for
units requiring another precision. No currencies or accounts are aggregated.
Account/entry ordering follows the source arrays, so the same source yields
byte-identical CLI reports without a clock or network dependency.

Synthetic draft example only (not an actual balance or canonical entry):

```json
{
  "schemaVersion": 1,
  "scope": "internal-recordkeeping",
  "accounts": [
    { "id": "example", "label": "Synthetic example only", "currency": "USD" }
  ],
  "entries": [
    {
      "id": "example-draft",
      "date": "2026-10-03",
      "accountId": "example",
      "amount": "0.10",
      "description": "Synthetic draft; not actual funds",
      "evidenceRef": "docs/PROJECT_BUDGET.md",
      "status": "draft",
      "approvalRef": null
    }
  ]
}
```

### Human review and corrections

1. Propose only public-safe internal records in a review PR; sensitive balances,
   invoices, customer/vendor information, account numbers, payment methods,
   credentials, and private financial evidence stay outside this repository.
   Admin-gated UI does **not** make committed data private.
2. Founder or authorized human checks the source, purpose, currency/precision,
   sign, date, and evidence. Record a public-safe approval decision under
   `docs/` before changing an entry to `approved` and linking `approvalRef`.
   A reference or passing check is not itself approval.
3. Review account additions, opening-balance entries, status changes, and all
   accounting/governance changes before merge. Never let a job approve or
   promote records. Existing repository auto-merge settings are not a substitute
   for this human review.
4. Preserve approved records and their currency labels. Propose a new signed
   correction entry referencing the original ID in its description and evidence
   record instead of silently rewriting history; Git history retains reviewed
   changes. Draft corrections remain excluded until approved.
5. Run the validator and tests documented in
   [`KEYSTONE_TIER_1_AUTOMATION_AND_INCOME_PLAN.md`](KEYSTONE_TIER_1_AUTOMATION_AND_INCOME_PLAN.md).
   Missing/malformed records fail closed; the UI shows unavailable rather than
   inventing zero balances.
