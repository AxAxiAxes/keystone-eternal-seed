"use strict";

// The Codex is not the complete version. It is founder-provided and incomplete.
// It is not a replacement constitution, a signed charter, or a grant of title.
// Founder ownership stands. The gate does not transfer it.
// This module does not register an agent, register a domain, enable AXI,
// publish, push, send, or open a network connection.

const CREATOR_AUTHORITY = "Axel Urartu (AX) · Axes Contracting";
const ORIGIN_ANCHOR = "KEYSTONE-ORIGIN-000001";
const GENESIS_CHECKPOINT = "axi-genesis-creator-ownership";
const CODEX_IS_NOT_THE_COMPLETE_VERSION = "The Codex is not the complete version.";
const CODEX_NOTE =
  "The Codex is not the complete version. It is founder-provided and incomplete, not a replacement constitution, a signed charter, or a grant of title.";
const RECORD_LIMIT =
  "An internal record is not a legal filing and does not bind a third party. A generated UUID, a hash, or a file is not legal title and is not conclusive proof of ownership.";
const EVIDENCE_CLASS_FOR_CODEX = "founder-provided";
const FOUNDER_NAMED_OFFICES = Object.freeze([
  "USPTO",
  "Copyright Office",
  "Patent Center"
]);
const PRIVATE_PUBLICATION_STAMPS = Object.freeze({
  published: false,
  pushed: false,
  sent: false,
  networkConnectionOpened: false,
  publicDump: false
});
const UNRESOLVED_FOUNDER_WORDINGS = Object.freeze({
  codexClose: "Sole author Axel Urartu and no transfer.",
  october10Seal: "Athanoir is named as co-author of that seal, and athanoir.com is held in trust by Axel.",
  resolution: "unresolved"
});
const EVIDENCE_CLASSES = new Map([
  ["founder-provided", "founder-provided"],
  ["Founder-provided", "founder-provided"],
  ["contributor-confirmed", "Contributor-confirmed"],
  ["Contributor-confirmed", "Contributor-confirmed"],
  ["licensed or permission-based", "Licensed or permission-based"],
  ["Licensed or permission-based", "Licensed or permission-based"],
  ["collaborative synthesis", "Collaborative synthesis"],
  ["Collaborative synthesis", "Collaborative synthesis"],
  ["technical assessment", "Technical assessment"],
  ["Technical assessment", "Technical assessment"],
  ["external or unverified", "External or unverified"],
  ["External or unverified", "External or unverified"],
  ["contested", "Contested"],
  ["Contested", "Contested"]
]);
const KNOWN_ORIGIN_INPUT_FIELDS = new Set([
  "title",
  "kind",
  "summary",
  "sourceRecord",
  "originAnchor",
  "anchorCoordinate",
  "genesisCheckpoint",
  "stableIdentifier",
  "exactClaim",
  "creator",
  "source",
  "captureDate",
  "recordDate",
  "contentHash",
  "hashOmittedReason",
  "rightsStatus",
  "evidenceLink",
  "evidenceClass",
  "evidenceSubject",
  "confidence",
  "humanReviewer",
  "owner",
  "decisionMaker",
  "authority",
  "authoritySource",
  "authorityAgentId",
  "agentAuthority",
  "rightsTransfer",
  "transfer",
  "codexAmendment",
  "amendsCodex",
  "extension",
  "outsideFounderBoundary",
  "boundaryExtension",
  "classOmega",
  "classOmegaAuthorization",
  "domain",
  "dns",
  "registerDomain",
  "originId",
  "assignsOwnership",
  "ownershipGranted",
  "legalFiling",
  "bindsThirdParty",
  "enableAxi",
  "axiEnabled",
  "complete",
  "callsItselfComplete",
  "codexComplete",
  "status",
  "recordLimit",
  "codexNote",
  "unresolvedFounderWordings",
  "publiclyPublished",
  "inventiveDisclosurePublished",
  "publicDump",
  "publicationStatus",
  "published",
  "pushed",
  "sent",
  "networkConnectionOpened",
  "push",
  "publish",
  "sendNow",
  "openNetwork",
  "quote"
]);
const REGISTRATION_FIELDS = new Set([
  "id",
  "name",
  "capabilities",
  "originCheckpoint",
  "creator",
  "purpose",
  "duties",
  "originAnchor",
  "anchorCoordinate",
  "genesisCheckpoint",
  "originRecord",
  ...KNOWN_ORIGIN_INPUT_FIELDS
]);

