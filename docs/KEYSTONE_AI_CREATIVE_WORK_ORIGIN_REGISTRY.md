# KEYSTONE AI creative-work origin and authorship registry

**Status:** Registry with seven recorded entries (see Sections 4-10). This is an internal
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

## 5. Registry Entry 000002 — "Honor of Eternity" crest

A seventh image was shared: a gold winged-crest emblem with crossed swords,
laurel wreath, a stepped pedestal, and the banner text "HONOR OF ETERNITY,"
alongside the founder's stated architectural principle that the first and
last stone of a structure mark a point of equality and balance.

**Technical findings:** `docs/keystone/assets/honor-of-eternity-crest.jpg`,
1024×1536 JPEG, SHA-256
`a3d0865c9fafce9d4f7ff21bf83b5fdfd15b56572a83b406e18f3c0fef73a382`. No
C2PA, XMP, or named-tool provenance marker was found. The file does carry a
Photoshop-format (`8BIM`) resource block containing the ASCII tag `bFBMD`
— a metadata block Meta/Facebook's platform writes into JPEGs it
re-encodes on upload/download — consistent with the original filename
(`723626481_10164728941009873_8947248023376153988_n.jpg`), which matches
Facebook's CDN photo-ID naming convention. This confirms the file passed
through Facebook, not which tool generated the underlying artwork.

