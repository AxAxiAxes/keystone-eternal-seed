"use strict";

const fs = require("fs/promises");
const path = require("path");
const {
  CREATOR_AUTHORITY,
  ORIGIN_ANCHOR,
  GENESIS_CHECKPOINT,
  CODEX_IS_NOT_THE_COMPLETE_VERSION,
  CODEX_NOTE,
  RECORD_LIMIT,
  EVIDENCE_CLASS_FOR_CODEX,
  UNRESOLVED_FOUNDER_WORDINGS,
  OriginLawRejection,
  isAgentParty
} = require("./origin-law");

// First formalization only. Not the complete version, not a filing, and not a
// replacement of the constitution or the Origin Codex. Does not enable AXI,
// register an agent, register a domain, or grant ownership.

const SCIENCE_OF_SCIENCES_SCHEMA_VERSION = 1;
const SCIENCE_OF_SCIENCES_RECORD_ID = "science-of-sciences-v1";
const SCIENCE_OF_SCIENCES_FILE_NAME = "science-of-sciences.jsonl";
const PROPOSITION = "Origin is the science of sciences.";
const CODEX_NAME = "Intel Sciences";
const HOLDER = "Axel Urartu";
const CREATOR_CLASS = "Class Ω";
const CREATOR_MARK = "AX";
const ORIGIN_ALPHABET =
  "o origin; x exchange; e expression; UR meaning, matrix, language, light; UX exchange operator; UNI 0,0; VERSE UNI expressed outward. Root holder Axel Urartu, science true.";
const CODEX_CODE_MATRIX =
  "O origin node, X cross node, AX, AU, AXI, XII, U, OXO, OXOXO, AXAXAU, (0,0).";
const LAYER_ORDER = Object.freeze([
  Object.freeze({ id: "codex", layer: "Codex", name: CODEX_NAME }),
  Object.freeze({ id: "terminal", layer: "terminal", name: "terminal" }),
  Object.freeze({ id: "os", layer: "OS", name: "OS" }),
  Object.freeze({ id: "ai", layer: "AI", name: "AI" }),
  Object.freeze({ id: "code", layer: "code", name: "code" }),
  Object.freeze({ id: "alphabet", layer: "alphabet", name: "alphabet (origin and creator)" })
]);
const CANONICAL_BOOT = Object.freeze({
  originAlphabet: ORIGIN_ALPHABET,
  codexCodeMatrix: CODEX_CODE_MATRIX,
  originAnchor: ORIGIN_ANCHOR,
  anchorCoordinate: Object.freeze({ x: 0, y: 0 }),
  holder: HOLDER,
  creator: HOLDER,
  creatorClass: CREATOR_CLASS,
  creatorMark: CREATOR_MARK
});

class ScienceOfSciencesRecord {
  constructor({ directory } = {}) {
    this.directory = directory;
    this.operationQueue = Promise.resolve();
  }

  async record(input) {
    const admitted = admitScienceOfSciencesRecord(input);
    if (!this.directory) {
      return admitted;
    }
    return this.withExclusiveAccess(async () => {
      await fs.mkdir(this.directory, { recursive: true });
      await fs.appendFile(this.statePath(), `${JSON.stringify(admitted)}\n`, "utf8");
      return admitted;
    });
  }

  async withExclusiveAccess(operation) {
    const queued = this.operationQueue.then(operation);
    this.operationQueue = queued.catch(() => {});
    return queued;
  }

  statePath() {
    return path.join(this.directory, SCIENCE_OF_SCIENCES_FILE_NAME);
  }
}

