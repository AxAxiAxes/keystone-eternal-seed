# AXES vendor and subscription audit checklist

**Status:** Founder action required — tracking scaffold, not a verified audit
**Recorded:** 2026-09-12
**Purpose:** Give the founder one place to check every vendor, tool, and
subscription referenced anywhere in the project's records, so nothing paid
for is lost or renewed by accident. This document does not, and cannot,
confirm which of these are still active — no repository process has email,
billing, or account access. Only the founder can check that.

## How to use this

For each row below, check your email receipts and the vendor's own login
page, then fill in the last three columns yourself (in a private copy —
see "Where to keep the real details" below). Do not paste account numbers,
license keys, passwords, or payment details into this repository.

## Vendors and tools referenced in project records

### Pre-AXES website-building stack (referenced in founder-provided history)

These came from `docs/keystone/SACRED_RECORD_SESSION_08_28_2026.md`,
`docs/keystone/sacred record 8.28.26 full`, and
`docs/keystone/THE_PERFECT_HARMONICS_ATHANOR_VISION.md` — founder-provided
transcripts of an earlier attempt to build on WordPress, before the current
AXES/GitHub/Railway direction, refined by a founder-provided reconstruction
from a separate AI conversation (2026-09-12) that named specific products for
two previously-unmatched terms. **None of this list has been checked against
actual billing/account records** — treat every row as "go verify," not
"confirmed."

| Vendor/tool | What it is | What the record says | Still active? | Renewal/cost | Action needed |
| --- | --- | --- | --- | --- | --- |
| JetFormBuilder ("JetForms") | WordPress form-builder plugin (dynamic forms, workflows, conditional logic) | Founder reported a **lifetime license** purchase; one of the largest purchases in the stack | *(fill in)* | *(fill in — lifetime licenses usually have no recurring cost, but confirm)* | Search email for "JetFormBuilder" or "JetForms" receipt |
| Crocoblock Dynamic Suite ("croc") | The company/bundle behind the "Jet" plugin family | Matches the founder's "croc" recollection; reported as a bundle purchase covering JetEngine, JetSmartFilters, JetBlocks, JetElements, JetThemeCore, JetPopup, JetMenu, and JetFormBuilder | *(fill in)* | *(fill in — Crocoblock sells both subscription and lifetime tiers; confirm which was bought)* | Search email for "Crocoblock" receipt/invoice |
| JetEngine ("Emancipator"?) | Crocoblock plugin adding custom post types, custom fields, and dynamic content to WordPress | Reconstruction suggests this is what was recalled as "Emancipator" (unconfirmed folk association, not a verified product name) | *(fill in)* | *(fill in — included in Dynamic Suite if that was purchased)* | Confirm with founder whether "Emancipator" means this, a separate product, or something not yet identified |
| Elementor Pro | WordPress page-builder plugin (drag-and-drop UI, theme building, templates) | Reported as the core UI tool the Jet plugins were built on top of | *(fill in)* | *(fill in)* | Search email for "Elementor" receipt |
| WordPress (3 separate accounts/sites) | Website CMS | Founder reported **3 different WordPress accounts**, each needing separate email-based recovery | *(fill in ×3)* | *(fill in)* | Identify which 3 emails were used; check each for WordPress.com or hosting-account confirmations |
| Microsoft accounts (3 separate) | Cloud/productivity accounts (not necessarily 365 business mail — unclear from the record) | Founder reported **3 different Microsoft accounts**; unclear which email addresses | *(fill in ×3)* | *(fill in)* | Identify the 3 email addresses; this is separate from the Microsoft 365 business-mail plan in `EMAIL_MIGRATION_PLAN.md` |
| GoDaddy | Former domain registrar | Founder switched away to SiteGround; GoDaddy account access/recovery was called out as unresolved | *(fill in)* | *(fill in)* | Check whether any domains or paid add-ons remain on the old GoDaddy account before assuming it's fully closed out |

### Reconstructed name matches — still unverified

A founder-provided reconstruction from a separate AI conversation offered
specific guesses for the two names that weren't found verbatim in repository
records. These are plausible and more specific than the first pass, but they
are still **that other conversation's inference from general product
knowledge, not a checked fact** — confirm against your own receipts before
treating them as settled:

| You said | Reconstructed as | Confidence |
| --- | --- | --- |
| "croc" | Crocoblock (the company behind the "Jet" WordPress plugin suite) | Medium — a real company name that fits the context well |
| "emancipator" | JetEngine (reasoned from "emancipates WordPress" via custom fields/post types) | Low — a plausible-sounding explanation, not a documented product alias; could also be a different product entirely |

### Current, governance-approved infrastructure (for contrast — not "extra" spend to chase down)

These are the vendors the **current** AXES technical plan actually depends on,
already documented with their own status in existing planning docs. Listed
here only so the pre-AXES tools above aren't confused with what's live today.

| Vendor | Role | Current documented status | Source |
| --- | --- | --- | --- |
| SiteGround | Domain registrar for all 11+ AXES domains; still hosts `info@axescontracting.com` mail | Active registrar; DNS/mail migration pending | `docs/DOMAIN_PORTFOLIO.md`, `docs/EMAIL_MIGRATION_PLAN.md` |
| Railway | Application hosting for `xiiom.com` (public portal + private engine) | Active and serving `xiiom.com` live; `axescontracting.com` not yet connected | `docs/RAILWAY_DEPLOYMENT.md`, `docs/AXES_TIER_1_DECISION_REGISTER.md` |
| Microsoft 365 | Target destination for `info@axescontracting.com` business mail | Planned migration target; not confirmed complete | `docs/EMAIL_MIGRATION_PLAN.md` |

## What I cannot do

- Log into any vendor account, email inbox, or billing portal.
- Confirm whether any subscription above is still active, cancelled, or
  past due.
- See renewal dates, payment methods, or license keys.
- Cancel, renew, downgrade, or change any of these accounts.

These all require the founder (or someone the founder explicitly authorizes)
to act directly with each vendor.

## Where to keep the real details

Per `docs/PROJECT_BUDGET.md`'s existing instruction: record registrar,
renewal date, registrant account, DNS provider, and owner in a **private**
operational inventory outside this repository. Do not commit account numbers,
license keys, passwords, or payment details here. This file is only a
checklist of names to go verify — not a record of the verified answers.

## Suggested next steps

1. Search your email (all email addresses you've used, not just one) for
   receipts containing: "JetForm", "JetEngine", "Crocoblock", "Elementor",
   "WordPress", "GoDaddy", "Microsoft 365", "SiteGround".
2. For each hit, note in your private inventory: is it still billing you,
   and is there anything (a license, a domain, an export) worth recovering
   before an account lapses or is deleted.
3. If a lifetime-license product turns out to still be usable, it may reduce
   near-term tooling costs versus buying new — but per `PROJECT_BUDGET.md`,
   any new spending decision still needs a written quote and your explicit
   approval; nothing here authorizes a purchase either way.
4. If you find other vendor names you can't place, tell me the name and I
   will search the repository's records for it the same way.
