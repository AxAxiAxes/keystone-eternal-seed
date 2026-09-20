"use strict";

/**
 * A small, dependency-free validator for the JSON Schema subset used by the
 * AXES Directory pilot fixtures in this directory: `type`, `properties`,
 * `required`, `additionalProperties: false`, `enum`, `const`, `minLength`,
 * `pattern`, local `$ref`/`$defs`, and `allOf` clauses shaped as
 * `{ if, then }` where `then` may itself use `required` or `anyOf`.
 *
 * This intentionally does not implement full JSON Schema (no remote $ref,
 * no numeric/array keywords, no oneOf/not). It exists to make the rules
 * already described in prose in docs/AXES_DIRECTORY_DATA_MODEL.md
 * mechanically checkable against the schema files in this directory, not to
 * be a general-purpose schema engine.
 */

function resolveRef(ref, root) {
  if (typeof ref !== "string" || !ref.startsWith("#/")) {
    throw new Error(`Unsupported $ref target: ${JSON.stringify(ref)}`);
  }
  const segments = ref.slice(2).split("/");
  let node = root;
  for (const segment of segments) {
    if (node === undefined || node === null || !(segment in node)) {
      throw new Error(`Unresolvable $ref segment "${segment}" in "${ref}"`);
    }
    node = node[segment];
  }
  return node;
}

function validateValue(schema, value, root, path, errors) {
  if (schema.$ref) {
    validateValue(resolveRef(schema.$ref, root), value, root, path, errors);
    return;
  }

  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${path}: expected constant ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path}: must be one of [${schema.enum.join(", ")}], got ${JSON.stringify(value)}`);
  }

  if (schema.type === "string") {
    if (typeof value !== "string") {
      errors.push(`${path}: must be a string`);
      return;
    }
    if (typeof schema.minLength === "number" && value.length < schema.minLength) {
      errors.push(`${path}: must not be empty`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${path}: must match pattern ${schema.pattern}, got ${JSON.stringify(value)}`);
    }
  } else if (schema.type === "object") {
    validateObject(schema, value, root, path, errors);
  }
}

/**
 * Evaluates a (possibly partial) object schema against a record without
 * accumulating human-readable errors — used to test `if` conditions and
 * `anyOf` branches, where only a boolean match/no-match result is needed.
 */
function schemaMatches(schema, record, root) {
  if (schema.required) {
    for (const field of schema.required) {
      if (record[field] === undefined) return false;
    }
  }
  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (record[key] === undefined) continue;
      const localErrors = [];
      validateValue(propSchema, record[key], root, key, localErrors);
      if (localErrors.length > 0) return false;
    }
  }
  if (schema.anyOf && !schema.anyOf.some((sub) => schemaMatches(sub, record, root))) {
    return false;
  }
  return true;
}

function validateThen(thenSchema, record, root, path, errors) {
  if (thenSchema.required) {
    for (const field of thenSchema.required) {
      if (record[field] === undefined) {
        errors.push(`${path}${field}: required once the matching condition is met`);
      }
    }
  }
  if (thenSchema.anyOf && !thenSchema.anyOf.some((sub) => schemaMatches(sub, record, root))) {
    const described = thenSchema.anyOf.map((sub) => (sub.required || []).join("+")).join(" or ");
    errors.push(`${path}(none): at least one of [${described}] is required once the matching condition is met`);
  }
}

function validateObject(schema, record, root, path, errors) {
  if (typeof record !== "object" || record === null || Array.isArray(record)) {
    errors.push(`${path || "record"}: must be a plain object`);
    return;
  }

  if (schema.additionalProperties === false) {
    const allowed = new Set(Object.keys(schema.properties || {}));
    for (const key of Object.keys(record)) {
      if (!allowed.has(key)) {
        errors.push(`${path}${key}: unrecognized field, not part of the approved schema`);
      }
    }
  }

  if (schema.required) {
    for (const field of schema.required) {
      if (record[field] === undefined) {
        errors.push(`${path}${field}: required field is missing`);
      }
    }
  }

  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (record[key] === undefined) continue;
      validateValue(propSchema, record[key], root, `${path}${key}`, errors);
    }
  }

  if (schema.allOf) {
    for (const clause of schema.allOf) {
      if (!clause.if) continue;
      if (schemaMatches(clause.if, record, root) && clause.then) {
        validateThen(clause.then, record, root, path, errors);
      }
    }
  }
}

/**
 * Validates `record` against `schema` (a parsed JSON Schema document using
 * only the subset described above) and returns an array of human-readable
 * error strings. An empty array means the record is valid.
 */
function validate(schema, record) {
  const errors = [];
  validateValue(schema, record, schema, "", errors);
  return errors;
}

module.exports = { validate };
