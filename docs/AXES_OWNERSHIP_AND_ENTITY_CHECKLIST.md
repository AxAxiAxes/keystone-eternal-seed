# AXES/AXIOM ownership checklist: platform, brand, and AI

**Status:** Action checklist for the founder — organizes existing, scattered
ownership findings into one actionable list. This document does not itself
form a company, file a trademark, register a copyright, or change any
account. Every item below requires a founder action outside this repository
(and several require paid professional help); repository access alone
cannot complete any of them.
**Recorded:** 2026-09-19
**Trigger:** Founder asked "how do we obtain ownership of our own ai and
platform?"

## Why this exists

The repository already has scattered, partial answers to this question
across several documents (`AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`,
`AXI_ORIGIN_OWNERSHIP_EVIDENCE_INVENTORY.md`,
`docs/memory/2026-09-11-agent-deployment-gap-and-ip-company-status.md`,
`docs/AXES_CONTRACTING_AI_AVATAR_PRODUCTION_READINESS.md`). This document
pulls them into one ordered checklist so nothing is missed, and separates
what's a paperwork problem (closeable now) from what's an infrastructure
decision (requires budget/hardware).

## Part A — Platform and brand ownership (paperwork, closeable now)

| # | Item | Current status | Action needed |
| --- | --- | --- | --- |
| A1 | Legal business entity (LLC/Corp) for AXES Contracting | **Updated 2026-09-19 — likely already resolved, pending official confirmation.** Public-record aggregator research found "Axes Contracting Inc" as an active CA General Corporation, filed 2013, entity #3544685, with the founder (Axel Urartu) as sole officer/registered agent. Its separate CSLB contractor license (#995577) shows a bond-lapse suspension, not a corporate-status problem. See `AXES_CONTRACTING_INC_ENTITY_VERIFICATION.md` for full sourcing. | No new formation needed if this holds up. Founder should verify directly at CA SOS bizfile + CSLB (automated fetches were blocked at research time), then renew the lapsed $25,000 CSLB bond to reinstate the contractor license. |
| A2 | IP assignment into the entity | Not started — cannot start until A1 is resolved. | Once the entity exists, have every contributor (including any hired help) sign an IP-assignment / work-for-hire agreement so code, names, and content are owned by the company, not scattered among individuals. |
| A3 | Copyright registration of the codebase | Code is automatically copyrighted at creation, but registration with the US Copyright Office is what makes it enforceable (statutory damages, standing to sue) | File a copyright registration for the AXIOM/AXES codebase once authorship is clean under A2. |
| A4 | Trademark registration | Not filed. Names in active public use: AXIOM, AXES (Contracting), KEYSTONE, URNUR (product name only, no financial claim). | File USPTO trademark applications for names/logos actually in commercial use today (AXIOM, AXES) before someone else claims them; hold off on names not yet in real use. |
| A5 | Patent status | Provisional application `64,078,819` referenced in `docs/keystone/PATENT_APPLICATION_64_078_819.md`; per `docs/memory/2026-09-11-keystone-patent-direction-review.md` no patent/IP counsel has been retained and filing/deadline status is still unconfirmed from official records. | Retain patent counsel to confirm the provisional's real filing status, deadline, and next steps (a provisional expires 12 months from filing if not converted). |
| A6 | Account/infrastructure control audit | Unverifiable from inside the repository. | Confirm personally that GitHub org billing, Railway account, domain registrars, and the OpenAI API billing account are each owned by you or the entity — not a shared/personal account that could be revoked by someone else. |
| A7 | Domain portfolio consolidation | `docs/DOMAIN_PORTFOLIO.md` already tracks ~31 domains. | Make sure registrar account (SiteGround/other) ownership matches A6's answer — same principle, applied to domains specifically. |

## Part B — AI model ownership (infrastructure decision, not paperwork)

Owning "your own AI" in the technical sense is a different problem from
owning the platform around it. Today, AXIOM's actual language model is
OpenAI's GPT model accessed via API — you own the code that calls it and
the memory/identity system around it (already built, see
`chat-service.js`), but not the model itself. That's a vendor relationship,
not ownership, no matter how the entity/trademark items above resolve.

| # | Path | What you'd actually own | Cost/requirement |
| --- | --- | --- | --- |
| B1 | Keep using OpenAI's API (status quo) | The wrapper code, prompts, memory store — not the model | Ongoing per-token API cost, no hardware needed |
| B2 | Self-host an open-weight model (e.g. Llama/Mistral-class) | Your deployment, and any fine-tuning you do on it. The base architecture remains under its own open license — nobody "owns" it outright, the same way nobody owns Linux, only their own build of it. | GPU hardware or rental — tiers already scoped in `AXES_CONTRACTING_AI_AVATAR_PRODUCTION_READINESS.md` (~$1,700 single-GPU/24GB up to $5,000-$30,000+ multi-GPU for larger models or video generation) |
| B3 | Fine-tune a model on your own data (on top of B1 or B2) | The fine-tuned weight deltas are yours regardless of which base model you start from | Requires curated training data plus either API fine-tuning cost (if using OpenAI) or your own compute (if self-hosting) |

**Recommendation implicit in the existing readiness docs:** B1 (current
setup) remains the lowest-cost, lowest-maintenance path while the outage
(#0) and other higher-priority queue items are unresolved. B2/B3 only make
sense once there's a specific reason to need model ownership (cost at scale,
data privacy, or wanting to remove OpenAI dependency entirely) — this is a
founder call, not an engineering default.

**For concrete hardware specs, cost tiers, software stack, and a
recommended path**, see `GUIDE_BUILDING_YOUR_OWN_AI.md` — a full expansion
of this section.

## What this document does not do

It does not file anything, register anything, or move money. It does not
confirm entity status, trademark availability, or patent deadlines — those
require your own contact with the relevant state office, USPTO, US
Copyright Office, and retained counsel. It exists so every open ownership
question the founder has asked about is tracked in one place instead of
scattered across a dozen prior documents.

## Related records

- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`
- `docs/AXI_ORIGIN_OWNERSHIP_EVIDENCE_INVENTORY.md`
- `docs/memory/2026-09-11-agent-deployment-gap-and-ip-company-status.md`
- `docs/memory/2026-09-11-keystone-patent-direction-review.md`
- `docs/keystone/PATENT_APPLICATION_64_078_819.md`
- `docs/AXES_CONTRACTING_AI_AVATAR_PRODUCTION_READINESS.md`
- `docs/GUIDE_BUILDING_YOUR_OWN_AI.md`
- `docs/AXES_BUSINESS_PLAN.md`
- `docs/DOMAIN_PORTFOLIO.md`
- `docs/keystone/FOUNDER_ACTION_QUEUE.md`
