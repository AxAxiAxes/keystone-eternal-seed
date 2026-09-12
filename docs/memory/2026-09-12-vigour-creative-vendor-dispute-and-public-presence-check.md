# Vigour Creative vendor dispute and AXES Contracting public-presence check

**Recorded:** 2026-09-12
**Type:** Founder-reported business issue, investigated with public/live technical checks only
**Status:** Documented as a founder-decision item; no repository or Railway change made or needed

## What was reported

The founder shared a link,
`https://testlink.vigourcreative.com/axes/?fbclid=...`, reporting it showed
"AXIOM chat is temporarily unavailable" and "axiom engine request failed,"
and clarified this is "the second website for AXES Contracting Inc." A
follow-up message stated plainly: "i paid them but they didnt deliver,"
referring to Vigour Creative, a marketing agency.

## What was already on record

`docs/keystone/SACRED_RECORD_SESSION_08_28_2026.md` (a founder-provided
transcript from an earlier session) already documented: a **$2,000 payment
to Vigour Creative** for website design and marketing, that the agency "was
late," that Axi (the AI system) offered to build something better once the
founder saw the existing site and proposed design, and that "the original
website content may have been partially deleted when two trackers were
installed."

## What this session independently verified

- **`http://axescontracting.com`** returns `200` but serves a bare, default,
  unconfigured WordPress install — page title literally `My WordPress`, only
  default WordPress/Elementor boilerplate CSS, no real business content.
  `https://axescontracting.com` (HTTPS) fails with a certificate trust error,
  matching the already-documented expired-certificate finding in
  `RAILWAY_DEPLOYMENT.md`. This is consistent with (though does not alone
  prove) the sacred record's note about lost/degraded original content.
- **`https://testlink.vigourcreative.com/axes/`**: this repository's
  automated fetch was rate-limited (`429`) on both attempts, so its exact
  source could not be independently inspected. However, the founder's
  reported error text — "AXIOM chat is temporarily unavailable" — is this
  repository's own literal `/api/axiom` error string, and
  `apps/axiom-freedom/widget.js` (this repository's embeddable chat bubble)
  loads an iframe from `https://xiiom.com/embed`. This strongly suggests
  whatever chat integration exists on that page is calling this
  repository's already-diagnosed, already-tracked chat backend (see the
  decision register's P0 chat row) rather than presenting a new, separate
  failure. The link also carried a Facebook click-tracking parameter
  (`fbclid`), indicating Facebook ad traffic had already been directed at
  this non-production `testlink` subdomain.
- **Facebook Page**: `https://www.facebook.com/p/AXES-Contracting-Inc-61575902077830/`
  is a real, live public page — "AXES Contracting Inc \| Glendale CA," 22
  likes, with a business description mentioning home inspection, disaster
  recovery, and design alteration services. This is independent of, and
  currently more complete/functional than, either the WordPress install or
  the Vigour Creative test link.

## What this is, and is not

This is a **vendor/business dispute**, not a repository or technical defect.
No code, configuration, or deployment change was made or is warranted by
this finding. The chat error on the Vigour Creative test link is not a new
bug — it is the same already-tracked `axiom-engine` unavailability affecting
`xiiom.com` itself, surfacing on a second page that embeds the same chat
widget.

## Boundary held

No legal, financial, or contractual conclusion is offered or implied here —
this repository has no view into the actual contract, invoice, or payment
records with Vigour Creative, and cannot assess entitlement to a refund,
dispute, or chargeback. That decision belongs to the founder alone, or a
professional they choose to engage. This entry only preserves a factual,
timestamped record of what was said and what could be independently, publicly
observed.

## Founder clarification (same day)

The founder followed up with important nuance, "just being honest": the
amount was approximately $2,000 for "the entire design packet" (not an
exact figure — the underlying record was lost in a prior crash); a receipt
and the packet were requested but not received in about a year; the agency
reported health issues as the reason they couldn't deliver, not bad faith.
The founder also noted they didn't like the agency's designs much anyway
and believes the logos/art direction they've since created themselves are
better — so there is no creative urgency here. This entry, and the linked
audit-doc section, were updated to reflect this softer framing rather than
"dispute."

The founder separately reported an older website vanished from search
entirely, and that the business had been removed from Angi, Yelp, and Bing
listings, plus that the Facebook Page above had itself been erased and was
since recovered. A web check found mixed, inconclusive signals (see
`VENDOR_AND_SUBSCRIPTION_AUDIT.md`'s "Third-party directory and
search-visibility report" section for the full detail) — this repository
cannot confirm current listing status on any of those platforms directly.

## Where this is tracked going forward

- `docs/VENDOR_AND_SUBSCRIPTION_AUDIT.md` — full write-up, evidence, and
  suggested (non-legal) practical next steps.
- `docs/AXES_TIER_1_DECISION_REGISTER.md` — P1 row, "Follow up on Vigour
  Creative design-packet receipt; monitor third-party listing/search
  visibility."