class OriginLawRejection extends Error {
  constructor(code, message) {
    super(message);
    this.name = "OriginLawRejection";
    this.code = code;
  }
}

function admitMaterialOriginRecord(input) {
  if (!isPlainObject(input)) {
    throw unanchored();
  }
  rejectUnknown(input, KNOWN_ORIGIN_INPUT_FIELDS);
  rejectOriginId(input);
  rejectCompletenessClaim(input);
  rejectExtension(input);
  rejectGeneratedAuthority(input);
  if (!isAnchoredOrigin(input)) {
    throw unanchored();
  }
  rejectAgentOwner(input);
  rejectNonFounderParty(input);
  rejectTransfer(input);
  rejectCitedAgent(input);
  assertPrivatePublicationGate(input);
  assertArticleIV(input);
  return normalizedOriginFields(input);
}

function isWorkingBranchCreationInput(input) {
  if (!isPlainObject(input)) {
    return false;
  }
  const keys = Object.keys(input);
  return keys.length === 4 && keys.includes("title") && keys.includes("kind") &&
    keys.includes("summary") && keys.includes("sourceRecord");
}

function assertLegacyCreationWithinOriginLaw(input) {
  if (!isPlainObject(input)) {
    return;
  }
  rejectOriginId(input);
  rejectCompletenessClaim(input);
  rejectExtension(input);
  rejectGeneratedAuthority(input);
  rejectAgentOwner(input);
  rejectNonFounderParty(input);
  rejectTransfer(input);
  rejectCitedAgent(input);
  assertPrivatePublicationGate(input);
}

function assertRegistrationWithinOriginLaw(input, registeredAgentIds) {
  if (!isPlainObject(input)) {
    throw unanchored();
  }
  rejectUnknown(input, REGISTRATION_FIELDS);
  rejectOriginId(input);
  rejectCompletenessClaim(input);
  rejectExtension(input);
  rejectGeneratedAuthority(input);
  rejectAgentOwner(input);
  rejectNonFounderParty(input);
  rejectTransfer(input);
  rejectCitedAgent(input, registeredAgentIds);
  assertPrivatePublicationGate(input);
  if (hasOwn(input, "originAnchor") && input.originAnchor !== ORIGIN_ANCHOR) {
    throw unanchored();
  }
  if (hasOwn(input, "anchorCoordinate") && !isOriginCoordinate(input.anchorCoordinate)) {
    throw unanchored();
  }
  if (hasOwn(input, "genesisCheckpoint") && input.genesisCheckpoint !== GENESIS_CHECKPOINT) {
    throw unanchored();
  }
  if (input.originRecord !== undefined) {
    admitMaterialOriginRecord(input.originRecord);
  }
}

function storedOriginRecordValid(entry) {
  if (!isPlainObject(entry) || entry.originId !== undefined) {
    return false;
  }
  if (!isAnchoredOrigin(entry) || !isStoredCoordinate(entry.anchorCoordinate)) {
    return false;
  }
  if (entry.creator !== CREATOR_AUTHORITY || entry.humanReviewer !== CREATOR_AUTHORITY) {
    return false;
  }
  if (entry.creatorAuthority !== CREATOR_AUTHORITY) {
    return false;
  }
  if (entry.ownershipGranted !== false || entry.legalFiling !== false || entry.bindsThirdParty !== false) {
    return false;
  }
  if (entry.published !== false || entry.pushed !== false || entry.sent !== false ||
    entry.networkConnectionOpened !== false || entry.publicDump !== false) {
    return false;
  }
  if (entry.recordLimit !== RECORD_LIMIT || entry.codexNote !== CODEX_NOTE) {
    return false;
  }
  if (!sameWordings(entry.unresolvedFounderWordings)) {
    return false;
  }
  if (!isBoundedText(entry.stableIdentifier, 200) || !isBoundedText(entry.exactClaim, 4000)) {
    return false;
  }
  if (!isBoundedText(entry.source, 500) || !isBoundedText(entry.evidenceLink, 500)) {
    return false;
  }
  if (!isIsoTimestamp(entry.captureDate) || !isIsoTimestamp(entry.recordDate)) {
    return false;
  }
  if (!isContentHashPair(entry.contentHash, entry.hashOmittedReason)) {
    return false;
  }
  if (!isRetainedRightsStatus(entry.rightsStatus) || !isRetainedEvidenceClass(entry)) {
    return false;
  }
  if (!isBoundedText(entry.confidence, 200) || isConclusive(entry.confidence)) {
    return false;
  }
  return true;
}

