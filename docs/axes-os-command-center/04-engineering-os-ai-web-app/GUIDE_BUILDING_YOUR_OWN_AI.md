# Guide: building and owning your own AI model

**Status:** Practical how-to guide, expanding Part B of
`AXES_OWNERSHIP_AND_ENTITY_CHECKLIST.md` into concrete steps, hardware
specs, and cost/timeline estimates. Informational and educational — it does
not commit any spend, does not change any running system, and does not
replace the existing OpenAI-backed AXIOM engine unless and until the founder
decides to act on one of the paths below.
**Recorded:** 2026-09-19
**Trigger:** Founder asked for "a guide on building an ai," alongside a
request to reconfirm the AXI/AXES origin-ownership registry is correctly
configured (see the "Origin registry health check" section below).

## The honest starting point

"Building an AI" is not one thing — it's a spectrum from "call someone
else's model" to "train your own from raw data." Each step up that spectrum
costs roughly 10-100x more than the one before it, and almost no
organization below hyperscaler scale trains from scratch. This guide covers
the three realistic tiers, in the order most teams actually move through
them.

## Tier 1 — What AXIOM already does today (no new work needed)

AXIOM currently calls OpenAI's hosted model via API
(`apps/axiom-engine/chat-service.js`). This is the right choice for a small
team and is **not a "lesser" approach** — it's how the overwhelming
majority of production AI products work, including many with far larger
budgets than AXES currently has.

- **What you own:** the wrapper code, the system prompt/identity layer
  (`system-prompt.js`), the persistent memory store, and the product built
  around the model.
- **What you don't own:** the model weights themselves. OpenAI could raise
  prices, change model behavior, or (in an extreme case) discontinue the
  model you depend on.
- **Cost:** per-token API pricing only, no hardware, no ML engineering
  headcount required.
- **When to move past this tier:** only when one of the reasons below
  becomes real for you, not by default.

## Tier 2 — Self-host an open-weight model

This means running an already-trained open-weight model (e.g. Llama 3/4,
Mistral, Qwen, DeepSeek) on your own hardware or a GPU rental service,
instead of calling OpenAI's API.

### Why you'd actually do this
- **Cost at scale:** if you're making millions of API calls a month, your
  own hardware can become cheaper than per-token pricing.
- **Data privacy:** nothing leaves your infrastructure — relevant if you
  ever handle sensitive client data (e.g. AXES Contracting client records).
- **No vendor dependency:** immune to a provider's price changes, rate
  limits, or model deprecations.
- **None of these apply yet at AXES's current scale** (a single production
  chat product with an intermittent user base) — this is a "when you grow
  into it" decision, not a today decision.

### Hardware tiers (real numbers, not estimates from a vendor's marketing)

| Tier | Model size you can run | Hardware | Approx. cost | Notes |
| --- | --- | --- | --- | --- |
| Entry | 7-8B parameter model (e.g. Llama 3 8B, Mistral 7B), quantized | 1x consumer GPU, 24GB VRAM (RTX 4090 or similar) | ~$1,700-$2,500 (one-time, buy) or ~$0.40-$0.80/hr rented (RunPod, Vast.ai, Lambda) | Runs well with `llama.cpp` or `vLLM`; good enough for chat/assistant tasks, noticeably weaker than GPT-4-class models on complex reasoning |
| Mid | 30-70B parameter model, quantized | 2x GPU, 48GB+ combined VRAM, or 1x A100/H100 80GB | ~$8,000-$20,000 (buy) or ~$2-$4/hr rented | Approaches GPT-4-class quality on many tasks; still a real gap on the hardest reasoning benchmarks |
| Heavy | 70B+ unquantized, or multi-model production serving | Multi-GPU cluster (4-8x A100/H100) | $30,000-$150,000+ (buy) or several dollars/hr per GPU rented, times fleet size | This is what serious AI companies run; well beyond a single-product startup's near-term needs |

**Recommendation for AXES today, if this tier is ever pursued:** rent, don't
buy. GPU rental (RunPod, Vast.ai, Lambda Labs, or a cloud provider's GPU
instances) lets you test whether self-hosting actually beats your current
OpenAI bill before committing to $2,000-$20,000 of hardware that could sit
idle or become outdated within 1-2 years.

