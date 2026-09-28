"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

function canonicalize(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256Hex(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function loadRegistry(baseDirectory = __dirname) {
  const chainPath = path.join(baseDirectory, "registry", "oorrp-hash-chain.v1.json");
  const chain = JSON.parse(fs.readFileSync(chainPath, "utf8"));

  const recordsById = new Map();
  for (const entry of chain.entries || []) {
    const recordPath = path.join(baseDirectory, entry.recordPath);
    const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));
    recordsById.set(entry.recordId, record);
  }

  return { chain, recordsById };
}

function validateRecordShape(record, errors) {
  const requiredFields = [
    "schemaVersion", "recordId", "sequence", "recordType", "participants",
    "rightsConsentStatus", "classification", "verification", "lineage", "sourceReferences"
  ];
  for (const field of requiredFields) {
    if (record[field] === undefined || record[field] === null) {
      errors.push(`${record.recordId || "(unknown)"}: missing required field ${field}`);
    }
  }
}

function validateRegistryData({ chain, recordsById }) {
  const errors = [];

  if (chain.schemaVersion !== "oorrp-hash-chain-v1") {
    errors.push("hash chain schemaVersion must be oorrp-hash-chain-v1");
  }

  const entries = chain.entries || [];
  if (entries.length < 2) {
    errors.push("hash chain must include at least foundational and founder-claim records");
  }

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const expectedSequence = i + 1;
    if (entry.sequence !== expectedSequence) {
      errors.push(`hash entry ${entry.recordId} has sequence ${entry.sequence}, expected ${expectedSequence}`);
    }

    const record = recordsById.get(entry.recordId);
    if (!record) {
      errors.push(`hash entry ${entry.recordId} has no matching record`);
      continue;
    }

    validateRecordShape(record, errors);

    if (record.sequence !== entry.sequence) {
      errors.push(`${record.recordId}: record sequence ${record.sequence} must match chain sequence ${entry.sequence}`);
    }

    const canonical = canonicalize(record);
    const expectedHash = sha256Hex(canonical);
    if (entry.canonicalSha256 !== expectedHash) {
      errors.push(`${record.recordId}: canonical hash mismatch`);
    }

    if (i === 0) {
      if (entry.previousCanonicalSha256 !== null) {
        errors.push(`${record.recordId}: first hash entry previousCanonicalSha256 must be null`);
      }
      if (record.recordType !== "foundational-origin-reference") {
        errors.push(`${record.recordId}: first record must be foundational-origin-reference`);
      }
      const semantics = record.firstValueReference && record.firstValueReference.semantics;
      if (!semantics || semantics.nonFinancial !== true || semantics.additive !== true || semantics.doesNotRankPeople !== true || semantics.doesNotAssignLegalRights !== true) {
        errors.push(`${record.recordId}: firstValueReference semantics must remain additive, nonfinancial, non-ranking, and non-adjudicating`);
      }
    } else {
      const previousEntry = entries[i - 1];
      if (entry.previousCanonicalSha256 !== previousEntry.canonicalSha256) {
        errors.push(`${record.recordId}: previousCanonicalSha256 must match the prior entry hash`);
      }
    }

    if (record.verification && record.verification.legalStatus !== "not-legally-adjudicated") {
      const evidence = record.verification.officialExternalEvidence;
      if (!Array.isArray(evidence) || evidence.length === 0) {
        errors.push(`${record.recordId}: legal status cannot be elevated without official external evidence`);
      }
    }
  }

  const foundational = recordsById.get("OORRP-FOUNDATIONAL-ORIGIN-000001");
  const founderClaim = recordsById.get("OORRP-FOUNDER-ORIGIN-OWNERSHIP-000001");

  if (!foundational) {
    errors.push("missing foundational record OORRP-FOUNDATIONAL-ORIGIN-000001");
  }

  if (!founderClaim) {
    errors.push("missing founder claim record OORRP-FOUNDER-ORIGIN-OWNERSHIP-000001");
  } else {
    const linkage = founderClaim.claimLinkage && founderClaim.claimLinkage.foundationalOriginRecordId;
    if (linkage !== "OORRP-FOUNDATIONAL-ORIGIN-000001") {
      errors.push("founder ownership claim must link to the foundational OORR-P record");
    }
  }

  return errors;
}

function validateRegistry(baseDirectory = __dirname) {
  return validateRegistryData(loadRegistry(baseDirectory));
}

if (require.main === module) {
  const errors = validateRegistry(process.argv[2] || __dirname);
  if (errors.length > 0) {
    for (const error of errors) {
      process.stderr.write(`- ${error}\n`);
    }
    process.exitCode = 1;
  } else {
    process.stdout.write("OORR-P registry validation passed.\n");
  }
}

module.exports = {
  canonicalize,
  sha256Hex,
  loadRegistry,
  validateRegistry,
  validateRegistryData
};