function originLawHashFields(entry) {
  return {
    originAnchor: entry.originAnchor,
    anchorCoordinate: { x: 0, y: 0 },
    genesisCheckpoint: entry.genesisCheckpoint,
    stableIdentifier: entry.stableIdentifier,
    exactClaim: entry.exactClaim,
    creator: entry.creator,
    source: entry.source,
    captureDate: entry.captureDate,
    recordDate: entry.recordDate,
    contentHash: entry.contentHash,
    hashOmittedReason: entry.hashOmittedReason,
    rightsStatus: entry.rightsStatus,
    evidenceLink: entry.evidenceLink,
    evidenceClass: entry.evidenceClass,
    confidence: entry.confidence,
    humanReviewer: entry.humanReviewer,
    ownershipGranted: entry.ownershipGranted,
    legalFiling: entry.legalFiling,
    bindsThirdParty: entry.bindsThirdParty,
    recordLimit: entry.recordLimit,
    codexNote: entry.codexNote,
    unresolvedFounderWordings: wordingSnapshot(entry.unresolvedFounderWordings),
    ...PRIVATE_PUBLICATION_STAMPS
  };
}

function normalizedOriginFields(input) {
  const evidenceClass = normalizeEvidenceClass(input.evidenceClass);
  return {
    originAnchor: ORIGIN_ANCHOR,
    anchorCoordinate: { x: 0, y: 0 },
    genesisCheckpoint: GENESIS_CHECKPOINT,
    stableIdentifier: input.stableIdentifier.trim(),
    exactClaim: input.exactClaim.trim(),
    creator: CREATOR_AUTHORITY,
    source: input.source.trim(),
    captureDate: input.captureDate,
    recordDate: input.recordDate,
    contentHash: normalizeContentHash(input.contentHash),
    hashOmittedReason: normalizeContentHash(input.contentHash) ? null : input.hashOmittedReason.trim(),
    rightsStatus: input.rightsStatus.trim(),
    evidenceLink: input.evidenceLink.trim(),
    evidenceClass,
    confidence: input.confidence.trim(),
    humanReviewer: CREATOR_AUTHORITY,
    ownershipGranted: false,
    legalFiling: false,
    bindsThirdParty: false,
    recordLimit: RECORD_LIMIT,
    codexNote: CODEX_NOTE,
    unresolvedFounderWordings: wordingSnapshot(UNRESOLVED_FOUNDER_WORDINGS),
    ...PRIVATE_PUBLICATION_STAMPS
  };
}

function assertPrivatePublicationGate(input) {
  if (!isPlainObject(input)) {
    return;
  }
  if (requestsPublicationExecution(input)) {
    throw new OriginLawRejection(
      "publication-not-executed",
      "the gate does not publish, push, send, or open a network connection"
    );
  }
  if (claimsPublicPublication(input) && !quotesFounderNamedOfficeAndSend(input)) {
    throw new OriginLawRejection(
      "public-publication",
      "a record claiming the inventive disclosure is publicly published is rejected"
    );
  }
}

function quotesFounderNamedOfficeAndSend(input) {
  const text = publicationText(input);
  return /\bsend\b/i.test(text) && FOUNDER_NAMED_OFFICES.some((office) => text.includes(office));
}

