"use strict";

const schema = require("./origin-property-record-v1.schema.json");

const CENTER_STATUSES = new Set(schema.properties.centerStatus.enum);
const EVIDENCE_CLASSES = new Set(schema.properties.evidenceClass.enum);
const VERIFICATION_STATES = new Set(schema.properties.verificationState.enum);
const BOUNDARIES = new Set(schema.properties.boundary.enum);
const PRESERVES_RELATION = new Set(schema.properties.transformationMultiplier.properties.preservesOriginRelation.enum);
const EQUILIBRIUM_SIGNALS = new Set(schema.properties.equilibriumRule.properties.statusSignal.enum);
const CONTACT_MODES = new Set(schema.properties.vertexContactRelation.properties.contactMode.enum);
const EVALUATION_SYSTEM_FIELDS = new Set(Object.keys(schema.properties.evaluationSystems.properties));
const EVALUATION_SYSTEM_STATUSES = new Set(
  schema.properties.evaluationSystems.properties.proposedSystems.items.properties.status.enum
);
const EVALUATION_SYSTEM_BOUNDARIES = new Set(
  schema.properties.evaluationSystems.properties.proposedSystems.items.properties.boundary.enum
);
const UNKNOWN_RESERVE_STATUSES = new Set(
  schema.properties.evaluationSystems.properties.unknownReserve.properties.status.enum
);
const UNKNOWN_RESERVE_BOUNDARIES = new Set(
  schema.properties.evaluationSystems.properties.unknownReserve.properties.boundary.enum
);
const REQUIRED_VARIABLE_FIELDS = Object.keys(schema.properties.variableProperties.properties);
const REQUIRED_SOURCE_FIELDS = ["primary", "coordinateSystem", "genesisCheckpoint"];
const REQUIRED_ATTRIBUTION_FIELDS = ["founderClaim", "implementedBy", "toolAttribution"];
const VARIABLE_PROPERTY_FIELDS = new Set(REQUIRED_VARIABLE_FIELDS);
const SOURCE_REF_FIELDS = new Set([
  "primary",
  "coordinateSystem",
  "genesisCheckpoint",
  "resequencerProposal",
  "accountabilityEvidence"
]);
const ATTRIBUTION_FIELDS = new Set(REQUIRED_ATTRIBUTION_FIELDS);
const ORIGIN_REFERENCE_PATTERN = /^[A-Z][A-Z0-9-]{2,119}$/;
const RECORD_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateOriginRecord(record) {
  const errors = [];
  if (!isRecord(record)) {
    return ["record: must be a plain object"];
  }

  requireString(record.schemaVersion, "schemaVersion", errors, "origin-property-record-v1");
  requirePattern(record.recordId, "recordId", RECORD_KEY_PATTERN, errors);
  requirePattern(record.propertyKey, "propertyKey", RECORD_KEY_PATTERN, errors);
  requirePattern(record.originReference, "originReference", ORIGIN_REFERENCE_PATTERN, errors);
  requireEnum(record.centerStatus, "centerStatus", CENTER_STATUSES, errors);
  validateNestedStrings(
    record.variableProperties,
    "variableProperties",
    REQUIRED_VARIABLE_FIELDS,
    VARIABLE_PROPERTY_FIELDS,
    errors
  );
  validatePairObject(
    record.transformationMultiplier,
    "transformationMultiplier",
    "statement",
    "preservesOriginRelation",
    PRESERVES_RELATION,
    errors
  );
  validatePairObject(
    record.equilibriumRule,
    "equilibriumRule",
    "statement",
    "statusSignal",
    EQUILIBRIUM_SIGNALS,
    errors
  );
  validatePairObject(
    record.vertexContactRelation,
    "vertexContactRelation",
    "statement",
    "contactMode",
    CONTACT_MODES,
    errors
  );
  requireEnum(record.evidenceClass, "evidenceClass", EVIDENCE_CLASSES, errors);
  validateNestedStrings(
    record.sourceRefs,
    "sourceRefs",
    REQUIRED_SOURCE_FIELDS,
    SOURCE_REF_FIELDS,
    errors
  );
  validateNestedStrings(
    record.attribution,
    "attribution",
    REQUIRED_ATTRIBUTION_FIELDS,
    ATTRIBUTION_FIELDS,
    errors
  );
  requireEnum(record.verificationState, "verificationState", VERIFICATION_STATES, errors);
  requireEnum(record.boundary, "boundary", BOUNDARIES, errors);
  if (!isRecord(record.lineage)) {
    errors.push("lineage: must be an object");
  } else {
    requireNullableString(record.lineage.parentRecordId, "lineage.parentRecordId", errors);
    requireNullableString(record.lineage.correctionOfRecordId, "lineage.correctionOfRecordId", errors);
  }
  validateEvaluationSystems(record.evaluationSystems, errors);

  return errors;
}

