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

## Where this is tracked going forward

- `docs/VENDOR_AND_SUBSCRIPTION_AUDIT.md` — full write-up, evidence, and
  suggested (non-legal) practical next steps.
- `docs/AXES_TIER_1_DECISION_REGISTER.md` — new P1 row, "Resolve Vigour
  Creative vendor dispute (paid, not delivered)."