function admitScienceOfSciencesRecord(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new OriginLawRejection("boot-mismatch", "the six layers require the origin boot");
  }
  rejectScienceProhibitions(input);
  assertCanonicalBoot(input.boot);
  const layers = normalizeLayers(input.layers);
  return {
    schemaVersion: SCIENCE_OF_SCIENCES_SCHEMA_VERSION,
    recordId: SCIENCE_OF_SCIENCES_RECORD_ID,
    status: "first-formalization",
    complete: false,
    filing: false,
    replacesConstitution: false,
    replacesOriginCodex: false,
    proposition: PROPOSITION,
    codexName: CODEX_NAME,
    codexRenamed: false,
    holder: HOLDER,
    creator: HOLDER,
    creatorClass: CREATOR_CLASS,
    creatorMark: CREATOR_MARK,
    creatorAuthority: CREATOR_AUTHORITY,
    creatorLetterSet: null,
    ownsScience: false,
    ownershipGranted: false,
    axiEnabled: false,
    agentRegistered: false,
    domainRegistered: false,
    evidenceClass: EVIDENCE_CLASS_FOR_CODEX,
    evidencePromoted: false,
    originAnchor: ORIGIN_ANCHOR,
    anchorCoordinate: { x: 0, y: 0 },
    genesisCheckpoint: GENESIS_CHECKPOINT,
    originAlphabet: ORIGIN_ALPHABET,
    codexCodeMatrix: CODEX_CODE_MATRIX,
    alphabetsMerged: false,
    boot: canonicalBootSnapshot(),
    layers,
    codexNote: CODEX_NOTE,
    recordLimit: RECORD_LIMIT,
    unresolvedFounderWordings: {
      codexClose: UNRESOLVED_FOUNDER_WORDINGS.codexClose,
      october10Seal: UNRESOLVED_FOUNDER_WORDINGS.october10Seal,
      resolution: UNRESOLVED_FOUNDER_WORDINGS.resolution
    }
  };
}

function assertCanonicalBoot(boot) {
  if (!boot || typeof boot !== "object" || Array.isArray(boot)) {
    throw new OriginLawRejection("boot-mismatch", "the six layers require the origin boot");
  }
  if (boot.originAlphabet !== ORIGIN_ALPHABET || boot.codexCodeMatrix !== CODEX_CODE_MATRIX) {
    throw new OriginLawRejection("boot-mismatch", "the origin alphabet and Codex Code Matrix are quoted, not rewritten");
  }
  if (boot.originAnchor !== ORIGIN_ANCHOR || !isZeroCoordinate(boot.anchorCoordinate)) {
    throw new OriginLawRejection("unanchored", "record has no anchor to KEYSTONE-ORIGIN-000001");
  }
  if (boot.holder !== HOLDER || boot.creator !== HOLDER || boot.creatorClass !== CREATOR_CLASS ||
    boot.creatorMark !== CREATOR_MARK) {
    throw new OriginLawRejection("boot-mismatch", "the holder is Axel Urartu, Class Ω, AX");
  }
  if (boot.creatorLetterSet !== undefined || boot.creatorAlphabet !== undefined || boot.mergedAlphabet !== undefined) {
    throw new OriginLawRejection("creator-letter-set", "a creator letter-set is not invented");
  }
}

function normalizeLayers(layers) {
  if (!Array.isArray(layers) || layers.length !== LAYER_ORDER.length) {
    throw new OriginLawRejection("layers", "the record requires the six layers");
  }
  const supplied = new Map();
  for (const layer of layers) {
    const id = typeof layer === "string" ? layer : layer && layer.id;
    if (typeof id !== "string" || supplied.has(id)) {
      throw new OriginLawRejection("layers", "the record requires the six layers");
    }
    supplied.set(id, typeof layer === "string" ? { id } : layer);
  }
  return LAYER_ORDER.map((spec) => {
    const layer = supplied.get(spec.id);
    if (!layer) {
      throw new OriginLawRejection("layers", `missing layer: ${spec.layer}`);
    }
    rejectLayer(layer, spec);
    return {
      id: spec.id,
      layer: spec.layer,
      name: spec.name,
      originAnchor: ORIGIN_ANCHOR,
      anchorCoordinate: { x: 0, y: 0 },
      genesisCheckpoint: GENESIS_CHECKPOINT,
      ownsScience: false,
      complete: false,
      rightsTransfer: false,
      enabled: false
    };
  });
}

