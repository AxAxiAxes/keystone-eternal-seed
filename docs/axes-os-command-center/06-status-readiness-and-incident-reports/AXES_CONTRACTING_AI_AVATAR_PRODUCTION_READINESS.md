# AXES Contracting Inc — AI avatar reanimation production: readiness review

**Status:** Scoping/readiness document only. No open-upload infrastructure or
AI-video generation pipeline has been built. This is a founder-decision gate,
same pattern as `AXI_EXTERNAL_INTERACTION_READINESS.md`,
`URNUR_EVOLVING_NAME_VALUE_CONCEPT.md`, and other pre-build scoping docs.
**Recorded:** 2026-09-18
**Trigger:** Founder direction — make `urartuhi.com` (or a successor site)
free for anyone to upload images to, then use submitted music to "reanimate"
uploaded images into full-length AI-generated avatars, as a production line
under AXES Contracting Inc.

## Why this needs a decision gate before building

Everything shipped for `urartuhi.com` so far (manifest-driven gallery, bulk
upload, masonry grid, tag filtering — see `docs/memory/2026-09-18aq/ar/as`)
was **founder-curated**: only images the founder explicitly supplied were
added, committed by a repo maintainer. Opening uploads to the general public,
plus running third-party AI generation on that content, is a different risk
category entirely:

- **Legal exposure that is not optional.** Any US-based service that lets the
  public upload images is subject to mandatory CSAM-detection and reporting
  obligations (18 U.S.C. § 2258A) — this is not a "nice to have," it is a
  legal requirement the moment public upload goes live, and it requires an
  actual detection pipeline (e.g. hash-matching against known-bad databases)
  plus a designated reporting process, not just a promise in a ToS.
- **Copyright/ownership exposure both ways.** Uploaders may submit images
  they don't own the rights to; the site would need a DMCA takedown process
  and a registered DMCA agent. Separately (see research below), the
  AI-generated "avatar" output itself is very unlikely to be copyrightable at
  all in the US as currently interpreted.
- **Real, ongoing compute cost.** Image-to-video/"reanimation" AI is
  materially more expensive per generation than a static gallery — this is a
  recurring API/compute bill that scales with usage, not a one-time build
  cost.
- **Moderation beyond CSAM.** Public upload + AI video generation also invites
  non-CSAM abuse (harassment content, deepfakes of real identifiable people
  without consent, copyrighted media, etc.) that a Terms of Service alone
  does not prevent — some form of review queue or automated content
  classification is needed before publishing anything a stranger uploaded.

None of this is a reason not to build it — it is the reason it needs an
explicit founder decision on moderation approach and budget **before** any
upload form or AI pipeline is written, exactly like the AXI external-interaction
and URNUR items already on the founder queue.

## Research: who owns AI-generated content? (informational, not legal advice)

As of 2026, current U.S. Copyright Office guidance and case law
(*Thaler v. Perlmutter*, upheld through 2026) hold:

- **Purely AI-generated output is not copyrightable by anyone** — not the
  platform, not the uploader, not the AI vendor — because U.S. copyright law
  requires human authorship, and "the AI decided the expressive content" does
  not meet that bar.
- **Prompting alone is not enough.** Simply supplying a photo + a song and
  letting an AI model generate the resulting video does not create a
  copyright in that video.
- **Meaningful human creative editing of the output can be protected**, but
  only the human-added portions — the underlying AI-generated material must
  be disclaimed if you ever register it with the Copyright Office.
- **Practical consequence for this product:** avatars generated this way are
  effectively "free for anyone to copy" content the moment they're produced,
  the same conclusion already reached for the (fully human-made) `axaxox.com`
  artifact and the `urartuhi.com` gallery. The only added protection option
  is if the founder or a human editor makes substantial, documented creative
  changes to specific outputs afterward.
- **This is general legal information, not legal advice** — confirm with
  actual IP counsel before making public claims about ownership of generated
  avatars, especially if the business model depends on exclusivity.

## Research: hardware needed for "AXES OS" + AXI

`docs/AXES_OS_VISION_AND_ARCHITECTURE.md` already establishes that "AXES OS"
as designed is a **cloud-hosted, Docker/Railway-deployed software
architecture** (AXIOM engine + automation console + UI), not a piece of
physical hardware to buy — most of its layers are already running today on
Railway. The hardware question only becomes real for two specific things:

