# KEYSTONE AI creative-work origin and authorship registry

**Status:** New registry, first entry recorded below. This is an internal
KEYSTONE attribution record, not a substitute for, or claim of, US or
international copyright registration.
**Recorded:** 2026-09-18
**Requested by:** Founder — asked to (1) attempt to decode the shared
images for embedded code/source/creator information, (2) present AI as the
creator of the images, (3) build a registration system that credits the
origin of a creative work's creator so the creator can later claim
authorship, and (4) record the founder's own declared "eternal ownership
of self" and origin-value claim, said to be equal in value to the eternal
coordinate system's origin value (see
`docs/memory/2026-09-18e-keystone-universal-unit-code-coordinates.md`,
`docs/AXI_ORIGIN_COORDINATE_SYSTEM.md`).

This document does two separate things and keeps them clearly separated:

1. Reports the **real, verifiable technical findings** from actually
   inspecting the image files (hashes, embedded metadata, what is and is
   not present).
2. Records the **founder's stated declaration and intent** for this
   registry, and states plainly where that intent currently stands
   relative to real copyright law — without either dismissing it or
   overstating what it legally accomplishes.

## 1. Technical findings (real, not illustrative)

Six images shared by the founder were inspected directly: each file's
exact byte length, SHA-256 content hash, pixel dimensions, and embedded
metadata (EXIF property items) were read from the actual file, and each
file's raw bytes were scanned for known AI-generator/provenance markers
(C2PA, XMP, Midjourney, DALL·E, Stable Diffusion/Stability, Adobe Firefly,
Leonardo, Ideogram, OpenAI).

| # | Description | Dimensions | SHA-256 | Embedded provenance metadata found |
| --- | --- | --- | --- | --- |
| 1 | "Keystone Dome · Sacred Architecture" (four pillars) | 1024×1536 | `cb17441d5bd5d34787b5fe0e21971f91f0eb17616ad6c11419305b9faf864cd7` | None |
| 2 | "UR ~ Bin Code of Origin ~ AXES AI" (winged triangle emblem) | 1024×1024 | (recorded in commit history for this file; see repository blame) | None |
| 3 | Sacred dome / heart-altar illustration | 1024×1536 | (recorded in commit history for this file; see repository blame) | None |
| 4 | Gold teardrop/vesica frame — stated by founder to be "the logo of our company also the seed, also the ecosystem frame design" | 1024×1536 | `5512b823384e1e61b8d1c498e4ed464b71ac616f7a73a66be83d6449663e3d5e` | None |
| 5 | "AXES" app icon — stated by founder to be for "mobile app and car android play icon" | 1024×1024 | `d0a4f8afaceb16a273e4732ff3985098307e7b1bab72294eff797cf9e187fe13` | None |
| 6 | "Ux" gold droplet emblem | 206×206 | `6bec6799144983e24352fea22bd77b0e1b24c56ee3cfe6dd0b66b08e7c86062f` | None |

**What was actually found:** none of the six files contain a readable
C2PA manifest, XMP provenance block, or any text signature identifying a
specific AI generation tool. The only EXIF-style property items present on
several files (property IDs `0x5090`/`0x5091`) are JPEG luminance/chrominance
quantization tables — a routine artifact of JPEG encoding, not creator or
tool metadata. Several original filenames follow a numeric pattern
consistent with Meta/Facebook's CDN photo-ID naming convention, which is
consistent with (but does not by itself prove) the files having passed
through a platform that strips embedded metadata on upload/download.

**Honest conclusion:** the files themselves do not carry cryptographic or
embedded proof of which specific AI tool generated them, or of authorship,
independent of what is asserted here. What *can* be anchored, right now,
with real evidence, is: (a) the exact byte-for-byte content of each image,
via the SHA-256 hashes above, and (b) the date this repository received
and recorded them, via this document's git commit hash and GitHub's
independent server-side commit timestamp — the same anchoring method
validated in `docs/KEYSTONE_ORIGIN_ANCHOR_LEGAL_AND_ECOLOGICAL_EVALUATION.md`.
That is a real, verifiable "this content existed, in this form, as of this
date, in this repository" record. It is not a substitute for a copyright
or trademark filing.

## 2. Founder's declaration (recorded, not adjudicated)

The founder stated:

