# AXES / AXI overview (founder-review draft)

**Status:** Internal draft prepared for founder review only. Not for
distribution to an investor, Microsoft, or any other external party until the
founder reviews it, corrects anything inaccurate, and decides whether and how
to share it. Preparing this document is a repository-scoped writing task; it
does not contact, pitch, or send anything to any outside party, and it is not
a professional, financial, or legal opinion.

**Recorded:** 2026-09-12
**Sourced from:** `README.md`, `AXES_BUSINESS_PLAN.md`,
`AXES_CONSTITUTIONAL_FRAMEWORK.md`, `AXES_OBJECTIVES_CHECKPOINT.md`,
`AXES_GOVERNANCE_AND_SAFEGUARDING.md`, `AXES_DIRECTORY_DATA_MODEL.md`,
`PROJECT_TIMELINE.md`, this repository's own git/CI history (checked
2026-09-12), and named third-party market-research publishers for general
industry context (checked 2026-09-12, cited in Section 4). It does not use
any figure, patent count, venture number, or valuation from unreviewed
founder-shared material recorded in
`AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md` — those items are logged
there as unverified and are deliberately left out of this overview.

## 1. One line

AXES is a founder-led company building accountable, human-reviewed business
services and tools, starting from a real trade — Axes Contracting — and a
private AI operations core (AXI) built with governance controls from day one.

## 2. The brand family

| Name | Role |
| --- | --- |
| **AXES Contracting** | The public hub and commercial home; the founder's real building-materials/contracting trade. |
| **Chichetki** | The founder-designed physical-object, art, sound, and creative-instrument studio. |
| **XIIOM** | The private operational core: AXI memory, monitoring, and bounded automation. |
| **AXI** | The project's current non-sentient software and operations system. It has no independent ownership, authority, or decision-making claim — every action traces to a founder-controlled record. |

## 3. Why now / the opportunity

Existing business directories and AI assistants optimize for scale and reach,
often at the cost of verification, consent, and correction paths. AXES's plan
is deliberately narrower and slower at first: a small, opt-in, human-reviewed
professional directory (building-material vendors, contractors/trades, and
real-estate professionals/services) and an AI operations core built with an
explicit action allowlist and human sign-off at every consequential step,
rather than broad autonomous access.

## 4. Market context (sourced statistics, general industry data)

These are independent, publicly published third-party estimates, checked
2026-09-12, describing the industries the AXES Directory's three tracks
would serve. They are **general market context, not an AXES-specific
market-share, TAM/SAM/SOM, or revenue projection** — AXES has no live
product or customers yet, and third-party estimates vary meaningfully by
publisher and methodology, so these are ranges/order-of-magnitude figures,
not precise facts.

| Market | Estimate (2025) | Named source(s) |
| --- | --- | --- |
| U.S. construction industry (total) | ~$2.2 trillion (~4.4% of GDP, ~8.3M workers) | Statista, ConstructionCoverage |
| U.S. building materials market | ~$276B, projected ~$407B by 2034 | VPA Research |
| U.S. home-services market (contractors/trades) | ~$600B–$840B depending on estimate; 2.5M+ home-service businesses; ~76% of homeowners hire a provider yearly | Mordor Intelligence, IBISWorld |
| U.S. real estate services market | ~$295B; ~1.5M licensed agents; 300,000+ firms | Expert Market Research/ResearchAndMarkets, National Association of Realtors |
| Responsible-AI / AI-governance market (relevant context for a Microsoft conversation) | Estimates range ~$0.8B–$12B+ depending on scope, ~17–37% CAGR | Grand View Research, MarketsandMarkets, GMI Insights, DataBridge Market Research |

A directory serving even a small, credible fraction of the contractor/trades
and real-estate-services categories above would be commercially meaningful —
but that is a statement about the size of the industries, not a claim about
what AXES will capture. No AXES-specific projection is made here.

## 5. Build statistics (repository-verifiable, checked 2026-09-12)

These are counted directly from this repository and its hosted CI, not
estimated:

