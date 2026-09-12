# AXIOM creation tools scope (2026-09-12)

## Prompt

Founder: "uplift the meaning so we can have the creation tools for axiom" —
asked while unavailable for follow-up, following the earlier "Uplift" team
value addition.

## What was done

Created `docs/AXIOM_CREATION_TOOLS.md`, grounding "creation tools" for AXIOM
in the real, currently deployed engine contract rather than inventing new
capability:

- **What AXIOM can create today:** conversational text only, through the
  public `chat` action documented in `ENGINE_INTEGRATION.md` (message plus
  recent episodic context sent to an OpenAI model). No document, image,
  audio, or video generation action exists in the deployed `axiom-engine` or
  `axiom-freedom` code.
- **Clarified a source of possible confusion:** `apps/axiom-freedom/
  axiom_copilot_config.json` declares a `document_generation` capability and
  lists "future" integration nodes (Microsoft 365, DALL-E/Midjourney, Runway,
  Eleven Labs). Confirmed by repository-wide search that this file is not
  loaded by any running service — it describes a separate, aspirational
  Microsoft Copilot Studio deployment concept, not the real engine. None of
  its "future" entries are implemented.
- **Applied Uplift as the governing rule:** a creation tool only counts as an
  uplift tool if its output can be picked up, reviewed, and extended by any
  team member. Creative output worth keeping should become shared, reviewed,
  versioned documentation (like this record), not stay only in private chat
  history.
- **Left every paid/external option deferred:** image, video, and audio
  generation, plus any Microsoft 365 integration, remain "future" only,
  covered by the existing `AXES_PLATFORM_PLAN.md` boundary on external
  integrations. None may be implemented, and no vendor account may be
  created, without a specific decision recorded in
  `AXES_TIER_1_DECISION_REGISTER.md` first.

Cross-linked from `AXES_PLATFORM_PLAN.md` (Uplift section) and
`ENGINE_INTEGRATION.md` (new "Creation tools scope" section), and added a
`PROJECT_TIMELINE.md` row.

## What was not done

- No new external vendor, API key, or account was created or configured.
- No code changes were made to `axiom-engine` or `axiom-freedom` — this is a
  documentation/scope record only.
- `axiom_copilot_config.json` itself was left unmodified; it is referenced,
  not edited, since it describes a separate deployment concept outside this
  repository's running services.

## Files touched

- `docs/AXIOM_CREATION_TOOLS.md` (new)
- `docs/AXES_PLATFORM_PLAN.md`
- `docs/ENGINE_INTEGRATION.md`
- `PROJECT_TIMELINE.md`
- `docs/memory/README.md`
