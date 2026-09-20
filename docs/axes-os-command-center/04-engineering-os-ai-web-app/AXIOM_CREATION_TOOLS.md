# AXIOM creation tools

**Status:** Proposed scope note; no new capability, vendor account, or
external integration is authorized by this document
**Recorded:** 2026-09-12
**Grounded in:** the "Uplift" team value in
[AXES_PLATFORM_PLAN.md](AXES_PLATFORM_PLAN.md) and the real, currently
deployed AXIOM engine contract in
[ENGINE_INTEGRATION.md](ENGINE_INTEGRATION.md)

## Purpose

The founder asked to apply "Uplift" so AXIOM can have creation tools. This
note defines, honestly and narrowly, what AXIOM can already create, what is
aspirational reference material only, and what stays deferred pending an
explicit founder decision — so this becomes a documented boundary rather than
an open-ended promise.

## What AXIOM can create today

The only implemented creative capability is conversational text generation:
the public `chat` action (see "OpenAI chat provider" in
`ENGINE_INTEGRATION.md`) sends a message and recent episodic context to an
OpenAI model and returns its reply. There is no separate "generate a
document," "generate an image," or "generate audio/video" action implemented
in the deployed `axiom-engine` or `axiom-freedom` code.

`apps/axiom-freedom/axiom_copilot_config.json` describes a different,
aspirational deployment concept (a Microsoft Copilot Studio agent) with a
declared `document_generation` capability and several "future" integration
nodes (Microsoft 365, DALL-E/Midjourney, Runway, Eleven Labs). That file is
reference material only: no running service in this repository loads it, and
none of its "future" entries are implemented. It should not be read as a
status report on the real engine.

## Uplift applied to creation tools

A creation tool only counts as an "uplift" tool if its output can be picked
up, reviewed, and extended by any team member — not left as private,
ephemeral chat history:

- Creative output worth keeping is written back into the same reviewed,
  versioned documentation the team already shares (like this file), not held
  only in one person's chat transcript.
- Tools add to shared team capacity; they do not replace or gate-keep one
  person's institutional knowledge.
- The same governance already used everywhere in this repository applies:
  human review before anything public, no invented capability claims, and no
  new data collection beyond what is already appropriately scoped.

## Near-term, no-new-vendor creation work

These require no new external account, no new data collection, and no cost,
because they only use the text-generation capability already live today:

- Drafting and organizing assistance for the existing document set (what
  this session already does — turning founder direction into structured
  docs, timeline entries, and memory records).
- Structured summarization or continuity checks against existing repository
  material (for example, the timeline-continuity and breach checks already
  performed in this project).

## Deferred creation tools (explicit founder authorization required first)

The following remain "future" only, matching their status in
`axiom_copilot_config.json`, and each is already covered by the general
boundary in `AXES_PLATFORM_PLAN.md`'s "Decisions requiring explicit review"
list ("External integrations that create, modify, deploy, purchase, publish,
or contact third-party accounts"):

- Image generation (for example DALL-E or Midjourney) — a new paid vendor,
  a new API key, and new data-sharing terms.
- Video generation (for example Runway) — same considerations.
- Audio or voice generation (for example Eleven Labs) — same, plus
  voice-likeness and consent considerations if any real person's voice is
  ever referenced.
- Any Microsoft 365 integration (Outlook, Word, Excel, Teams, LinkedIn) — a
  new account-level integration with its own data-access scope.

None of these may be implemented, and no vendor account may be created, until
a specific decision for that item is recorded in
`AXES_TIER_1_DECISION_REGISTER.md`, following the same evidence-and-review
pattern already used for every other Tier 1 item.

## Related records

- `AXES_PLATFORM_PLAN.md` (Uplift value; product constellation; decisions
  requiring review)
- `ENGINE_INTEGRATION.md` (the real, current AXIOM engine command contract)
- `apps/axiom-freedom/axiom_copilot_config.json` (reference-only aspirational
  config; not loaded by any running service)
- `AXES_TIER_1_DECISION_REGISTER.md` (where any future vendor decision for
  this area would be recorded)