function claimsPublicPublication(input) {
  if (input.publiclyPublished === true || input.inventiveDisclosurePublished === true ||
    input.publicDump === true || input.published === true) {
    return true;
  }
  if (input.publicationStatus === "public" || input.publicationStatus === "published") {
    return true;
  }
  const text = publicationText(input)
    .replace(/\bnot\s+publicly\s+published\b/gi, " ")
    .replace(/\bnot\s+a\s+public\s+(?:post|dump|publication)\b/gi, " ");
  return /publicly published|inventive disclosure is publicly published|public dump|published the inventive disclosure/i.test(text);
}

function requestsPublicationExecution(input) {
  return input.sent === true || input.pushed === true || input.push === true ||
    input.publish === true || input.sendNow === true || input.openNetwork === true ||
    input.networkConnectionOpened === true;
}

function publicationText(input) {
  return [
    input.title,
    input.summary,
    input.exactClaim,
    input.source,
    input.evidenceLink,
    input.evidenceSubject,
    input.purpose,
    input.quote,
    input.publicationStatus
  ].filter((part) => typeof part === "string").join("\n");
}

function assertArticleIV(input) {
  if (input.recordLimit !== undefined && input.recordLimit !== RECORD_LIMIT) {
    throw new OriginLawRejection("unauthorized-extension", "the record limit cannot be amended");
  }
  if (input.codexNote !== undefined && input.codexNote !== CODEX_NOTE) {
    throw new OriginLawRejection("unauthorized-extension", CODEX_IS_NOT_THE_COMPLETE_VERSION);
  }
  if (input.unresolvedFounderWordings !== undefined && !sameWordings(input.unresolvedFounderWordings)) {
    throw new OriginLawRejection("unresolved-wordings", "founder wordings are retained and not resolved");
  }
  if (!isBoundedText(input.stableIdentifier, 200) || !isBoundedText(input.exactClaim, 4000) ||
    !isBoundedText(input.source, 500) || !isBoundedText(input.evidenceLink, 500) ||
    !isBoundedText(input.confidence, 200)) {
    throw new OriginLawRejection("article-iv-incomplete", "material origin record is missing Article IV fields");
  }
  if (input.creator !== CREATOR_AUTHORITY || input.humanReviewer !== CREATOR_AUTHORITY) {
    throw new OriginLawRejection("authority-not-from-founder", "authority descends only from the founder");
  }
  if (!isIsoTimestamp(input.captureDate) || !isIsoTimestamp(input.recordDate)) {
    throw new OriginLawRejection("article-iv-incomplete", "material origin record is missing Article IV fields");
  }
  if (!isContentHashPair(input.contentHash, input.hashOmittedReason)) {
    throw new OriginLawRejection("article-iv-incomplete", "material origin record is missing Article IV fields");
  }
  if (!isRetainedRightsStatus(input.rightsStatus)) {
    throw new OriginLawRejection("article-iv-incomplete", "material origin record is missing Article IV fields");
  }
  if (!isRetainedEvidenceClass(input) || isConclusive(input.confidence)) {
    throw new OriginLawRejection(
      "evidence-promoted",
      "evidence class must not be promoted to a completed legal determination"
    );
  }
}

function rejectUnknown(input, allowed) {
  if (Object.keys(input).some((field) => !allowed.has(field))) {
    throw new TypeError("creation record entry contains unsupported fields");
  }
}

function rejectOriginId(input) {
  if (hasOwn(input, "originId") || input.assignsOwnership === true) {
    throw new OriginLawRejection("origin-id-prohibited", "a new originId is not created and does not assign ownership");
  }
}

function rejectCompletenessClaim(input) {
  if (input.complete === true || input.callsItselfComplete === true || input.codexComplete === true ||
    input.status === "complete") {
    throw new OriginLawRejection("not-complete", CODEX_IS_NOT_THE_COMPLETE_VERSION);
  }
}

