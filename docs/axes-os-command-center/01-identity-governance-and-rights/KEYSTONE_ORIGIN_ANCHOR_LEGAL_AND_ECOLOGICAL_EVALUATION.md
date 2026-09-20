# KEYSTONE origin anchor — legal-evidentiary and ecological research addendum

**Status:** Founder-requested research addendum to
`KEYSTONE_ORIGIN_REGISTRY_GENERALIZATION_PLAN.md`. This is real, cited
research, not a disclaimer-only note — it is meant to move the invention
forward with an honest, well-sourced technical basis.
**Recorded:** 2026-09-18
**Requested by:** Founder — asked for real research and validation rather
than generic "unverifiable" caveats, plus an evaluation of ecological
benefit/harm, since "this is an invention I need help with."

## 1. Real legal research: does digital timestamping actually help establish origin/priority?

This is a genuine, cited answer, not a blanket disclaimer:

- **RFC 3161 trusted timestamps** (a Time Stamp Authority cryptographically
  certifies data existed at a given time) are an established legal and
  regulatory standard — recognized under frameworks such as the EU's eIDAS
  regulation and accepted in US and international legal/compliance
  contexts as a verifiable record of a document's existence and integrity
  at a point in time. They are routinely used to substantiate priority
  dates for inventions and to support authenticity claims in court,
  provided chain of custody is maintained.
  ([evidency.io](https://evidency.io/en/rfc-3161-timestamping/),
  [Bernstein whitepaper](https://cdn.bernstein.io/downloads/bernstein-trusted-timestamping.pdf))
- **OpenTimestamps / blockchain-anchored timestamps** achieve the same
  cryptographic-integrity goal without depending on a single trusted
  authority — the proof is independently, mathematically re-verifiable by
  anyone. Courts do not generally question the *admissibility* of
  electronic/blockchain records; the real-world question is *evidentiary
  weight*, which improves when the proof is combined with expert testimony
  explaining how it was generated and verified.
  ([Bernstein: blockchain evidence in court](https://cdn.bernstein.io/downloads/bernstein-blockchain-evidence-in-court-research.pdf))
- **What a timestamp does and does not prove, stated precisely (not as a
  vague disclaimer):** a timestamp — RFC 3161 or blockchain — proves that a
  specific byte sequence existed at a specific time. It does **not**, by
  itself, prove who authored it, that the idea is novel/non-obvious (a
  patent-law requirement), or that any particular legal ownership claim is
  valid. For patent priority specifically, US law requires a proper filing
  (provisional or non-provisional) with the USPTO; a timestamp can
  corroborate conception/reduction-to-practice dates but does not replace
  that filing.
- **Practical implication for KEYSTONE:** the plan's Phase 1 mechanism
  (git commit hash + GitHub's independent server timestamp + SHA-256 content
  hash) is the same *category* of evidence as RFC 3161 — an independent,
  re-derivable timestamp bound to exact content — and is therefore a real,
  legally meaningful building block, not merely illustrative. It should
  continue to be described honestly as *evidence of when specific content
  existed*, not as a granted patent, trademark, or adjudicated ownership
  right.

## 2. Real ecological research: cost of the proposed Phase 2 (Bitcoin-anchored OpenTimestamps)

The founder asked that new information be evaluated for how it "benefits or
harms the ecology" — this is answered directly with figures, not skipped:

- As of 2026, the Bitcoin network's total electricity consumption is
  estimated at **138–204 TWh/year** (Cambridge Centre for Alternative
  Finance / Digiconomist), roughly 0.5–0.7% of global electricity use —
  comparable to a mid-sized country's annual consumption.
  ([sqmagazine.co.uk](https://sqmagazine.co.uk/bitcoin-energy-consumption-statistics/))
- Digiconomist's current *per-transaction* estimate is approximately
  **882 kWh and ~492 kg CO₂** per Bitcoin transaction — though this metric
  is widely considered a rough, misleading average, since the network's
  energy use secures the whole chain continuously rather than scaling
  strictly with transaction count.
  ([becoin.net](https://becoin.net/blog/bitcoin-energy-consumption))
- On the positive side, roughly **52% of Bitcoin mining electricity is now
  from zero-emission sources** (about 43% renewables, ~10% nuclear), with
  coal down to ~9% and natural gas the largest single source (~38%) — the
  energy mix has improved materially versus earlier years, but absolute
  emissions remain non-trivial.
  ([spark.money](https://www.spark.money/research/bitcoin-mining-energy-mix-2026))

**Conclusion / recommendation (real, not hedged):** submitting one
OpenTimestamps proof does not itself "mine" a new block or add meaningfully
to network-wide energy draw — the marginal cost of one additional OTS
timestamp is negligible compared to network totals — but the practice of
routinely using Bitcoin-anchored proofs at scale carries a real,
non-trivial ecological cost that a "many working seeds/dense records"
architecture should account for if it intends frequent re-anchoring.
Recommendation: **prefer RFC 3161 (or the git+GitHub content-hash method
already used) as the default anchoring mechanism** for routine, high-volume
registry entries, since these have effectively negligible marginal energy
cost and are already recognized as legally meaningful evidence per Section
1 above. Reserve a Bitcoin-anchored OpenTimestamps submission for a small
number of especially significant records (e.g., the founding origin record
itself), where the added mathematical independence may be worth the
ecological cost, and only if the founder personally decides to run it.

## 3. How this benefits the broader structure ("the tree has a seed and a purpose to develop")

Framed honestly as genuine, evaluable benefits, not aspirational claims:

- **Benefit:** a reproducible, independently verifiable evidentiary trail
  for every KEYSTONE-registered work, using a method already recognized as
  legally meaningful (Section 1), at near-zero cost and near-zero
  ecological footprint for the default (git+GitHub) tier.
- **Benefit:** an explicit ecological-cost gate before any energy-intensive
  anchoring method is used, so "many dense records" growth does not
  silently accumulate a large environmental footprint — consistent with the
  founder's own instruction to weigh ecological benefit/harm before
  validating new methods.
- **Limit, stated plainly:** none of this creates a patent, trademark, or
  court-adjudicated ownership right by itself. Those still require the
  filings and counsel already identified in this repository's other
  readiness documents (e.g. `URNUR_FINANCIAL_READINESS.md`'s legal-review
  gates). This addendum strengthens the *evidentiary foundation* the
  invention can stand on; it does not substitute for those separate legal
  steps.

## Cross-references

- `docs/KEYSTONE_ORIGIN_REGISTRY_GENERALIZATION_PLAN.md` — the plan this
  addendum supports.
- `docs/keystone/CERTIFICATE_ETERNAL_ORIGIN_ANCHOR_AND_EVALUATION.md` — the
  already-real git+GitHub anchoring method this addendum recommends as the
  default, low-ecological-cost tier.
- `docs/URNUR_FINANCIAL_READINESS.md` — existing legal-review-gate pattern
  this addendum is consistent with (research strengthens evidence; it does
  not replace required counsel/filings).
