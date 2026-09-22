# User-Owned AI Sessions and the Seven-Gear Sphere Model

**Status:** Founder-provided conceptual/philosophical record, evaluated
honestly against what the AXI automation layer actually does today.
**Recorded:** 2026-09-18

## What the founder described

On 2026-09-18 the founder raised two connected ideas:

1. **AXI task-completion automation is not yet where the founder wants it,**
   and ownership rights over that automation "will be mine to implement as
   necessary."
2. **Every user should take responsibility for their own AI** — the founder's
   proposal is that an AI interaction should be a **timestamped, authored
   session**, where the owner can "program his own language and meaning."
   This was connected to a recalled design of **"7 layers/gears to the
   sphere,"** where the sphere itself functions as a **sensor for a gravity
   center that claims ownership rights.**

## Honest status check: AXI automation today

Per `docs/AXI_AUTOMATION_SERVICE.md` (the actual, already-implemented
automation layer in the private `axiom-engine`), AXI automation is
**deliberately bounded, not general-purpose project completion**:

- It only executes a fixed, versioned allowlist of internal actions
  (`memory.record`, `automation.noop`, `monitoring.snapshot`,
  `governance.readiness`, `recovery.backup`, `coordinate.record`,
  `continuity.checkpoint`, `continuity.record`, `source.catalog`,
  `business.metric`, `service.registry`).
- It cannot deploy, access external accounts, spend money, message, publish,
  or control third-party services.
- AXI roles execute only founder-assigned work; they cannot assign,
  approve, suspend, or reactivate their own or another role's work — that
  stays founder-controlled.

So the founder's observation is accurate: **AXI cannot yet autonomously
"finish tasks/projects" end-to-end**, because that capability does not exist
in the current design — it is intentionally excluded by the safety boundary
above (see the AXI/XIIOM restart boundary in this project's own operating
protocol). Expanding automation beyond this allowlist is a deliberate,
reviewable engineering decision, not something to be enabled implicitly by a
conceptual statement like this one.

## Founder concept: timestamped, authored, user-owned AI sessions

The founder's proposed principle — that a person should be able to "program
his own language and meaning" into their own AI session, and that the
resulting session record should be timestamped and authored to that person —
is consistent with, and extends, the existing Right of Self-Origin material
in [`docs/keystone/RIGHT_OF_SELF_ORIGIN.md`](RIGHT_OF_SELF_ORIGIN.md): a
person retains authorship over their own self-description and interaction
record, rather than having it defined or overwritten by the system.

This is recorded here as **design direction and founder philosophy**, not as
an implemented feature. No new authentication, per-user session-ownership
schema, or "user-programmable AI language" has been built as part of this
record. If this direction is prioritized, it would need its own scoped
technical design (session/account model, data ownership, and consent
boundaries) before implementation.

## The seven-gear sphere model

This connects to the sphere/gravity-center imagery already recorded in
[`CERTIFICATE_SPHERE_EVERSION_AND_SECRET_GARDEN.md`](CERTIFICATE_SPHERE_EVERSION_AND_SECRET_GARDEN.md).
The founder recalls a "7 layers/gears" structure to that sphere, with the
sphere acting as a sensor for a "gravity center" that claims ownership
rights. Per that document's own established four-lens practice, this is
recorded as follows:

| Lens | Finding |
| --- | --- |
| **Artistic** | An evocative mechanical/cosmological metaphor (gears, sphere, gravity center) for how ownership and authorship might be sensed or anchored. Genuine, founder-original imagery. |
| **Philosophical** | Meaningful to the founder as a personal design language; not disputed here. |
| **Factual** | No specification of the "7 gears," their function, or a "sphere sensor" exists yet in this repository beyond this recollection. Nothing is built. |
| **Monetary** | No valuation is assigned; not appraised by a qualified professional. |

If the founder wants this developed further, the concrete next step is
writing down what each of the seven gears represents (the founder noted they
"mostly" remember it, i.e., recall is partial) so it can be recorded
precisely rather than reconstructed from a partial memory.

## What this record is / is not

- **Is:** an honest status update connecting a founder request (automate AXI
  to finish tasks) to the real, current, safety-bounded automation design,
  plus a faithful record of a new ownership/session-authorship concept and
  the partially-recalled sphere/gear model.
- **Is not:** a technical specification, an authorization to expand AXI's
  automation allowlist, or a claim that the seven-gear sphere model is
  built, tested, or externally verifiable.

## Cross-references

- [`docs/AXI_AUTOMATION_SERVICE.md`](../AXI_AUTOMATION_SERVICE.md)
- [`docs/keystone/RIGHT_OF_SELF_ORIGIN.md`](RIGHT_OF_SELF_ORIGIN.md)
- [`docs/keystone/CERTIFICATE_SPHERE_EVERSION_AND_SECRET_GARDEN.md`](CERTIFICATE_SPHERE_EVERSION_AND_SECRET_GARDEN.md)