function classifyEquilibrium(record) {
  if (!isRecord(record) || !isRecord(record.equilibriumRule)) return "unknown";
  if (record.verificationState === "failed" || record.equilibriumRule.statusSignal === "broken") {
    return "failed";
  }
  if (
    record.verificationState === "verified" &&
    record.equilibriumRule.statusSignal === "preserved" &&
    record.transformationMultiplier?.preservesOriginRelation === "yes"
  ) {
    return "verified";
  }
  if (
    record.verificationState === "proposed" ||
    record.verificationState === "founder_reported" ||
    record.equilibriumRule.statusSignal === "proposed" ||
    record.evidenceClass === "founder-defined-proposal" ||
    record.evidenceClass === "technical-checkpoint"
  ) {
    return "proposed";
  }
  return "unknown";
}

function validateOriginRecordSet(records) {
  const errors = [];
  if (!Array.isArray(records) || records.length === 0) {
    return { valid: false, errors: ["records: must be a non-empty array"], classifications: [] };
  }

  const byId = new Map();
  const recordIndexById = new Map();
  const propertyVersions = new Map();
  const classifications = [];

  records.forEach((record, index) => {
    const prefix = `records[${index}]`;
    for (const error of validateOriginRecord(record)) {
      errors.push(`${prefix}.${error}`);
    }
    if (!isRecord(record)) {
      classifications.push({ recordId: null, equilibrium: "unknown" });
      return;
    }
    if (byId.has(record.recordId)) {
      errors.push(`${prefix}.recordId: duplicate recordId ${record.recordId}`);
    } else {
      byId.set(record.recordId, record);
      recordIndexById.set(record.recordId, index);
    }
    classifications.push({ recordId: record.recordId, equilibrium: classifyEquilibrium(record) });
  });

  records.forEach((record, index) => {
    const prefix = `records[${index}]`;
    if (!isRecord(record)) {
      return;
    }
    if (!record.originReference) {
      errors.push(`${prefix}.originReference: missing origin reference`);
    }
    if (index === 0) {
      if (record.centerStatus !== "value-bearing-center-block") {
        errors.push(`${prefix}.centerStatus: first record must establish the value-bearing center block`);
      }
      if (record.lineage?.parentRecordId !== null) {
        errors.push(`${prefix}.lineage.parentRecordId: first record must not declare a parent`);
      }
    } else {
      const parentIndex = recordIndexById.get(record.lineage?.parentRecordId);
      if (parentIndex === undefined || parentIndex >= index) {
        errors.push(`${prefix}.lineage.parentRecordId: must reference an earlier recorded origin property`);
      }
    }

    const key = `${record.originReference}::${record.propertyKey}`;
    const previous = propertyVersions.get(key);
    if (previous && previous.recordId !== record.recordId) {
      if (
        record.lineage?.correctionOfRecordId !== previous.recordId ||
        record.lineage?.parentRecordId !== previous.recordId
      ) {
        errors.push(
          `${prefix}.lineage.correctionOfRecordId: silent replacement rejected for ${key}; append a correction reference instead`
        );
      }
    }
    propertyVersions.set(key, record);
  });

  return {
    valid: errors.length === 0,
    errors,
    classifications
  };
}