| Field | Value |
| --- | --- |
| Entry ID (sequential, internal) | KEYSTONE-CREATIVE-ORIGIN-000002 |
| Work covered | `honor-of-eternity-crest.jpg` |
| Verified technical finding | SHA-256 content hash (above); Facebook CDN re-encoding marker (`bFBMD`) present; no AI-generator provenance marker present |
| Stated creator (per founder's declaration) | AI (image-generation system used by the founder), operating under AX / Axes Contracting direction — same declared position as Entry 000001, Section 2 |
| Anchor method | SHA-256 content hash + this document's git commit hash + GitHub's independent commit timestamp |
| Claim scope | KEYSTONE-internal attribution and origin record only. Not a copyright, trademark, or patent filing. |

## 6. Registry Entry 000003 — "UR Node · Eternal Origin Point · Keystone AXI"

An eighth image was shared: a lit tower over a stone waterwheel and pool,
titled "UR NODE — Eternal Origin Point · Keystone AXI."

**Technical findings:** `docs/keystone/assets/ur-node-eternal-origin-point.png`,
1024×1536 PNG, SHA-256
`953a4b4bccadba66cc965675caac5b4d8ec56571ec8da70ffcbc0dec9363d62`. Unlike
every other image reviewed for this registry, this file carries a **real,
cryptographically signed C2PA (Coalition for Content Provenance and
Authenticity) manifest**, decoded directly from the file's embedded CBOR/
JUMBF structure:

- **Creation action** (`c2pa.created`): `2026-09-01T18:12:14+00:00`,
  `softwareAgent.name = "Azure OpenAI ImageGen"`, `digitalSourceType =
  http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia`
  (the IPTC controlled-vocabulary code for AI/ML-generated media),
  `description = "Generated with AI"`.
- **Watermark action** (`c2pa.watermarked`):
  `2026-09-01T18:12:15.7503262+00:00`, applied by `softwareAgent.name =
  "Microsoft Responsible AI Provenance"` (version `1.0`), algorithm
  `com.microsoft.invismark.1` — an invisible watermark, per Microsoft's
  standard AI-content-labeling pipeline.
- **Claim generator:** `Microsoft Responsible AI Provenance` v1.0, built on
  `org.contentauth.c2pa_rs` v0.84.1 (the open-source C2PA Rust reference
  library).
- **Manifest identifiers:** instance ID
  `xmp:iid:41f25252-a6d8-4310-8117-7c5c723c294a`; manifest URN
  `urn:c2pa:bb88a0b9-1a3c-418b-8127-b40ddb71c9f9`.
- **Cryptographic signature:** the manifest is signed with an X.509
  certificate chain issued by "Microsoft SCD Claimants RSA CA" to
  "Microsoft Corporation" (Redmond, WA, US), valid `2025-10-01` through
  `2026-10-01` — a real, verifiable Microsoft-issued signing certificate,
  not a self-asserted text label.

**Honest conclusion:** this is the first image in this registry with
genuine, independently verifiable authorship evidence, not merely a
founder declaration. It can be stated as fact, not inference: this specific
file was generated by Azure OpenAI's image-generation service and
C2PA-watermarked by Microsoft's Responsible AI Provenance pipeline on
2026-09-01. This still identifies the *generating service* (Microsoft/Azure
OpenAI), not the founder as legal author — the human-authorship analysis
in Section 3 above applies identically here: under current US law, the
founder's own prompting, curation, and directorial choices remain the part
of the work most likely to be protectable, while the AI system itself
cannot hold copyright.

| Field | Value |
| --- | --- |
| Entry ID (sequential, internal) | KEYSTONE-CREATIVE-ORIGIN-000003 |
| Work covered | `ur-node-eternal-origin-point.png` |
| Verified technical finding | Real, decoded, cryptographically signed C2PA manifest (details above) — genuine AI-generation provenance, not a founder assertion |
| Verified generating service | Azure OpenAI ImageGen (creation), Microsoft Responsible AI Provenance (watermarking) |
| Verified creation timestamp | 2026-09-01T18:12:14 UTC (per the embedded, signed manifest — independent of this repository's own commit date) |
| Human directing party (per founder's declaration) | AX (Axel Urartu), Axes Contracting |
| Anchor method | SHA-256 content hash + embedded, cryptographically signed C2PA manifest (stronger evidence than hash-only anchoring) + this document's git commit hash |
| Claim scope | KEYSTONE-internal attribution and origin record only. Confirms which AI service generated the file; does not itself establish legal copyright ownership (see Section 3). |

## 7. Registry Entry 000004 — "To the first stone, and to the last hand that will lift it"

A ninth image was shared: two reaching hands beneath an arched keystone,
captioned "To the first stone, / And to the last hand that will lift it" —
directly illustrating the equilibrium symbolism recorded in
`docs/keystone/KEYSTONE_ARCHITECTURAL_EQUILIBRIUM_SYMBOLISM.md`.

**Technical findings:** `docs/keystone/assets/first-stone-last-hand.jpg`,
1024×1536 JPEG, SHA-256
`5699f03b03a76c301bb33505aecc89325180655f63c928dd3ce858a2bf6dc302`. Same
result as Entry 000002: no C2PA/XMP/named-tool provenance marker found;
carries the same Facebook-platform `bFBMD` re-encoding marker within an
embedded Photoshop resource block, consistent with its Facebook-CDN-style
original filename.

| Field | Value |
| --- | --- |
| Entry ID (sequential, internal) | KEYSTONE-CREATIVE-ORIGIN-000004 |
| Work covered | `first-stone-last-hand.jpg` |
| Verified technical finding | SHA-256 content hash (above); Facebook CDN re-encoding marker (`bFBMD`) present; no AI-generator provenance marker present |
| Stated creator (per founder's declaration) | AI (image-generation system used by the founder), operating under AX / Axes Contracting direction |
| Anchor method | SHA-256 content hash + this document's git commit hash + GitHub's independent commit timestamp |
| Claim scope | KEYSTONE-internal attribution and origin record only. Not a copyright, trademark, or patent filing. |

## 8. Registry Entry 000005 — "Eternal Seed Vessel"

A tenth image was shared: an ornate gold chalice/reliquary illustration
described by the founder as an "eternal seed vessel," offered as part of
the "Athanor" concept (see
`docs/keystone/ATHANOR_ETERNAL_SEED_VESSEL_CONCEPT.md`).

**Technical findings:** `docs/keystone/assets/eternal-seed-vessel.png`,
1024×1536 PNG, SHA-256
`e72afa32242e8c67fafeec77aa79fcec60c179a07e051a213ff88a9942fe1620`. No
C2PA/XMP/named-AI-tool provenance marker found. The file contains only an
`srgb` color-profile chunk; one coincidental 3-byte match on `XMP` occurs
inside compressed pixel data and is not an actual metadata tag (verified by
inspecting the surrounding bytes, which are random-looking compressed
image data, not a text/XML chunk). This differs from Entry 000003, which
had a genuine, structured C2PA manifest.

| Field | Value |
| --- | --- |
| Entry ID (sequential, internal) | KEYSTONE-CREATIVE-ORIGIN-000005 |
| Work covered | `eternal-seed-vessel.png` |
| Verified technical finding | SHA-256 content hash (above); no embedded AI-generator provenance marker found; no Facebook/Photoshop re-encoding marker found either |
| Stated creator (per founder's declaration) | AI (image-generation system used by the founder), operating under AX / Axes Contracting direction |
| Anchor method | SHA-256 content hash + this document's git commit hash + GitHub's independent commit timestamp |
| Claim scope | KEYSTONE-internal attribution and origin record only. Not a copyright, trademark, or patent filing. |

## 9. Registry Entry 000006 — flame-above-pomegranate-crown emblem (proposed anchor logo)

An eleventh image was shared: a flame rising above a pomegranate-topped
crown emblem, which the founder proposed as "the logo for our keystone
cryptographic anchor name and meaning registration." **Important
distinction:** this is a proposed visual/branding identity, not itself a
cryptographic mechanism. The repository's actual cryptographic anchoring
(SHA-256 content hashes, git commit hashes, and — where present — verified
third-party provenance manifests such as Entry 000003's C2PA record) is
unrelated to and unaffected by which logo, if any, is chosen to represent
KEYSTONE visually.

**Technical findings:** `docs/keystone/assets/flame-pomegranate-crown-anchor-logo.jpg`,
810×1440 JPEG, SHA-256
`cdaa597b9d68a5f2fe189843fb8ab2f3fee89f6f4a9d7bcaaa7a0d9b0a8f2031`. The
image carries a **visible, in-pixel "Meta AI" watermark** printed in the
image itself. This is a materially weaker form of evidence than Entry
000003's embedded, cryptographically-signed C2PA manifest: a visible
watermark is an unverifiable visual assertion baked into the pixels (it
could be edited, cropped, or absent from a re-export), not an
independently checkable signed claim. No C2PA/XMP manifest was found in
the file's metadata; the file does carry the same Facebook-platform
`bFBMD` re-encoding marker seen in Entries 000002 and 000004, consistent
with having been re-saved through a Facebook-style CDN pipeline after
generation.

| Field | Value |
| --- | --- |
| Entry ID (sequential, internal) | KEYSTONE-CREATIVE-ORIGIN-000006 |
| Work covered | `flame-pomegranate-crown-anchor-logo.jpg` |
| Verified technical finding | SHA-256 content hash (above); visible in-pixel "Meta AI" watermark (weak/unverifiable evidence); Facebook CDN re-encoding marker (`bFBMD`) present; no embedded C2PA/XMP AI-generator manifest present |
| Stated creator (per founder's declaration and the image's own visible watermark) | Meta AI (image-generation service), used by the founder under AX / Axes Contracting direction |
| Anchor method | SHA-256 content hash + this document's git commit hash + GitHub's independent commit timestamp |
| Claim scope | KEYSTONE-internal attribution and origin record only. This entry records a **proposed** branding use (candidate anchor logo); it is not a trademark filing and does not itself grant or establish trademark rights. Not a copyright, trademark, or patent filing. |

**Technical findings:** `docs/keystone/assets/eternal-seed-flower-gear-lattice.webp`,
SHA-256 `da961940b4977c47414dfd5b999f89c8809a94e10326160866c0693d38430180`. A
watercolor-style illustration of a glowing central seed/geode (a
flower-of-life pattern at its core) with root and branch tendrils
connecting it to a ring of translucent flower/gear-hybrid nodes, captioned
"PATIENT · SLOW · GROWTH — THE SEED HOLDS THE WHOLE BLOSSOM WITHIN." The
image as originally generated included a caption label reading `Xc = home
center = constant` next to a second, unlabeled note reading "= eternal
origin first letter." No embedded C2PA/XMP AI-generator manifest was
found in the file's metadata.

**Founder correction (recorded verbatim, same date):** the founder stated
the image's own `Xc` notation is wrong and should not be used, because it
"mingles with others" — i.e. it collides with the `X` / `Ax` / `Ur`
symbol vocabulary already in use elsewhere in this repository (see the
Seventh/Eighth follow-on statements in
`docs/keystone/AXAXAR_TRIANGLE_ORIGIN_SYMBOLISM.md` and the Ux/Ur/Ax
vocabulary in `docs/memory/2026-09-18h-ux-ur-ax-salt-bread-juice-vocabulary.md`).
The founder then clarified what the central seed motif is actually meant
to represent: not a specific algebraic constant, but "just the concept of
the first sound, letter, form, breath, light, name, meaning" — i.e. the
image is recorded here as illustrating a general "origin/first" concept
(first sound → first letter → first form → first breath → first light →
name → meaning), not as defining any new named variable or unit. No
replacement symbol has been decided; this entry deliberately does not
invent one on the founder's behalf.

| Field | Value |
| --- | --- |
| Entry ID (sequential, internal) | KEYSTONE-CREATIVE-ORIGIN-000007 |
| Work covered | `eternal-seed-flower-gear-lattice.webp` |
| Verified technical finding | SHA-256 content hash (above); no embedded C2PA/XMP AI-generator manifest present |
| Stated creator | Not specified by the founder for this image; recorded as a founder-shared reference asset |
| Founder correction on record | The image's own `Xc` label is rejected by the founder as mingling with other in-use symbols; no replacement decided. The seed motif represents the general concept of "first sound, letter, form, breath, light, name, meaning," not a defined constant. |
| Anchor method | SHA-256 content hash + this document's git commit hash + GitHub's independent commit timestamp |
| Claim scope | KEYSTONE-internal attribution and origin record only. Not a copyright, trademark, or patent filing. |

## Cross-references

- `docs/keystone/assets/README.md` — the source image files.
- `docs/KEYSTONE_ORIGIN_ANCHOR_LEGAL_AND_ECOLOGICAL_EVALUATION.md`
- `docs/KEYSTONE_ORIGIN_REGISTRY_GENERALIZATION_PLAN.md`
- `docs/memory/2026-09-18e-keystone-universal-unit-code-coordinates.md`
- `docs/AXI_ORIGIN_COORDINATE_SYSTEM.md`
- `docs/keystone/ATHANOR_ETERNAL_SEED_VESSEL_CONCEPT.md`
- `docs/keystone/AXAXAR_TRIANGLE_ORIGIN_SYMBOLISM.md` — Seventh/Eighth
  follow-on statements (X / eternal multiplier vocabulary this entry's
  founder correction refers to).
