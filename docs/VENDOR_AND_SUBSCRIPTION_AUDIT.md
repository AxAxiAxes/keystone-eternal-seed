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

### Vigour Creative — founder-reported non-delivery (2026-09-12)

The founder reported paying Vigour Creative, a marketing agency, and not
receiving the agreed deliverable. This is a live vendor dispute, not a
technical bug — this repository has no view into the contract, invoice, or
payment records, and nothing here is a legal or financial conclusion. What
follows is only what was said and what could be independently, technically
observed from public URLs.

- **What the founder said:** paid Vigour Creative, and "they didn't deliver."
- **Prior repository record:** `docs/keystone/SACRED_RECORD_SESSION_08_28_2026.md`
  already documents a **$2,000 payment to Vigour Creative** for website
  design and marketing, notes the agency "was late," and that "the original
  website content may have been partially deleted when two trackers were
  installed."
- **Independently confirmed live (2026-09-12):** `http://axescontracting.com`
  currently returns `200` but serves a bare, default, unconfigured
  WordPress install — page title literally `My WordPress`, only default
  WordPress/Elementor boilerplate styling, no real AXES Contracting business
  content. This is consistent with, though does not by itself prove, the
  sacred record's note about lost/degraded original content. Separately,
  `https://axescontracting.com` (HTTPS) fails with a certificate trust
  error, matching the already-documented expired-certificate finding in
  `RAILWAY_DEPLOYMENT.md`.
- **Founder-shared link:** `https://testlink.vigourcreative.com/axes/`,
  carrying a Facebook click-tracking parameter (`fbclid`) — meaning this
  test/staging link had already been used in Facebook ad traffic despite
  being on a `testlink` (non-production) subdomain. The founder reported
  this page showed `AXIOM chat is temporarily unavailable` and an
  `axiom engine request failed` error. `apps/axiom-freedom/widget.js` (this
  repository's own embeddable chat bubble) loads an iframe from
  `https://xiiom.com/embed`, and `AXIOM chat is temporarily unavailable` is
  this repository's own `/api/axiom` error string — so whatever chat
  integration exists on that page is most likely calling this repository's
  already-diagnosed, already-tracked chat backend (see the decision
  register's P0 chat row), not a separate new failure. This repository's
  automated fetch of that URL was rate-limited (`429`) both times it was
  attempted, so its exact source could not be independently inspected.

**Suggested next steps (practical only, not legal or financial advice):**
preserve the contract, invoice/payment receipt, and any correspondence with
Vigour Creative in your own private records before anything changes further;
independently note today's date and the `axescontracting.com`/`testlink...`
findings above as a timestamped record of the delivered (or undelivered)
state; if you intend to pursue a refund, dispute, or credit-card chargeback,
that decision and any related correspondence should go through you directly
or a professional you choose — this repository cannot assess contract terms
or make that determination.

**Separately confirmed public presence:** a public Facebook Page,
"AXES Contracting Inc | Glendale CA"
(`https://www.facebook.com/p/AXES-Contracting-Inc-61575902077830/`), is live
with 22 likes and a business description ("home inspected, recovering from a
disaster, altering existing designs..."). This is independent of, and
currently more complete than, either the `axescontracting.com` WordPress
install or the Vigour Creative test link — it is a real, functioning public
presence for the business today, hosted entirely on Facebook rather than
this repository or Railway. It is listed here for founder reference only;
this repository does not manage, post to, or verify ownership of this page.

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
