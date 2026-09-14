# AXES public web and SEO readiness

## Purpose and current boundary

This repository does not contain a deployable AXES website, a router, hosting
configuration, or approved public business content. `web/axes-public-foundation.json`
is therefore an implementation contract, not a deployed page or a publishing
instruction. `web/preview/index.html` is a self-contained visual direction for
that same root route; open it locally in a browser to preview it. Both artifacts
intentionally represent one noindex root route with no form, service list, phone
number, email address, offer, price, or external link.

The private AXES root and command-center materials remain outside this public-web
foundation. Do not copy private records, internal systems, credentials, or
unverified historical content into a public site.

`AXES-DMC-001` is unapproved. Until written owner approval changes that status,
do not add client intake, lead collection, a paid offer, price, solicitation,
professional-service availability claim, or marketing language implying that it
is available.

## Technical implementation contract

When a site application and deployment model have been selected, implement the
manifest before enabling indexing:

| Item | Current requirement |
| --- | --- |
| Public route | `/` only; preserve its one visible H1 and factual placeholder purpose. |
| Local design preview | `web/preview/index.html`; it is a static artifact, not a configured public route. |
| Page metadata | Use the title, description, canonical URL, and route-level robots directive from the manifest. |
| Indexing | Keep `noindex, nofollow, noarchive, nosnippet` until the owner approves copy and deployment is verified. |
| Canonical | Use `https://axescontracting.com/` only for the root route after the domain serves that exact route. Do not emit a canonical to another host. |
| Social cards | Omit Open Graph and X/Twitter card tags until the owner provides approved title, description, and image assets. |
| Structured data | Omit Organization, LocalBusiness, Service, Review, and FAQ schema until names, locations, credentials, services, and claims are verified in writing. |
| Sitemap and robots.txt | Do not publish a sitemap or an indexable robots policy until route ownership, production origin, and indexability are approved. If a nonproduction preview is deployed, block it with platform access controls as well as `noindex`. |
| Forms and integrations | Keep the route static. Do not add forms, mailto links, CRM, analytics, pixels, chat widgets, payments, or third-party scripts without owner approval and an implementation review. |

Run the local guard before a change is proposed:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\Test-AxesPublicFoundation.ps1
```

The guard checks JSON shape, noindex state, canonical origin, semantic H1,
absence of forms and external links, and common unapproved offer/intake wording.
It makes no network requests.

## Content and keyword planning

Use themes to organize future owner-approved content; they are not ranking,
traffic, conversion, eligibility, or availability promises.

| Audience question | Potential content theme | Required approval evidence |
| --- | --- | --- |
| Who is AXES Contracting? | Factual company introduction and ownership-approved brand story | Exact legal/display name and approved company description. |
| What information can the public rely on? | Scope, service-area, credential, and capability explainer | Verified services, geography, licenses/certifications, insurance, and substantiated operating facts. |
| How does a prospective customer evaluate a provider? | Owner-approved process, preparation, and decision-guide content | Reviewed process, disclaimers, and approved calls to action. |
| Where can people find trusted information? | Approved resource or FAQ pages | Source records, review date, and named content owner. |

Do not target emergency, disaster, inspection, appraisal, remediation, pricing,
or availability keywords with public marketing copy unless the owner first
approves the applicable service, geography, claims, and contact workflow.
Never publish guarantees, rankings, response-time promises, credential claims,
customer results, reviews, affiliations, regulatory statements, or comparative
claims without retained support and review.

## Founder-provided inputs needed before publication

1. Approved legal/display name, business address or decision not to display one,
   service areas, public phone/email, hours, and the responsible owner.
2. Verified service list, license/certification/insurance details, limitations,
   and substantiation for every public claim.
3. Approved logo, favicon, brand colors/fonts, original social-card image, image
   rights/alt text, and written permission for testimonials, project images, or
   partner marks.
4. Final page copy, privacy/contact terms if any data collection is planned, and
   the approved form recipient, retention, consent, and response process.
5. Hosting/platform decision, production URL confirmation, analytics/privacy
   decision, and written authorization to change indexing, sitemap, robots, or
   external integrations.

## Human-controlled publication workflow

1. Owner approves each page's copy, claim evidence, metadata, canonical URL, and
   visible contact path in writing.
2. A maintainer implements the approved content in the selected site application
   and runs the local foundation guard plus the application's build and route
   checks.
3. Owner verifies a private preview for correct routes, headings, canonical tags,
   robots state, image rights, accessibility, and absence of unapproved intake.
4. After production deployment is verified on the intended domain, the owner
   explicitly authorizes indexability. Only then may a maintainer change robots,
   add a sitemap, enable approved social metadata/schema, or connect approved
   measurement tools.
5. Owner performs post-publication spot checks in search and browser previews,
   records issues, and approves any correction or expansion before it ships.
