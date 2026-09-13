# AXI business metrics foundation

**Status:** Private, bounded submitted-metrics foundation
**Recorded:** 2026-09-11

## Purpose and boundary

AXI may retain explicitly supplied, non-sensitive revenue and expense metrics
to give the founder a deterministic record of submitted operating metrics.
Every response is labeled: **Record of submitted metrics only; not a financial
statement, accounting treatment, tax calculation, cash balance, valuation,
profitability guarantee, or legal or financial advice.**

This service has no client, vendor, account, payment, invoice, credential,
personal-data, tax, or external-financial-integration fields. It cannot spend,
access an account, send a message, make a payment, deploy, or publish.
Submitted entries do not establish accounting treatment, financial position,
cash availability, tax treatment, profitability, legal compliance, or value.

## Private journal contract

The private `business-metrics.jsonl` journal is append-only and hash-linked.
Each immutable `axi-private-business-metrics-v1` version-1 entry contains:

- UUID `id`, sequential `sequence`, ISO-8601 `recordedAt`, `previousHash`, and
  SHA-256 `hash`;
- `period` from `2000-01` through `2100-12`;
- `kind`: `revenue` or `expense`;
- a restrictive category: revenue is `contracting-services`, `product-sales`,
  `subscriptions`, or `other-approved-revenue`; expense is `materials`,
  `labor`, `software`, `operations`, `marketing`, `professional-services`, or
  `other-approved-expense`;
- positive safe-integer `amountCents`;
- unique, non-sensitive lowercase-kebab-case `sourceRecord`; and
- fixed `operator-approved` review status.

No other submission fields are accepted. The service rejects duplicate record
IDs or source records, invalid sequences, dates, categories, amounts,
timestamps, hashes, review states, malformed lines, and any unsupported or
unsafe field. Retained invalid history is preserved as
`business-metrics-invalid`, surfaces monitoring attention, and blocks manual
and scheduled automation until reviewed.

## Access and task flow

Private engine read endpoints are `GET /system/business-metrics`,
`GET /system/business-metrics/entries?limit=20`, and
`GET /system/business-metrics/summary`. There is deliberately no direct
engine write endpoint.

Creation is only through a founder-assigned `business.metric` task executed by
the Project Memory Manager. The automation service independently requires that
exact assignment and `approvalRequired: true`; founder approval through the
protected operational process moves the task to executable state. The role has
no authority to assign, remove, approve, suspend, or reactivate itself or any
other role. The authenticated portal proxies only the read endpoints at
`/api/automation/business-metrics`,
`/api/automation/business-metrics/entries`, and
`/api/automation/business-metrics/summary`. The protected Automation Console
queues the required approval task.

The console accepts only kind, category, period, dollar amount, and
non-sensitive source record for metric input. It safely converts a positive
two-decimal dollar amount to a positive safe-integer cent value before it
creates the task, and it warns operators not to enter account, invoice,
customer/vendor, payment, tax, financial-account, credential, or personal
data.

## Deterministic read model and portability

Summary totals derive only from stored positive cent values: total recorded
revenue, total recorded expense, net recorded operating result, and
period-sorted revenue/expense/net totals. They are a submitted-metrics record,
not a financial statement or advice.

`business-metrics.jsonl` is in private monitoring snapshots, runtime
readiness, checkpoint manifests, recovery bundles, and isolated recovery
restoration. AXES OS remains a portability/checkpoint foundation, not a live
standalone operating system.