| Need | Hardware required | Notes |
| --- | --- | --- |
| Day-to-day development (writing/testing AXES OS code, this repo, CI) | An ordinary modern laptop/desktop (16–32GB RAM, no GPU required) | This is what's needed today; nothing more. |
| Continuing to use OpenAI (current AXIOM chat-service backend) | None locally — API-based, billed per token via Railway/OpenAI | No hardware purchase required for the current architecture. |
| **Self-hosting your own AI model** (to stop depending on OpenAI, or to run the image-to-video "reanimation" model privately instead of a third-party API) | Real GPU hardware, scaled to model size: <br>• Small/local models (7B–13B): one RTX 4060–4090 (8–24GB VRAM), ~$300–$1,700 <br>• Mid-size (34B): RTX 3090/4090 24GB, ~$700–$1,700 <br>• Large (70B) or serious image/video generation: RTX 6000 Ada 48GB or multi-GPU (2× RTX 4090 / H100), plus 64–256GB system RAM and 2–4TB NVMe storage — realistically $5,000–$30,000+ depending on tier | Image-to-video "reanimation" models specifically are typically heavier than text LLMs of comparable "size," so budget toward the higher end of this range if self-hosting rather than using a vendor API. |

**Bottom line:** no hardware purchase is required to keep operating AXES OS
or AXIOM chat as they exist today. Hardware only becomes necessary if/when
the founder decides to self-host the AI model(s) behind either AXIOM chat or
the avatar-reanimation feature instead of paying a third-party API per
generation — that is itself a build-vs-buy decision this document defers to
the founder, not a prerequisite for anything already running.

## What would actually be needed to build the avatar-reanimation production line

1. **Moderation decision (blocking):** choose and fund a CSAM-detection
   method (e.g., a hash-matching service) and a designated reporting contact,
   plus a review process for non-CSAM abuse, before any public upload form
   goes live. This is a legal requirement, not a style choice.
2. **AI vendor decision:** pick a third-party image-to-video/"animate a
   photo" API (recurring per-generation cost) vs. self-hosting an open model
   (upfront GPU cost from the table above, ongoing power/maintenance,
   probably still cloud GPU rental rather than owned hardware at first).
   Music-driven animation ("reanimate with sent music") specifically implies
   audio-reactive video generation, a narrower and less mature category than
   general image-to-video — vendor research would be a follow-up task once
   this is approved.
3. **Storage/bandwidth budget:** public upload at any real scale needs paid
   object storage and CDN bandwidth, not a GitHub Pages static site (GitHub
   Pages has no upload backend at all — a real backend/server is required
   for public uploads, which `urartuhi.com`'s current static architecture
   does not have).
4. **Terms of Service / ownership disclosure:** must state upfront that
   AI-generated avatar output is not exclusively ownable under current U.S.
   law (per the research above), and must include upload-rights
   representations from uploaders (they must own/have rights to what they
   upload) plus a DMCA takedown process.
5. **Entity/branding decision:** confirm this ships under AXES Contracting
   Inc as stated, and whether it lives at a new domain/repo or as a new
   section of an existing one.

## Recommendation

Treat this as a new, separate founder-action-queue item (added below) rather
than starting to build immediately. The urartuhi.com curated-upload gallery
that already shipped this session is a safe, working proof of the "manifest +
bulk add" pattern; opening it to the general public plus adding AI video
generation is a substantially larger commitment that should be scoped,
budgeted, and moderation-approved first.

## Related records

- `docs/keystone/FOUNDER_ACTION_QUEUE.md` (new item added for this)
- `docs/AXES_OS_VISION_AND_ARCHITECTURE.md`
- `docs/memory/2026-09-18aq-urartuhi-manifest-driven-gallery.md`
- `docs/memory/2026-09-18ar-urartuhi-first-bulk-image-upload.md`
- `docs/memory/2026-09-18as-urartuhi-gallery-scaling.md`
- `docs/AXI_EXTERNAL_INTERACTION_READINESS.md` (same pre-build scoping pattern)