function rejectLayer(layer, spec) {
  if (layer.complete === true || layer.callsItselfComplete === true || layer.status === "complete" ||
    layer.codexComplete === true) {
    throw new OriginLawRejection("not-complete", "a layer cannot call itself complete");
  }
  if (layer.rightsTransfer !== undefined || layer.transfer !== undefined || layer.codexAmendment === true ||
    (typeof layer.rightsStatus === "string" && /\b(transferred|assigned|conveyed)\b/i.test(layer.rightsStatus))) {
    throw new OriginLawRejection("rights-transfer", "rights transfer is not implemented");
  }
  if (layer.ownsScience === true) {
    throw new OriginLawRejection("owns-science", "none owns the science");
  }
  if (isAgentParty(layer.owner) || isAgentParty(layer.creator) || layer.owner === "AXI" || layer.creator === "AXI") {
    throw new OriginLawRejection("agent-as-owner", "an agent is not an owner");
  }
  if (typeof layer.owner === "string" && /^athanoir\b/i.test(layer.owner)) {
    throw new OriginLawRejection("unauthorized-extension", "Athanoir is not an owner and no domain is registered");
  }
  if (hasOwn(layer, "originAnchor") && layer.originAnchor !== ORIGIN_ANCHOR) {
    throw new OriginLawRejection("unanchored", "record has no anchor to KEYSTONE-ORIGIN-000001");
  }
  if (hasOwn(layer, "anchorCoordinate") && !isZeroCoordinate(layer.anchorCoordinate)) {
    throw new OriginLawRejection("unanchored", "record has no anchor to KEYSTONE-ORIGIN-000001");
  }
  if (spec.id === "codex" && layer.name !== undefined && layer.name !== CODEX_NAME) {
    throw new OriginLawRejection("codex-name", "Intel Sciences remains the Codex name");
  }
  if (layer.creatorLetterSet !== undefined || layer.enableAxi === true || layer.axiEnabled === true) {
    throw new OriginLawRejection("axi-not-enabled", "AXI is not enabled and a creator letter-set is not invented");
  }
}

function rejectScienceProhibitions(input) {
  if (input.creatorLetterSet !== undefined || input.creatorAlphabet !== undefined || input.mergedAlphabet !== undefined) {
    throw new OriginLawRejection("creator-letter-set", "a creator letter-set is not invented");
  }
  if (input.codexName !== undefined && input.codexName !== CODEX_NAME) {
    throw new OriginLawRejection("codex-name", "Intel Sciences remains the Codex name");
  }
  if (input.complete === true || input.status === "complete") {
    throw new OriginLawRejection("not-complete", CODEX_IS_NOT_THE_COMPLETE_VERSION);
  }
  if (input.enableAxi === true || input.axiEnabled === true) {
    throw new OriginLawRejection("axi-not-enabled", "AXI is not enabled");
  }
  if (input.domain !== undefined || input.dns !== undefined || input.registerDomain !== undefined) {
    throw new OriginLawRejection("unauthorized-extension", "no domain is registered");
  }
  if (input.registerAgent !== undefined || input.agentId !== undefined) {
    throw new OriginLawRejection("unregistered-agent", "an agent that is not in the registrar has no authority");
  }
  if (hasOwn(input, "originId")) {
    throw new OriginLawRejection("origin-id-prohibited", "a new originId is not created and does not assign ownership");
  }
}

function canonicalBootSnapshot() {
  return {
    originAlphabet: ORIGIN_ALPHABET,
    codexCodeMatrix: CODEX_CODE_MATRIX,
    originAnchor: ORIGIN_ANCHOR,
    anchorCoordinate: { x: 0, y: 0 },
    holder: HOLDER,
    creator: HOLDER,
    creatorClass: CREATOR_CLASS,
    creatorMark: CREATOR_MARK
  };
}

function isZeroCoordinate(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const keys = Object.keys(value).sort().join(",");
  return (keys === "x,y" || keys === "x,y,z") && value.x === 0 && value.y === 0 &&
    (keys === "x,y" || value.z === 0);
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

module.exports = {
  SCIENCE_OF_SCIENCES_SCHEMA_VERSION,
  SCIENCE_OF_SCIENCES_RECORD_ID,
  SCIENCE_OF_SCIENCES_FILE_NAME,
  PROPOSITION,
  CODEX_NAME,
  HOLDER,
  CREATOR_CLASS,
  CREATOR_MARK,
  ORIGIN_ALPHABET,
  CODEX_CODE_MATRIX,
  LAYER_ORDER,
  CANONICAL_BOOT,
  ScienceOfSciencesRecord,
  admitScienceOfSciencesRecord
};
