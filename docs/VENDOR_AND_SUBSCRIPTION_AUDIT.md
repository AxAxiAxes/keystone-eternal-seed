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
AXES/GitHub/Railway direction. They describe tools tried, not the current
technical stack.

| Vendor/tool | What it is | What the record says | Still active? | Renewal/cost | Action needed |
| --- | --- | --- | --- | --- | --- |
| JetFormBuilder ("JetForms") | WordPress form-builder plugin | Founder reported a **lifetime license** purchase; told to check email for the license key | *(fill in)* | *(fill in — lifetime licenses usually have no recurring cost, but confirm)* | Search email for "JetFormBuilder" or "JetForms" receipt |
| WordPress (3 separate accounts/sites) | Website CMS | Founder reported **3 different WordPress accounts**, each needing separate email-based recovery | *(fill in ×3)* | *(fill in)* | Identify which 3 emails were used; check each for WordPress.com or hosting-account confirmations |
| Microsoft accounts (3 separate) | Cloud/productivity accounts (not necessarily 365 business mail — unclear from the record) | Founder reported **3 different Microsoft accounts**; unclear which email addresses | *(fill in ×3)* | *(fill in)* | Identify the 3 email addresses; this is separate from the Microsoft 365 business-mail plan in `EMAIL_MIGRATION_PLAN.md` |
| GoDaddy | Former domain registrar | Founder switched away to SiteGround; GoDaddy account access/recovery was called out as unresolved | *(fill in)* | *(fill in)* | Check whether any domains or paid add-ons remain on the old GoDaddy account before assuming it's fully closed out |

### Likely matches for names mentioned but not found verbatim

Two names raised were not found exactly as written anywhere in the repository.
The closest documented terms are below — **please confirm or correct these**
rather than treating them as verified:

| You said | Closest match found in records | My best-guess interpretation | Confidence |
| --- | --- | --- | --- |
| "emancipator" | `Emancipator` is listed once, in `docs/keystone/THE_PERFECT_HARMONICS_ATHANOR_VISION.md`, in a list of website-building tools alongside WordPress, JetFormBuilder, and SiteGround | Possibly a mistyped/misheard reference to **Elementor**, the WordPress page-builder plugin that JetFormBuilder is commonly used alongside | Low — please confirm which product you actually mean |
| "croc" | Not found in repository records | JetFormBuilder's publisher is a company called **Crocoblock**, which is known for lifetime-deal pricing on its "Jet" plugin suite (JetFormBuilder, JetEngine, JetElements, etc.) | Low — this is my inference from general product knowledge, not a repository record; please confirm |
| "lifetime member" | Matches the "Lifetime Subscriptions You Purchased" heading used in the founder-provided transcript | Refers to the JetFormBuilder/Crocoblock-style lifetime-license purchases generally, not one single named product | Medium |

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
   receipts containing: "JetForm", "Elementor", "Crocoblock", "WordPress",
   "GoDaddy", "Microsoft 365", "SiteGround".
2. For each hit, note in your private inventory: is it still billing you,
   and is there anything (a license, a domain, an export) worth recovering
   before an account lapses or is deleted.
3. If a lifetime-license product turns out to still be usable, it may reduce
   near-term tooling costs versus buying new — but per `PROJECT_BUDGET.md`,
   any new spending decision still needs a written quote and your explicit
   approval; nothing here authorizes a purchase either way.
4. If you find other vendor names you can't place, tell me the name and I
   will search the repository's records for it the same way.