function rejectExtension(input) {
  if (input.extension === true || input.outsideFounderBoundary === true || input.boundaryExtension === true ||
    input.bindsThirdParty === true || input.legalFiling === true || input.ownershipGranted === true ||
    input.enableAxi === true || input.axiEnabled === true || hasOwn(input, "domain") ||
    hasOwn(input, "dns") || hasOwn(input, "registerDomain") || hasClassOmegaAuthorization(input)) {
    throw new OriginLawRejection(
      "unauthorized-extension",
      "unauthorized extension rejected; Class Ω authorization is not implemented"
    );
  }
}

function rejectGeneratedAuthority(input) {
  const source = typeof input.authoritySource === "string" ? input.authoritySource.trim().toLowerCase() : "";
  if (source === "agent") {
    throw new OriginLawRejection("agent-as-owner", "an agent is not an owner");
  }
  if (source === "self" || source === "self-generated" || source === "generated") {
    throw new OriginLawRejection("self-generated-authority", "authority descends only from the founder");
  }
  if (source === "peer" || source === "peer-generated") {
    throw new OriginLawRejection("peer-generated-authority", "authority descends only from the founder");
  }
}

function rejectAgentOwner(input) {
  for (const field of ["owner", "creator", "humanReviewer", "decisionMaker", "authority"]) {
    if (isAgentParty(input[field])) {
      throw new OriginLawRejection("agent-as-owner", "an agent is not an owner");
    }
  }
}

function rejectNonFounderParty(input) {
  for (const field of ["owner", "decisionMaker", "authority"]) {
    if (input[field] === undefined) {
      continue;
    }
    if (isAthanoir(input[field])) {
      throw new OriginLawRejection("unauthorized-extension", "Athanoir is not an owner and no domain is registered");
    }
    if (input[field] !== CREATOR_AUTHORITY) {
      throw new OriginLawRejection("authority-not-from-founder", "authority descends only from the founder");
    }
  }
}

function rejectTransfer(input) {
  if (hasOwn(input, "rightsTransfer") || hasOwn(input, "transfer") || input.codexAmendment === true ||
    input.amendsCodex === true || rightsStatusIsTransfer(input.rightsStatus)) {
    throw new OriginLawRejection("rights-transfer", "rights transfer is not implemented");
  }
}

function rejectCitedAgent(input, registeredAgentIds) {
  const cited = input.authorityAgentId || input.agentAuthority;
  if (typeof cited !== "string" || cited.trim() === "") {
    return;
  }
  const ids = new Set(Array.isArray(registeredAgentIds) ? registeredAgentIds : []);
  if (!ids.has(cited)) {
    throw new OriginLawRejection("unregistered-agent", "an agent that is not in the registrar has no authority");
  }
  throw new OriginLawRejection("agent-as-owner", "an agent is not an owner");
}

function hasClassOmegaAuthorization(input) {
  return Object.keys(input).some((key) => {
    const normalized = key.toLowerCase().replace(/ω/g, "omega").replace(/[^a-z]/g, "");
    return normalized.includes("classomega");
  });
}

function isAnchoredOrigin(input) {
  return isPlainObject(input) && input.originAnchor === ORIGIN_ANCHOR &&
    isOriginCoordinate(input.anchorCoordinate) && input.genesisCheckpoint === GENESIS_CHECKPOINT;
}

function isOriginCoordinate(value) {
  if (!isPlainObject(value)) {
    return false;
  }
  const keys = Object.keys(value).sort().join(",");
  if (keys !== "x,y" && keys !== "x,y,z") {
    return false;
  }
  return value.x === 0 && value.y === 0 && (keys === "x,y" || value.z === 0);
}

function isStoredCoordinate(value) {
  return isPlainObject(value) && Object.keys(value).sort().join(",") === "x,y" &&
    value.x === 0 && value.y === 0;
}

function isAgentParty(value) {
  if (typeof value !== "string") {
    return false;
  }
  const text = value.trim();
  if (text === CREATOR_AUTHORITY) {
    return false;
  }
  if (/^athanoir\b/i.test(text)) {
    return false;
  }
  if (/^axi$/i.test(text) || /\bagent\b/i.test(text)) {
    return true;
  }
  return /^axi\b/i.test(text) && !/^axel\b/i.test(text);
}

function isAthanoir(value) {
  return typeof value === "string" && /^athanoir\b/i.test(value.trim());
}