function validatePairObject(value, fieldName, textField, enumField, allowedEnum, errors) {
  if (!isRecord(value)) {
    errors.push(`${fieldName}: must be an object`);
    return;
  }
  requireString(value[textField], `${fieldName}.${textField}`, errors);
  requireEnum(value[enumField], `${fieldName}.${enumField}`, allowedEnum, errors);
}

function validateNestedStrings(value, fieldName, requiredFields, allowedFields, errors) {
  if (!isRecord(value)) {
    errors.push(`${fieldName}: must be an object`);
    return;
  }
  for (const key of Object.keys(value)) {
    if (!allowedFields.has(key)) {
      errors.push(`${fieldName}.${key}: unsupported field`);
    }
  }
  for (const field of requiredFields) {
    requireString(value[field], `${fieldName}.${field}`, errors);
  }
}

function validateEvaluationSystems(value, errors) {
  if (!isRecord(value)) {
    errors.push("evaluationSystems: must be an object");
    return;
  }
  for (const key of Object.keys(value)) {
    if (!EVALUATION_SYSTEM_FIELDS.has(key)) {
      errors.push(`evaluationSystems.${key}: unsupported field`);
    }
  }
  if (!Array.isArray(value.proposedSystems) || value.proposedSystems.length === 0) {
    errors.push("evaluationSystems.proposedSystems: must be a non-empty array");
  } else {
    value.proposedSystems.forEach((entry, index) => {
      const prefix = `evaluationSystems.proposedSystems[${index}]`;
      if (!isRecord(entry)) {
        errors.push(`${prefix}: must be an object`);
        return;
      }
      requirePattern(entry.systemKey, `${prefix}.systemKey`, RECORD_KEY_PATTERN, errors);
      requireString(entry.label, `${prefix}.label`, errors);
      requireEnum(entry.status, `${prefix}.status`, EVALUATION_SYSTEM_STATUSES, errors);
      requireEnum(entry.boundary, `${prefix}.boundary`, EVALUATION_SYSTEM_BOUNDARIES, errors);
      requireString(entry.statement, `${prefix}.statement`, errors);
      for (const key of Object.keys(entry)) {
        if (!["systemKey", "label", "status", "boundary", "statement"].includes(key)) {
          errors.push(`${prefix}.${key}: unsupported field`);
        }
      }
    });
  }
  if (!isRecord(value.unknownReserve)) {
    errors.push("evaluationSystems.unknownReserve: must be an object");
    return;
  }
  requireEnum(value.unknownReserve.status, "evaluationSystems.unknownReserve.status", UNKNOWN_RESERVE_STATUSES, errors);
  requireString(value.unknownReserve.statement, "evaluationSystems.unknownReserve.statement", errors);
  requireEnum(
    value.unknownReserve.boundary,
    "evaluationSystems.unknownReserve.boundary",
    UNKNOWN_RESERVE_BOUNDARIES,
    errors
  );
  for (const key of Object.keys(value.unknownReserve)) {
    if (!["status", "statement", "boundary"].includes(key)) {
      errors.push(`evaluationSystems.unknownReserve.${key}: unsupported field`);
    }
  }
}

function requireString(value, fieldName, errors, exact) {
  if (typeof value !== "string" || value.length === 0) {
    errors.push(`${fieldName}: must be a non-empty string`);
    return;
  }
  if (exact && value !== exact) {
    errors.push(`${fieldName}: must equal ${exact}`);
  }
}

function requireNullableString(value, fieldName, errors) {
  if (value === null) return;
  if (typeof value !== "string" || value.length === 0) {
    errors.push(`${fieldName}: must be null or a non-empty string`);
  }
}

function requirePattern(value, fieldName, pattern, errors) {
  if (typeof value !== "string" || !pattern.test(value)) {
    errors.push(`${fieldName}: must match ${pattern}`);
  }
}

function requireEnum(value, fieldName, allowed, errors) {
  if (!allowed.has(value)) {
    errors.push(`${fieldName}: must be one of ${[...allowed].join(", ")}`);
  }
}

function isRecord(value) {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype;
}

module.exports = {
  classifyEquilibrium,
  validateOriginRecord,
  validateOriginRecordSet
};