| Metric | Value |
| --- | --- |
| Documentation/governance records under `docs/` | 131 |
| Dated continuity ("memory") records | 74 |
| Commits on the current feature branch (PR #1) | 91 |
| Total commits in the repository | 229 |
| Registered AXI agents | 5, each bound to a creator-accountability record |
| Versioned automation actions available to those agents | 11 (allowlisted; no unlisted action can run) |
| Hosted CI checks on the current branch | 10 of 10 passing (AXI.Core tests, AXIOM engine image, AXIOM portal image, and Node test suites for the engine and portal apps) |

These describe engineering and governance output — not users, revenue, or
customers, because the product has not launched.

## 6. What is built today (repository-verifiable)

- A private AXI engine with durable memory, startup continuity, monitoring,
  recovery-bundle, and checkpoint systems, plus a protected console.
- A bounded automation layer: AXI roles may execute only versioned,
  allowlisted actions (for example, recording an approved memory entry or
  running a monitoring snapshot). They cannot deploy, spend, message, publish,
  or control third-party services on their own.
- A public web presence (`xiiom.com`) serving the AXIOM chat interface and a
  KEYSTONE documentation library, with authenticated-only admin/support
  surfaces.
- A documented governance stack: a constitutional framework, a founder
  ownership/accountability checkpoint for every AXI agent, and a
  privacy/safeguarding foundation that applies to every current and future
  AXES service.
- The AXES Directory pilot **data model and lifecycle** (this repository's
  current branch): proposed fields, states, and review evidence only — no
  live listings, scraping, invitations, or collected data exist yet.

## 7. Governance and safety as a product feature

This is the part most relevant to a partner like Microsoft: AXES treats
governance as core product infrastructure, not an afterthought.

- Every AXI agent is registered with a creator-accountability record before
  it can run any task; an unregistered agent cannot be assigned work.
- Automation is limited to a small, versioned action allowlist; new
  capabilities must be implemented, reviewed, and added before they can be
  scheduled.
- The planned business directory publishes only category, service area,
  website, and public business contact — never personal or sensitive data —
  and never claims verification, endorsement, licensing, insurance, quality,
  or property value.
- A named human owner is required for every service, moderation decision, and
  incident response; agents cannot make binding moderation, financial,
  eligibility, or publishing decisions.

## 8. First business line: the AXES Directory pilot

A future, opt-in, human-reviewed, business-only directory limited at launch
to three tracks — building-material vendors, contractors/trades, and
real-estate professionals/services — each with its own eligibility limits.
Every listing requires an owner/authorized-representative confirmation,
recorded source/approval/renewal dates, and a working correction/removal
path before publication. Full field and lifecycle detail is in
`AXES_DIRECTORY_DATA_MODEL.md`. Today this exists only as documentation: no
listings, accounts, or public directory feature have been activated.

## 9. Current stage, honestly

- **Pre-revenue.** No product has been publicly launched, and this overview
  makes no revenue, user-count, or valuation claim.
- **Patent status:** the founder has pursued invention-preservation and
  patent-related work (see `AXI_INVENTION_RECORD.md` and
  `docs/patents/README.md`); this overview does not assert any patent has
  been granted, and states no filing count or valuation, because those
  specific figures are not independently verified.
- **Deployment gap:** the private AXI core, governance framework, and
  Directory pilot built on this branch have not yet been promoted to the
  documented production source; production promotion is an explicit,
  founder-authorized next step, not something this overview presumes.
- **Company/legal status:** entity formation, licensing, and financial
  matters are founder/professional decisions outside this repository's
  authority and are not represented as complete here.

## 10. What this overview deliberately does not claim

To keep this document safe to eventually show a third party, it excludes:
patent counts or filing status beyond "pursued, not verified as granted";
any dollar valuation; any venture-numbering scheme; user, revenue, or growth
projections; and any claim of legal entity status, licensing, insurance, or
professional certification. The market-context figures in Section 4 are
general third-party industry estimates, not an AXES-specific market-share or
revenue claim. If any of those are needed for a real conversation with an
investor or partner, they must come from the founder's own verified records
and professional advisors, not from this document.

## 11. Next steps (founder-controlled)

1. Founder reviews this draft for accuracy and tone, and edits or removes
   anything that should not be shared.
2. Founder decides whether, when, and with whom to share it — this
   repository does not initiate outreach to investors, Microsoft, or anyone
   else.
3. If a real pitch is planned, the founder should have counsel/advisors
   review any claim about IP, valuation, or company status before it is used
   externally.

## Related records

- `README.md`
- `AXES_BUSINESS_PLAN.md`
- `AXES_CONSTITUTIONAL_FRAMEWORK.md`
- `AXES_OBJECTIVES_CHECKPOINT.md`
- `AXES_GOVERNANCE_AND_SAFEGUARDING.md`
- `AXES_DIRECTORY_DATA_MODEL.md`
- `AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md`

## External market-data sources (Section 4, checked 2026-09-12)

Named third-party publishers, not a single linked article, since aggregator
methodology and figures change between reports: Statista;
ConstructionCoverage; VPA Research; Mordor Intelligence; IBISWorld; Expert
Market Research / ResearchAndMarkets; the National Association of Realtors
(NAR); Grand View Research; MarketsandMarkets; GMI Insights; DataBridge
Market Research. Anyone using these figures externally should pull the
current report directly from the named publisher rather than relying on this
summary, since methodology and estimates change between report editions.