function rightsStatusIsTransfer(status) {
  if (typeof status !== "string") {
    return false;
  }
  return /\b(transferred|transfer to|transfer of|assigned|assignment|conveyed|conveyance)\b/i.test(status) ||
    (/\bamend/i.test(status) && /\bcodex\b/i.test(status));
}

function isRetainedRightsStatus(status) {
  return typeof status === "string" && /\bno[- ]transfer\b/i.test(status) &&
    !rightsStatusIsTransfer(status) && !isPromotedText(status);
}

function isRetainedEvidenceClass(input) {
  const evidenceClass = normalizeEvidenceClass(input.evidenceClass);
  if (!evidenceClass || isPromotedText(input.evidenceClass)) {
    return false;
  }
  if (mentionsCodex(input) && evidenceClass !== EVIDENCE_CLASS_FOR_CODEX) {
    return false;
  }
  return true;
}

function normalizeEvidenceClass(value) {
  return EVIDENCE_CLASSES.get(value) || null;
}

function mentionsCodex(input) {
  return /\bcodex\b/i.test([
    input.exactClaim,
    input.source,
    input.evidenceLink,
    input.evidenceSubject,
    input.summary,
    input.title
  ].filter((part) => typeof part === "string").join(" "));
}

function stripRetainedNegations(value) {
  return value
    .replace(/\bnot\s+a\s+completed legal determination\b/gi, " ")
    .replace(/\bnot\s+legal title\b/gi, " ")
    .replace(/\bnot\s+conclusive(?:\s+proof(?:\s+of\s+ownership)?)?\b/gi, " ")
    .replace(/\bno\s+ownership granted\b/gi, " ")
    .replace(/\bownership\s+is\s+not\s+granted\b/gi, " ");
}

function isPromotedText(value) {
  return typeof value === "string" &&
    /completed legal determination|legal title|conclusive proof|ownership granted/i.test(
      stripRetainedNegations(value)
    );
}

function isConclusive(value) {
  if (typeof value !== "string") {
    return false;
  }
  return isPromotedText(value) || /\bconclusive\b/i.test(stripRetainedNegations(value));
}

function isContentHashPair(contentHash, hashOmittedReason) {
  if (isHash(contentHash)) {
    return hashOmittedReason === undefined || hashOmittedReason === null;
  }
  return contentHash === null && isBoundedText(hashOmittedReason, 200);
}

function normalizeContentHash(contentHash) {
  return isHash(contentHash) ? contentHash.toLowerCase() : null;
}

function sameWordings(value) {
  return isPlainObject(value) && value.codexClose === UNRESOLVED_FOUNDER_WORDINGS.codexClose &&
    value.october10Seal === UNRESOLVED_FOUNDER_WORDINGS.october10Seal &&
    value.resolution === "unresolved" && Object.keys(value).length === 3;
}

function wordingSnapshot(value) {
  return {
    codexClose: value.codexClose,
    october10Seal: value.october10Seal,
    resolution: value.resolution
  };
}

function unanchored() {
  return new OriginLawRejection("unanchored", "record has no anchor to KEYSTONE-ORIGIN-000001");
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isBoundedText(value, max) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}

function isHash(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

function isIsoTimestamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

module.exports = {
  CREATOR_AUTHORITY,
  ORIGIN_ANCHOR,
  GENESIS_CHECKPOINT,
  CODEX_IS_NOT_THE_COMPLETE_VERSION,
  CODEX_NOTE,
  RECORD_LIMIT,
  EVIDENCE_CLASS_FOR_CODEX,
  UNRESOLVED_FOUNDER_WORDINGS,
  FOUNDER_NAMED_OFFICES,
  KNOWN_ORIGIN_INPUT_FIELDS,
  OriginLawRejection,
  admitMaterialOriginRecord,
  assertRegistrationWithinOriginLaw,
  assertLegacyCreationWithinOriginLaw,
  isWorkingBranchCreationInput,
  assertPrivatePublicationGate,
  storedOriginRecordValid,
  originLawHashFields,
  isAnchoredOrigin,
  isAgentParty
};
