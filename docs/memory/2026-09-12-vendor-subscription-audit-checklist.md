# Vendor and subscription audit checklist created

**Date:** 2026-09-12
**Context:** The founder asked to "check up on all our configuration and
vendors," recalling purchases including JetForms, a "lifetime member" deal,
and "emancipator croc," with others not recalled.

## What was found

No repository process has ever had, or can have, access to email, billing,
or vendor account dashboards, so no *current* subscription status can be
confirmed from here. What exists instead is founder-provided historical
narrative already preserved in `docs/keystone/SACRED_RECORD_SESSION_08_28_2026.md`,
`docs/keystone/sacred record 8.28.26 full`, and
`docs/keystone/THE_PERFECT_HARMONICS_ATHANOR_VISION.md`, describing an
earlier WordPress-based attempt before the current AXES/GitHub/Railway
direction:

- **JetFormBuilder ("JetForms")** — a lifetime-license WordPress form-builder
  purchase, explicitly named in the transcript.
- **WordPress (3 separate accounts)** and **Microsoft accounts (3 separate)**
  — named but without specific product tier or email address recorded.
- **GoDaddy** — the former domain registrar, since migrated to SiteGround
  per `docs/DOMAIN_PORTFOLIO.md`.
- **"Emancipator"** — found verbatim once, in a list of website-building
  tools alongside WordPress/JetFormBuilder/SiteGround. No match for "croc"
  was found anywhere in repository records.

Two names from the founder's message did not match anything recorded
verbatim: "emancipator" and "croc." The closest documented term is
`Emancipator` (above); a plausible but **unconfirmed** interpretation is that
these refer to Elementor (a WordPress page-builder commonly paired with
JetFormBuilder) and Crocoblock (JetFormBuilder's publisher, known for
lifetime-deal pricing) — general product knowledge, not something found in
this repository, so it is flagged for the founder to confirm rather than
adopted as fact.

## What was created

`docs/VENDOR_AND_SUBSCRIPTION_AUDIT.md` — a checklist (not a verified audit)
listing every vendor/tool name found in repository records, distinguishing
the pre-AXES WordPress-era tools from the current, governance-approved
infrastructure (SiteGround, Railway, Microsoft 365) already tracked in
`docs/DOMAIN_PORTFOLIO.md` and `docs/EMAIL_MIGRATION_PLAN.md`. It repeats the
existing `docs/PROJECT_BUDGET.md` instruction to keep the real registrar/
license/account details in a private inventory outside this repository, and
states plainly what cannot be done from repository access (no login, no
billing visibility, no cancel/renew authority).

## Boundary preserved

No account access was attempted or implied. No new spending was
recommended or authorized; any lifetime-license reuse or new purchase still
requires the founder's own written-quote-and-approval process already in
`docs/PROJECT_BUDGET.md`.

## Update: founder-provided reconstruction (same day)

The founder pasted a response from a separate AI conversation offering a more
specific reconstruction of the full pre-AXES stack, including named products
for both previously-unmatched terms:

- **"croc"** → Crocoblock, the company behind the "Jet" WordPress plugin
  family (JetEngine, JetSmartFilters, JetBlocks, JetElements, JetThemeCore,
  JetPopup, JetMenu, JetFormBuilder), reportedly purchased as a bundle
  ("Dynamic Suite").
- **"emancipator"** → guessed as JetEngine, reasoned from JetEngine
  "emancipating" WordPress via custom post types/fields — this specific
  product alias is that other conversation's inference, not a confirmed
  fact, and is labeled as such.
- **Elementor Pro** — newly named as the core page-builder the Jet plugins
  were used alongside.

`docs/VENDOR_AND_SUBSCRIPTION_AUDIT.md` was updated to fold in this more
specific list while keeping the same caution: this is still an
externally-reconstructed guess, not verified against the founder's actual
email receipts or billing records, and the document continues to label it
as unconfirmed pending the founder's own check.

## Related records

- `docs/VENDOR_AND_SUBSCRIPTION_AUDIT.md`
- `docs/PROJECT_BUDGET.md`
- `docs/DOMAIN_PORTFOLIO.md`
- `docs/EMAIL_MIGRATION_PLAN.md`
- `docs/keystone/THE_PERFECT_HARMONICS_ATHANOR_VISION.md`