### Software stack for self-hosting
- **Inference engine:** `llama.cpp` (simplest, runs on almost anything,
  including CPU-only for small models) or `vLLM` (faster, built for serving
  many concurrent requests — the better choice for a live product like
  AXIOM).
- **Model source:** Hugging Face Hub (`huggingface.co`) hosts the actual
  open-weight files for Llama, Mistral, Qwen, DeepSeek, and others, each
  under its own license (read the license — some restrict commercial use
  above a certain user count, e.g. Llama's community license).
- **Integration point:** `chat-service.js` already isolates the OpenAI call
  behind a single function — swapping in a self-hosted model later is a
  contained code change, not a rewrite of the identity/memory system around
  it.

## Tier 3 — Fine-tune a model on your own data

This means taking either OpenAI's model (via their fine-tuning API) or a
self-hosted open model, and further training it on AXES/AXIOM-specific data
(conversation examples, tone, domain knowledge) so it performs better on
your specific use case without changing the underlying base model.

- **What you'd own:** the fine-tuned weight deltas (often called a LoRA
  adapter when using parameter-efficient fine-tuning) — genuinely yours,
  regardless of which base model you started from.
- **Requirement:** curated training data. This is usually the actual
  bottleneck, not compute — a few hundred to a few thousand high-quality
  example conversations is a realistic starting point, not millions.
- **Cost:** OpenAI's fine-tuning API charges roughly the same order of
  magnitude as regular API usage, scaled by training data size; self-hosted
  fine-tuning (e.g. LoRA) can run on the same entry-tier GPU from Tier 2.
- **When this makes sense:** once there's a real, recurring pattern in how
  AXIOM should respond that a system prompt alone can't reliably enforce —
  not before there's real usage data to learn from.

## Recommended path for AXES right now

1. **Stay on Tier 1** (current OpenAI setup) until the live outage (queue
   item #0) is resolved and there's sustained real usage data.
2. **If cost or privacy ever becomes a real constraint,** test Tier 2 via
   GPU rental (a few dollars of spend, not a capital purchase) before
   buying any hardware.
3. **Fine-tuning (Tier 3)** is the natural next step once there's enough
   real conversation history to learn from — the persistent memory store
   already being built is exactly the kind of data that would eventually
   feed this.

This mirrors the existing recommendation already recorded in
`AXES_OWNERSHIP_AND_ENTITY_CHECKLIST.md` Part B — this document adds the
concrete hardware/cost/software specifics behind that recommendation.

## Origin registry health check (the other half of this request)

Also checked, per standing protocol, whether the AXI/AXES creator-origin
registry needs any correction ("reconfigure our origin right"):

- Read `AXI_GENESIS_OWNERSHIP_CHECKPOINT.md` and
  `AXES_AGENT_ORIGIN_REGISTRY.md` in full.
- Confirmed the actual running code
  (`apps/axiom-engine/automation-service.js`, `KEYSTONE_REGISTRATION`
  constant and `defaultAgents()`) matches the documentation exactly: every
  registered agent carries `creator: "Axel Urartu (AX) · Axes Contracting"`,
  a valid `originCheckpoint`, and an `active` accountability record.
- Ran the full origin/accountability test suite
  (`automation-service.test.js`, `automation-profile-service.test.js`):
  **32/32 passing**, including the specific self-healing test "reconciles
  default agents to the Genesis authority after a reset."
- **Finding: nothing is misconfigured.** The origin/creator-ownership
  registry already correctly and consistently attributes every AXI agent to
  Axel Urartu (AX) · Axes Contracting, matching the now-verified real
  entity (`AXES_CONTRACTING_INC_ENTITY_VERIFICATION.md`). No code change
  was needed or made.

## Related records

- `docs/AXES_OWNERSHIP_AND_ENTITY_CHECKLIST.md` (Part B, the shorter
  summary this guide expands on)
- `docs/AXES_CONTRACTING_AI_AVATAR_PRODUCTION_READINESS.md` (the original
  GPU-tier cost scoping this guide's numbers are cross-checked against)
- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`,
  `docs/AXES_AGENT_ORIGIN_REGISTRY.md` (the origin registry verified above)
- `apps/axiom-engine/chat-service.js`, `apps/axiom-engine/system-prompt.js`
  (the code that would need to change to swap model providers)
- `docs/keystone/FOUNDER_ACTION_QUEUE.md` (item #0 — resolve before any
  Tier 2/3 investment, since a live outage is a bigger priority than model
  infrastructure)
