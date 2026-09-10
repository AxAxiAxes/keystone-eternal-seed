# URNUR financial readiness and legal-review gate

**Status:** Blocking pre-launch workstream  
**Recorded:** 2026-09-09  
**Scope:** Future market data, charts, paper trading, exchange connectivity,
automated trading, crypto assets, custody, payments, and digital-asset plans.

## Immediate decision

Contact qualified financial-services and digital-asset counsel **now**, before
resuming any crypto registration or beginning public-facing financial product
work. Counsel should be licensed or able to advise in the primary launch
jurisdiction, which is still to be identified.

This is planning guidance, not legal, tax, investment, or regulatory advice.

## Why counsel is needed now

URNUR's proposed scope may include market data, charts, automated trading,
crypto assets, and financial-market functionality. The regulatory classification
can change based on jurisdiction and exact product behavior. Building the wrong
architecture first can create rework, cost, and unacceptable compliance risk.

## Legal-review gates

| Gate | Attorney required | Permitted work before the gate |
| --- | --- | --- |
| Product discovery | Yes, contact and briefing | Internal concept mapping; no customer accounts, live financial data, recommendations, or transactions |
| Read-only educational prototype | Review before public launch | Non-personalized educational content and mock/synthetic charts; do not imply investment advice |
| Market-data integration | Review before contracting or publishing | Evaluate providers and document requirements; do not purchase, redistribute, or display data without a license review |
| Paper trading or portfolio simulation | Review before public pilot | Internal prototypes using synthetic assets and synthetic data only |
| Exchange connectivity or trade automation | Written legal and security approval required before implementation | Architecture diagrams and threat modeling only; no credentials, API keys, account linking, or orders |
| Real assets, custody, transfers, payments, or token issuance | Written legal, compliance, security, and operating approval required before implementation or marketing | None beyond high-level product research |

## Attorney briefing packet

Prepare these items before the first consultation:

1. Plain-language product description, including every planned user action.
2. Intended launch country and state or province, target users, and any
   cross-border availability.
3. A feature matrix distinguishing educational charts, simulated portfolios,
   market-data display, alerts, recommendations, exchange connectivity,
   automated orders, custody, transfers, payments, and token issuance.
4. Proposed business model, fee model, partners, and revenue sources.
5. Proposed user data, identity verification, age restrictions, records,
   security, fraud controls, complaints, and customer-support process.
6. Current architecture: private XIIOM automation, planned AXES database, data
   storage locations, access controls, audit records, and human approvals.
7. Proposed public names and marketing language, including the use of
   "currency," "market," "autotrade," and any claims about value or returns.
8. Questions about entity formation, registrations, licenses, consumer
   protection, securities, commodities, money-transmission, payments, tax,
   sanctions, anti-money-laundering, privacy, data licensing, and insurance.

Do not bring passwords, private keys, seed phrases, recovery codes, or customer
financial information to project documentation or an AI system.

## Engineering boundary until legal approval

The repository must not add:

- Exchange account linking or storage of exchange API keys.
- Trade execution, order routing, portfolio recommendations, price alerts based
  on user holdings, custody, wallet generation, transfers, deposits, payments,
  or token issuance.
- Claims that URNUR is a currency, investment, financial advisor, exchange,
  broker, or regulated service.
- Personal financial profiles, identity-verification documents, or financial
  account information.

The first possible engineering milestone, after counsel defines the permitted
scope, is a read-only, clearly labeled educational prototype using licensed or
synthetic data and no personalized financial output.

## Completion evidence

This workstream is complete only when the project has:

- Identified a primary launch jurisdiction.
- Retained appropriate counsel or received documented qualified advice.
- Approved a written product classification and permitted first-release scope.
- Documented data licensing, privacy, security, user terms, and operational
  requirements.
- Converted the result into scoped engineering requirements and testable
  approval gates.
