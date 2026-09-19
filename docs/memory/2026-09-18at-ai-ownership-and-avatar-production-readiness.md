# 2026-09-18at — AI-ownership + AXES OS hardware research; avatar-reanimation readiness gate

## Trigger

Founder said "let's do this, we want authentic" (re: urartuhi.com), then
described a new direction: make the gallery free for anyone to upload to,
use submitted music to "reanimate" uploaded images into full-length AI
avatars, as a production line under AXES Contracting Inc — and asked to (1)
validate AI ownership rights and how to get them, and (2) check hardware
needed to build "AXES OS with AXI."

## Research findings

**AI content ownership (as of 2026, US law):** Purely AI-generated images or
video are **not copyrightable by anyone** in the US — copyright requires
human authorship, and this was reaffirmed through *Thaler v. Perlmutter*
(upheld through 2026). Prompting alone does not create authorship. Only
meaningful, substantial human creative editing of AI output can be
copyrighted, and only the human-added portion. Practical effect: any
AI-generated "avatar" from this proposed feature would be effectively
uncopyrightable/freely copyable the moment it's produced, same as prior
findings for `axaxox.com`/`urartuhi.com` content. Framed to the founder as
general information, not legal advice — real IP counsel should confirm
before any public exclusivity claim.

**Hardware for "AXES OS" + AXI:** `docs/AXES_OS_VISION_AND_ARCHITECTURE.md`
already establishes AXES OS as a cloud-hosted (Railway/Docker) software
architecture, already mostly running today — no hardware purchase is needed
to keep operating it or the current OpenAI-backed AXIOM chat. Hardware only
becomes necessary if the founder chooses to self-host an AI model instead of
using a third-party API (e.g. to run image-to-video "reanimation" privately):
that ranges from a single RTX 4090 (24GB VRAM, ~$1,700) for smaller models up
to multi-GPU/48GB+ setups ($5,000–$30,000+) for larger or video-generation
models. Answered as a build-vs-buy decision, not a prerequisite.

## Readiness gate added (not built yet)

Rather than starting to build the open-upload + AI-avatar feature directly,
added `docs/AXES_CONTRACTING_AI_AVATAR_PRODUCTION_READINESS.md` — a scoping
document (same pattern as `AXI_EXTERNAL_INTERACTION_READINESS.md`) that lays
out why this needs a founder decision first:

- Public image upload in the US triggers a **mandatory** CSAM-detection and
  reporting obligation (18 U.S.C. § 2258A) — not a policy choice, a legal
  requirement, requiring an actual detection pipeline before going live.
- Copyright/DMCA exposure both directions (uploaders may not own what they
  upload; the AI output itself likely isn't ownable at all per the research
  above).
- Real recurring compute cost per AI generation (image-to-video is
  materially more expensive than the static gallery already built).
- GitHub Pages (urartuhi.com's current hosting) has no upload backend at
  all — a real server would be required regardless of moderation decisions.

Added as new item **#13** in `docs/keystone/FOUNDER_ACTION_QUEUE.md`:
approve moderation approach, AI-vendor/budget choice, and hosting/entity
plan before any public upload form or AI pipeline is written.

## What was NOT done

No open-upload form, no AI image-to-video integration, and no public-facing
change to `urartuhi.com` or any other site was built in this turn — this was
deliberately kept to research + a documented decision gate, consistent with
how AXI external-interaction and URNUR concepts were previously scoped
before any code was written.

## Related

- `docs/AXES_CONTRACTING_AI_AVATAR_PRODUCTION_READINESS.md` (new)
- `docs/keystone/FOUNDER_ACTION_QUEUE.md` (item #13 added)
- `docs/AXES_OS_VISION_AND_ARCHITECTURE.md`
- Builds on the urartuhi.com work in records `aq`/`ar`/`as`.