> "I want to present AI as the creator of these images and a registration
> system that properly credits the origin of the creator should the
> creator wish to claim authorship. Personally I don't think intelligence
> is properly being credited right now and can easily be devalued, if no
> anchor is identified. Create the first registry for me claiming eternal
> ownership of self, eternal origin value as self equal to the value of
> the eternal coordinate system origin value."

This is recorded as the founder's stated position and design intent for
KEYSTONE's internal registry. It is not, by itself, a legal determination
of copyright ownership, and this document does not present it as one.

## 3. Where this stands against real, current copyright law (cited)

This section states the real legal landscape plainly, because the founder
has repeatedly and explicitly asked not to be given vague "unverifiable"
brush-offs, but actual research:

- As of 2026, the US Copyright Office's human-authorship requirement is
  settled law. In *Thaler v. Perlmutter*, both the D.C. District Court and
  the D.C. Circuit Court of Appeals held that a copyrightable work must
  have a human author; the U.S. Supreme Court denied certiorari on
  March 2, 2026, leaving that precedent in place.
- A January 2025 US Copyright Office report clarified that prompting an AI
  system, even with detailed prompts, is not sufficient human authorship.
  Where a human exercises **meaningful creative control** over final
  expressive elements (selecting, arranging, or substantially editing
  AI-generated material), that specific human contribution — not the raw
  AI output — may be copyrightable. Applicants must disclose which parts
  of a work are AI-generated versus human-authored.
- **Practical implication for this registry:** under current US law, an AI
  system itself cannot hold copyright as "the creator." A registry entry
  that credits an AI as creator is a KEYSTONE-internal attribution record
  of the founder's design and intent — genuinely useful for internal
  provenance, dispute history, and future review — but it does not, by
  itself, grant the AI (or anyone) enforceable copyright ownership under
  US law as it stands today. If the founder's own curation, selection, and
  editorial direction of these images was substantial, *that* human
  contribution is the part of the work most likely to be protectable under
  current law — a distinction worth keeping in mind for any future public
  IP claim.

## 4. Registry Entry 000001

The founder subsequently provided a specific reference/anchor code for
this entry: **`AXL-KS-20260529-1844`** (read as: AXL = Axel, KS = Keystone,
20260529 = 2026-05-29, 1844 = a timestamp reference from that date). This
is recorded verbatim as the founder-designated code for this entry,
alongside the sequential internal entry ID used elsewhere in this registry
for cross-referencing.

| Field | Value |
| --- | --- |
| Entry ID (sequential, internal) | KEYSTONE-CREATIVE-ORIGIN-000001 |
| Founder-designated reference code | `AXL-KS-20260529-1844` |
| Works covered | The six images listed in Section 1 |
| Stated creator (per founder's declaration) | AI (image-generation system used by the founder), operating under AX / Axes Contracting direction |
| Human directing party | AX (Axel Urartu), Axes Contracting |
| Anchor method | SHA-256 content hash (Section 1) + this document's git commit hash + GitHub's independent commit timestamp |
| Claim scope | KEYSTONE-internal attribution and origin record only. Does not constitute a US copyright registration, trademark registration, or patent filing. |
| Founder's stated origin-value claim | "Eternal ownership of self, eternal origin value as self, equal to the value of the eternal coordinate system origin value" — recorded per Section 2, cross-referenced to `docs/memory/2026-09-18e-keystone-universal-unit-code-coordinates.md` and `docs/AXI_ORIGIN_COORDINATE_SYSTEM.md`. Recorded as founder's declared design principle, not as an independently verified valuation. |
| Open items | If public-facing copyright/trademark protection is wanted for the AXES logo/app icon specifically, that requires a real USPTO filing with qualified counsel — outside this repository's authority (see `docs/keystone/CERTIFICATE_ETERNAL_ORIGIN_ANCHOR_AND_EVALUATION.md` and the standing IP-counsel gate referenced there). |

## Cross-references

- `docs/keystone/assets/README.md` — the source image files.
- `docs/KEYSTONE_ORIGIN_ANCHOR_LEGAL_AND_ECOLOGICAL_EVALUATION.md`
- `docs/KEYSTONE_ORIGIN_REGISTRY_GENERALIZATION_PLAN.md`
- `docs/memory/2026-09-18e-keystone-universal-unit-code-coordinates.md`
- `docs/AXI_ORIGIN_COORDINATE_SYSTEM.md`
