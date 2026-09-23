const { createHash, randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const ACCOUNTABILITY_LEDGER_ID = "axi-copilot-accountability-ledger-v1";
const ACCOUNTABILITY_LEDGER_SCHEMA_VERSION = 1;
const ACCOUNTABILITY_LEDGER_FILE_NAME = "accountability-ledger.jsonl";
const ACCOUNTABILITY_LEDGER_NOTICE =
  "Directive-versus-delivery accountability ledger only; repository artifacts, planning, documentation, commits, pull requests, and status claims are not treated as verified success without explicit evidence and human confirmation.";
const EVENT_TYPES = new Set([
  "directive.created",
  "directive.amended",
  "interpretation.recorded",
  "delivery.claimed",
  "evidence.verified",
  "requirement.assessed",
  "outcome.recorded",
  "rating.recorded",
  "resource.recorded"
]);
const ACTOR_TYPES = new Set(["founder", "assistant", "operator", "system"]);
const EVIDENCE_TYPES = new Set([
  "file",
  "commit",
  "pull_request",
  "deployment",
  "url",
  "test_run",
  "screenshot",
  "log",
  "external_action",
  "other"
]);
const DELIVERY_ITEM_TYPES = new Set([
  "file",
  "commit",
  "pull_request",
  "deployment",
  "url",
  "test_run",
  "screenshot",
  "log",
  "external_action",
  "unverified_claim"
]);
const DELIVERY_CLASSES = new Set([
  "repository_artifact",
  "working_outcome",
  "external_action",
  "unverified_claim"
]);
const EVIDENCE_VERIFICATION_STATES = new Set([
  "unverified",
  "verified",
  "disputed",
  "not_applicable"
]);
const REQUIREMENT_STATES = new Set([
  "met",
  "partially_met",
  "not_met",
  "blocked",
  "not_applicable",
  "not_evaluated"
]);
const DEVIATION_TYPES = new Set([
  "scope_expansion",
  "omitted_requirement",
  "changed_technology_provider",
  "changed_repository_branch",
  "unsupported_assumption",
  "unapproved_external_action"
]);
const OUTCOME_STATES = new Set([
  "verified_success",
  "artifact_only",
  "partial",
  "blocked",
  "failed",
  "abandoned",
  "superseded"
]);
const RATING_KINDS = new Set(["founder", "assistant"]);
const RATING_CATEGORIES = [
  "instructionAdherence",
  "accuracy",
  "scopeControl",
  "verification",
  "rework",
  "outcomeFocus"
];
const RESOURCE_ENTRY_TYPES = new Set(["confirmed", "estimated", "unknown"]);

class AccountabilityLedgerService {
  constructor({ directory, now = () => new Date() }) {
    this.directory = directory;
    this.now = now;
    this.operationQueue = Promise.resolve();
  }

  async initialize() {
    try {
      return await this.withExclusiveAccess(async () => {
        await fs.mkdir(this.directory, { recursive: true });
        const events = await this.readEvents();
        validateEvents(events);
        return this.statusFromEvents(events);
      });
    } catch {
      return this.invalidStatus();
    }
  }

  async status() {
    try {
      const events = await this.readEvents();
      validateEvents(events);
      return this.statusFromEvents(events);
    } catch {
      return this.invalidStatus();
    }
  }

  async listEvents(limit = 50) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
      throw new RangeError("limit must be an integer between 1 and 200");
    }
    const events = await this.readEvents();
    validateEvents(events);
    return {
      label: ACCOUNTABILITY_LEDGER_NOTICE,
      events: events.slice(-limit).reverse().map(summarizeEvent)
    };
  }

  async record(input) {
    assertEventInput(input);
    return this.withExclusiveAccess(async () => {
      const events = await this.readEvents();
      validateEvents(events);
      const directiveMap = projectDirectiveMap(events);
      validateEventAgainstProjection(input, directiveMap);
      const previousEvent = events.at(-1);
      const event = createStoredEvent(input, previousEvent, this.now);
      await fs.mkdir(this.directory, { recursive: true });
      await fs.appendFile(this.statePath(), `${JSON.stringify(event)}\n`, "utf8");
      return summarizeEvent(event);
    });
  }

  async listDirectives(filters = {}) {
    assertFilters(filters);
    const directives = filterProjectedDirectives(
      projectDirectives(await this.readValidatedEvents()),
      normalizeFilters(filters)
    );
    return {
      label: ACCOUNTABILITY_LEDGER_NOTICE,
      directives: directives.map(summarizeDirective)
    };
  }

  async summary(filters = {}) {
    assertFilters(filters);
    const directives = filterProjectedDirectives(
      projectDirectives(await this.readValidatedEvents()),
      normalizeFilters(filters)
    );
    return summarizeDirectives(directives);
  }

  async getDirective(directiveId) {
    if (!isDirectiveId(directiveId)) {
      throw new TypeError("directiveId must be a UUID");
    }
    const directives = projectDirectives(await this.readValidatedEvents());
    const directive = directives.find((entry) => entry.id === directiveId);
    if (!directive) {
      throw new RangeError(`directive does not exist: ${directiveId}`);
    }
    return directive;
  }

  async report(directiveId, format = "json") {
    const directive = await this.getDirective(directiveId);
    if (format === "json") {
      return directive;
    }
    if (format === "markdown") {
      return renderDirectiveReportMarkdown(directive);
    }
    throw new RangeError("format must be json or markdown");
  }

  async missingReport(filters = {}) {
    assertFilters(filters);
    const directives = filterProjectedDirectives(
      projectDirectives(await this.readValidatedEvents()),
      normalizeFilters(filters)
    );
    const missingDirection = directives
      .filter((directive) => !directive.directive.verbatimOriginalDirective)
      .map(missingSummary);
    const missingEvidence = directives
      .filter((directive) => directive.missingEvidence)
      .map(missingSummary);
    return {
      label: ACCOUNTABILITY_LEDGER_NOTICE,
      totalDirectives: directives.length,
      missingDirectionCount: missingDirection.length,
      missingEvidenceCount: missingEvidence.length,
      missingDirection,
      missingEvidence
    };
  }

  statusFromEvents(events) {
    const directiveCount = projectDirectives(events).length;
    return {
      status: "ready",
      id: ACCOUNTABILITY_LEDGER_ID,
      schemaVersion: ACCOUNTABILITY_LEDGER_SCHEMA_VERSION,
      eventCount: events.length,
      directiveCount,
      latestEvent: events.length ? summarizeEvent(events.at(-1)) : null,
      label: ACCOUNTABILITY_LEDGER_NOTICE
    };
  }

  invalidStatus() {
    return {
      status: "attention",
      code: "accountability-ledger-invalid",
      expectedId: ACCOUNTABILITY_LEDGER_ID,
      expectedSchemaVersion: ACCOUNTABILITY_LEDGER_SCHEMA_VERSION,
      label: ACCOUNTABILITY_LEDGER_NOTICE
    };
  }

  async withExclusiveAccess(operation) {
    const queuedOperation = this.operationQueue.then(operation);
    this.operationQueue = queuedOperation.catch(() => {});
    return queuedOperation;
  }

  async readValidatedEvents() {
    const events = await this.readEvents();
    validateEvents(events);
    return events;
  }

  async readEvents() {
    try {
      const contents = await fs.readFile(this.statePath(), "utf8");
      return contents.split("\n").filter(Boolean).map((line) => JSON.parse(line));
    } catch (error) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  statePath() {
    return path.join(this.directory, ACCOUNTABILITY_LEDGER_FILE_NAME);
  }
}

function validateEvents(events) {
  if (!Array.isArray(events)) {
    throw new TypeError("accountability ledger must contain an event array");
  }
  const ids = new Set();
  const directives = new Map();
  let previousHash = null;
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    if (
      !event ||
      event.schemaVersion !== ACCOUNTABILITY_LEDGER_SCHEMA_VERSION ||
      !isUuid(event.id) ||
      ids.has(event.id) ||
      event.sequence !== index + 1 ||
      !isIsoTimestamp(event.recordedAt) ||
      !EVENT_TYPES.has(event.eventType) ||
      !isDirectiveId(event.directiveId) ||
      !ACTOR_TYPES.has(event.actor) ||
      typeof event.reconstructed !== "boolean" ||
      typeof event.incomplete !== "boolean" ||
      !isRecord(event.payload) ||
      event.previousHash !== previousHash ||
      !isHash(event.hash) ||
      event.hash !== hashEvent(event)
    ) {
      throw new TypeError("accountability ledger has an invalid event");
    }
    assertEventPayloadShape(event, directives);
    validateEventAgainstProjection(event, directives);
    if (event.eventType === "directive.created") {
      directives.set(event.directiveId, createDirectiveProjection(event));
    } else {
      const directive = directives.get(event.directiveId);
      if (directive) {
        applyEventToDirective(directive, event);
      }
    }
    ids.add(event.id);
    previousHash = event.hash;
  }
}

function assertEventInput(input) {
  if (!isRecord(input)) {
    throw new TypeError("accountability ledger event must be an object");
  }
  const allowedFields = new Set([
    "directiveId",
    "eventType",
    "actor",
    "reconstructed",
    "incomplete",
    "payload"
  ]);
  if (Object.keys(input).some((field) => !allowedFields.has(field))) {
    throw new TypeError("accountability ledger event contains unsupported fields");
  }
  if (!EVENT_TYPES.has(input.eventType)) {
    throw new RangeError("eventType is unsupported");
  }
  if (!isDirectiveId(input.directiveId)) {
    throw new TypeError("directiveId must be a UUID");
  }
  if (!ACTOR_TYPES.has(input.actor)) {
    throw new RangeError("actor is unsupported");
  }
  if (input.reconstructed !== undefined && typeof input.reconstructed !== "boolean") {
    throw new TypeError("reconstructed must be a boolean when provided");
  }
  if (input.incomplete !== undefined && typeof input.incomplete !== "boolean") {
    throw new TypeError("incomplete must be a boolean when provided");
  }
  if (!isRecord(input.payload)) {
    throw new TypeError("payload must be an object");
  }
  assertEventPayloadShape({
    eventType: input.eventType,
    reconstructed: Boolean(input.reconstructed),
    incomplete: Boolean(input.incomplete),
    payload: input.payload,
    directiveId: input.directiveId
  });
}

function validateEventAgainstProjection(input, directiveMap) {
  const directive = directiveMap.get(input.directiveId);
  if (input.eventType === "directive.created") {
    if (directive) {
      throw new RangeError(`directive already exists: ${input.directiveId}`);
    }
    return;
  }
  if (!directive) {
    throw new RangeError(`directive does not exist: ${input.directiveId}`);
  }

  if (input.eventType === "delivery.claimed") {
    const deliveryId = normalizeOptionalUuid(input.payload.deliveryId);
    if (deliveryId && directive.deliveries.some((delivery) => delivery.id === deliveryId)) {
      throw new RangeError(`delivery already exists: ${deliveryId}`);
    }
  }

  if (input.eventType === "evidence.verified") {
    const delivery = directive.deliveries.find((entry) => entry.id === input.payload.deliveryId);
    if (!delivery) {
      throw new RangeError(`delivery does not exist: ${input.payload.deliveryId}`);
    }
    const evidence = delivery.evidence.find((entry) => entry.id === input.payload.evidenceId);
    if (!evidence) {
      throw new RangeError(`evidence does not exist: ${input.payload.evidenceId}`);
    }
  }

  if (input.eventType === "outcome.recorded" && input.payload.state === "verified_success") {
    if (input.payload.humanConfirmed !== true) {
      throw new RangeError("verified_success requires explicit human confirmation");
    }
    const evidenceError = verifiedOutcomeEvidenceError(directive, input.payload.evidenceIds);
    if (evidenceError) {
      throw new RangeError(evidenceError);
    }
  }
}

function createStoredEvent(input, previousEvent, now) {
  const payload = normalizePayload(input.eventType, input.payload, now);
  const event = {
    schemaVersion: ACCOUNTABILITY_LEDGER_SCHEMA_VERSION,
    id: randomUUID(),
    sequence: previousEvent ? previousEvent.sequence + 1 : 1,
    recordedAt: now().toISOString(),
    directiveId: input.directiveId,
    eventType: input.eventType,
    actor: input.actor,
    reconstructed: Boolean(input.reconstructed),
    incomplete: Boolean(input.incomplete),
    payload,
    previousHash: previousEvent ? previousEvent.hash : null
  };
  event.hash = hashEvent(event);
  return event;
}

function normalizePayload(eventType, payload, now) {
  if (eventType === "directive.created") {
    return {
      title: normalizeBoundedText(payload.title, 160),
      directiveTimestamp: normalizeOptionalIso(payload.directiveTimestamp),
      verbatimOriginalDirective:
        payload.verbatimOriginalDirective === null ? null : normalizeLongText(payload.verbatimOriginalDirective, 50_000),
      project: normalizeBoundedText(payload.project, 120),
      repository: normalizeBoundedText(payload.repository, 200),
      branch: normalizeOptionalText(payload.branch, 200),
      taskSessionIdentifier: normalizeOptionalText(payload.taskSessionIdentifier, 200),
      requestedDeliverable:
        payload.requestedDeliverable === null ? null : normalizeLongText(payload.requestedDeliverable, 2_000),
      constraints: normalizeStringArray(payload.constraints, 500),
      deadline: normalizeOptionalText(payload.deadline, 120),
      budgetTimeCap: normalizeOptionalText(payload.budgetTimeCap, 200),
      dependencies: normalizeStringArray(payload.dependencies, 500),
      definitionOfDone:
        payload.definitionOfDone === null ? null : normalizeLongText(payload.definitionOfDone, 4_000),
      subrequirements: normalizeRequirementInputs(payload.subrequirements),
      sourceReference: normalizeOptionalText(payload.sourceReference, 500)
    };
  }
  if (eventType === "directive.amended") {
    return {
      amendmentText: normalizeLongText(payload.amendmentText, 8_000),
      sourceReference: normalizeBoundedText(payload.sourceReference, 500),
      supersedesInstructions: normalizeStringArray(payload.supersedesInstructions, 500),
      subrequirementsAdded: normalizeRequirementInputs(payload.subrequirementsAdded || []),
      constraintsAdded: normalizeStringArray(payload.constraintsAdded, 500),
      deadline: normalizeOptionalText(payload.deadline, 120),
      budgetTimeCap: normalizeOptionalText(payload.budgetTimeCap, 200),
      definitionOfDone:
        payload.definitionOfDone === undefined || payload.definitionOfDone === null
          ? null
          : normalizeLongText(payload.definitionOfDone, 4_000)
    };
  }
  if (eventType === "interpretation.recorded") {
    return {
      interpretation: normalizeLongText(payload.interpretation, 8_000),
      checklistMapping: normalizeChecklistMapping(payload.checklistMapping || [])
    };
  }
  if (eventType === "delivery.claimed") {
    return {
      deliveryId: normalizeOptionalUuid(payload.deliveryId) || randomUUID(),
      summary: normalizeLongText(payload.summary, 4_000),
      claimedCompletion: Boolean(payload.claimedCompletion),
      items: normalizeDeliveryItems(payload.items),
      evidence: normalizeEvidenceItems(payload.evidence || [], now),
      sourceReference: normalizeOptionalText(payload.sourceReference, 500)
    };
  }
  if (eventType === "evidence.verified") {
    return {
      deliveryId: normalizeRequiredUuid(payload.deliveryId, "deliveryId"),
      evidenceId: normalizeRequiredUuid(payload.evidenceId, "evidenceId"),
      verificationState: normalizeEnum(
        payload.verificationState,
        EVIDENCE_VERIFICATION_STATES,
        "verificationState"
      ),
      verifier: normalizeBoundedText(payload.verifier, 200),
      timestamp: normalizeOptionalIso(payload.timestamp) || now().toISOString(),
      notes: normalizeOptionalText(payload.notes, 1_000)
    };
  }
  if (eventType === "requirement.assessed") {
    return {
      requirementId: normalizeRequirementId(payload.requirementId),
      status: normalizeEnum(payload.status, REQUIREMENT_STATES, "status"),
      explanation: normalizeOptionalText(payload.explanation, 4_000),
      evidenceIds: normalizeUuidArray(payload.evidenceIds || [], "evidenceIds"),
      deviations: normalizeDeviations(payload.deviations || [])
    };
  }
  if (eventType === "outcome.recorded") {
    if (payload.humanConfirmed !== undefined && typeof payload.humanConfirmed !== "boolean") {
      throw new TypeError("humanConfirmed must be a boolean when provided");
    }
    return {
      state: normalizeEnum(payload.state, OUTCOME_STATES, "state"),
      explanation: normalizeLongText(payload.explanation, 4_000),
      humanConfirmed: payload.humanConfirmed === true,
      confirmedBy: normalizeOptionalText(payload.confirmedBy, 200),
      evidenceIds: normalizeUuidArray(payload.evidenceIds || [], "evidenceIds")
    };
  }
  if (eventType === "rating.recorded") {
    return {
      kind: normalizeEnum(payload.kind, RATING_KINDS, "kind"),
      overall: normalizeRating(payload.overall, "overall"),
      categories: normalizeRatingCategories(payload.categories),
      notes: normalizeOptionalText(payload.notes, 4_000)
    };
  }
  if (eventType === "resource.recorded") {
    return normalizeResourceEntry(payload);
  }
  return payload;
}

function assertEventPayloadShape(event, directiveMap = new Map()) {
  const { eventType, payload, reconstructed } = event;
  if (eventType === "directive.created") {
    assertDirectiveCreatedPayload(payload, reconstructed);
    return;
  }
  if (eventType === "directive.amended") {
    normalizePayload(eventType, payload, () => new Date());
    return;
  }
  if (eventType === "interpretation.recorded") {
    normalizePayload(eventType, payload, () => new Date());
    return;
  }
  if (eventType === "delivery.claimed") {
    normalizePayload(eventType, payload, () => new Date());
    return;
  }
  if (eventType === "evidence.verified") {
    normalizePayload(eventType, payload, () => new Date());
    return;
  }
  if (eventType === "requirement.assessed") {
    const normalized = normalizePayload(eventType, payload, () => new Date());
    if (
      ["partially_met", "not_met", "blocked"].includes(normalized.status) &&
      !normalized.explanation
    ) {
      throw new TypeError("partial, not_met, and blocked requirement states require an explanation");
    }
    return;
  }
  if (eventType === "outcome.recorded") {
    const normalized = normalizePayload(eventType, payload, () => new Date());
    if (normalized.state === "verified_success") {
      if (!normalized.humanConfirmed || !normalized.confirmedBy || normalized.evidenceIds.length === 0) {
        throw new RangeError("verified_success requires humanConfirmed, confirmedBy, and evidenceIds");
      }
    }
    return;
  }
  if (eventType === "rating.recorded") {
    normalizePayload(eventType, payload, () => new Date());
    return;
  }
  if (eventType === "resource.recorded") {
    normalizePayload(eventType, payload, () => new Date());
    return;
  }
  const directive = directiveMap.get(event.directiveId);
  if (!directive && eventType !== "directive.created") {
    throw new RangeError(`directive does not exist: ${event.directiveId}`);
  }
}

function assertDirectiveCreatedPayload(payload, reconstructed) {
  const normalized = normalizePayload("directive.created", payload, () => new Date());
  if (!reconstructed && !normalized.verbatimOriginalDirective) {
    throw new TypeError("verbatimOriginalDirective is required unless the entry is reconstructed");
  }
  if (!reconstructed && !normalized.requestedDeliverable) {
    throw new TypeError("requestedDeliverable is required unless the entry is reconstructed");
  }
  if (!reconstructed && !normalized.definitionOfDone) {
    throw new TypeError("definitionOfDone is required unless the entry is reconstructed");
  }
}

function projectDirectiveMap(events) {
  const directives = projectDirectives(events);
  return new Map(directives.map((directive) => [directive.id, directive]));
}

function projectDirectives(events) {
  const directives = new Map();
  for (const event of events) {
    if (event.eventType === "directive.created") {
      directives.set(event.directiveId, createDirectiveProjection(event));
      continue;
    }
    const directive = directives.get(event.directiveId);
    if (!directive) continue;
    applyEventToDirective(directive, event);
  }
  return [...directives.values()]
    .map(finalizeDirective)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function createDirectiveProjection(event) {
  const payload = event.payload;
  const subrequirements = payload.subrequirements.map((requirement) => ({
    ...requirement,
    createdAt: event.recordedAt
  }));
  return {
    id: event.directiveId,
    createdAt: event.recordedAt,
    latestUpdatedAt: event.recordedAt,
    reconstructed: event.reconstructed,
    incomplete: event.incomplete,
    title: payload.title || payload.requestedDeliverable || defaultDirectiveTitle(payload.verbatimOriginalDirective),
    directive: {
      directiveTimestamp: payload.directiveTimestamp || event.recordedAt,
      verbatimOriginalDirective: payload.verbatimOriginalDirective,
      project: payload.project,
      repository: payload.repository,
      branch: payload.branch,
      taskSessionIdentifier: payload.taskSessionIdentifier,
      requestedDeliverable: payload.requestedDeliverable,
      constraints: [...payload.constraints],
      deadline: payload.deadline,
      budgetTimeCap: payload.budgetTimeCap,
      dependencies: [...payload.dependencies],
      definitionOfDone: payload.definitionOfDone,
      subrequirements,
      sourceReference: payload.sourceReference
    },
    amendments: [],
    interpretations: [],
    deliveries: [],
    requirementAssessments: [],
    outcomes: [],
    ratings: [],
    resources: [],
    history: [summarizeEvent(event)]
  };
}

function applyEventToDirective(directive, event) {
  directive.latestUpdatedAt = event.recordedAt;
  directive.reconstructed = directive.reconstructed || event.reconstructed;
  directive.incomplete = directive.incomplete || event.incomplete;
  directive.history.push(summarizeEvent(event));

  if (event.eventType === "directive.amended") {
    directive.amendments.push({
      recordedAt: event.recordedAt,
      actor: event.actor,
      ...event.payload
    });
    if (event.payload.subrequirementsAdded.length > 0) {
      for (const requirement of event.payload.subrequirementsAdded) {
        directive.directive.subrequirements.push({
          ...requirement,
          createdAt: event.recordedAt
        });
      }
    }
    directive.directive.constraints.push(...event.payload.constraintsAdded);
    if (event.payload.deadline) directive.directive.deadline = event.payload.deadline;
    if (event.payload.budgetTimeCap) directive.directive.budgetTimeCap = event.payload.budgetTimeCap;
    if (event.payload.definitionOfDone !== null) {
      directive.directive.definitionOfDone = event.payload.definitionOfDone;
    }
    return;
  }

  if (event.eventType === "interpretation.recorded") {
    directive.interpretations.push({
      recordedAt: event.recordedAt,
      actor: event.actor,
      ...event.payload
    });
    return;
  }

  if (event.eventType === "delivery.claimed") {
    directive.deliveries.push({
      id: event.payload.deliveryId,
      recordedAt: event.recordedAt,
      actor: event.actor,
      summary: event.payload.summary,
      claimedCompletion: event.payload.claimedCompletion,
      items: event.payload.items.map((item) => ({ ...item })),
      evidence: event.payload.evidence.map((item) => ({ ...item })),
      sourceReference: event.payload.sourceReference
    });
    return;
  }

  if (event.eventType === "evidence.verified") {
    const delivery = directive.deliveries.find((entry) => entry.id === event.payload.deliveryId);
    if (!delivery) return;
    const evidence = delivery.evidence.find((entry) => entry.id === event.payload.evidenceId);
    if (!evidence) return;
    evidence.verificationState = event.payload.verificationState;
    evidence.verifier = event.payload.verifier;
    evidence.verifiedAt = event.payload.timestamp;
    evidence.verificationNotes = event.payload.notes || null;
    return;
  }

  if (event.eventType === "requirement.assessed") {
    directive.requirementAssessments.push({
      recordedAt: event.recordedAt,
      actor: event.actor,
      ...event.payload
    });
    return;
  }

  if (event.eventType === "outcome.recorded") {
    directive.outcomes.push({
      recordedAt: event.recordedAt,
      actor: event.actor,
      ...event.payload
    });
    return;
  }

  if (event.eventType === "rating.recorded") {
    directive.ratings.push({
      recordedAt: event.recordedAt,
      actor: event.actor,
      ...event.payload
    });
    return;
  }

  if (event.eventType === "resource.recorded") {
    directive.resources.push({
      recordedAt: event.recordedAt,
      actor: event.actor,
      ...event.payload
    });
  }
}

function finalizeDirective(directive) {
  const projected = {
    ...directive,
    directive: {
      ...directive.directive,
      constraints: uniqueStrings(directive.directive.constraints),
      dependencies: uniqueStrings(directive.directive.dependencies),
      subrequirements: directive.directive.subrequirements.map((requirement) =>
        finalizeRequirement(requirement, directive.requirementAssessments))
    }
  };
  projected.currentOutcome = projected.outcomes.at(-1) || null;
  projected.founderRating = latestRating(projected.ratings, "founder");
  projected.assistantSelfAssessment = latestRating(projected.ratings, "assistant");
  projected.metrics = summarizeResourceMetrics(projected.resources);
  projected.deliveryCounts = summarizeDeliveryCounts(projected.deliveries);
  projected.reworkCycles = Math.max(0, projected.deliveries.length - 1);
  projected.unsupportedCompletionClaims = projected.deliveries.filter((delivery) =>
    delivery.claimedCompletion && !delivery.evidence.some((item) => item.verificationState === "verified")
  ).length;
  projected.evidenceBackedCompletion = Boolean(
    projected.currentOutcome &&
    projected.currentOutcome.state === "verified_success" &&
    projected.currentOutcome.humanConfirmed === true &&
    projected.currentOutcome.confirmedBy &&
    verifiedOutcomeEvidenceError(projected, projected.currentOutcome.evidenceIds) === null
  );
  projected.timeToVerifiableOutcomeHours = computeTimeToVerifiableOutcomeHours(projected);
  projected.currentStatus = deriveDirectiveStatus(projected);
  projected.missingDirection = !projected.directive.verbatimOriginalDirective;
  projected.missingEvidence = hasMissingEvidence(projected);
  return projected;
}

function finalizeRequirement(requirement, assessments) {
  const history = assessments.filter((entry) => entry.requirementId === requirement.id);
  const latest = history.at(-1);
  return {
    ...requirement,
    currentStatus: latest ? latest.status : "not_evaluated",
    latestExplanation: latest ? latest.explanation || null : null,
    evidenceIds: latest ? [...latest.evidenceIds] : [],
    deviations: latest ? latest.deviations.map((entry) => ({ ...entry })) : [],
    history: history.map((entry) => ({
      recordedAt: entry.recordedAt,
      actor: entry.actor,
      status: entry.status,
      explanation: entry.explanation || null,
      evidenceIds: [...entry.evidenceIds],
      deviations: entry.deviations.map((item) => ({ ...item }))
    }))
  };
}

function summarizeDirectives(directives) {
  const founderRatingTrend = directives
    .flatMap((directive) =>
      directive.ratings
        .filter((rating) => rating.kind === "founder")
        .map((rating) => ({ directiveId: directive.id, recordedAt: rating.recordedAt, overall: rating.overall }))
    )
    .sort((left, right) => left.recordedAt.localeCompare(right.recordedAt));
  const requirementStatuses = directives
    .flatMap((directive) => directive.directive.subrequirements.map((item) => item.currentStatus))
    .filter(Boolean);
  const metCount = requirementStatuses.filter((status) => status === "met").length;
  const evaluatedCount = requirementStatuses.filter((status) => status !== "not_evaluated").length;
  const provenCostCents = directives.reduce(
    (total, directive) => total + directive.metrics.provenCostCents,
    0
  );
  const estimatedLow = directives.reduce(
    (total, directive) => total + directive.metrics.estimatedExposureLowCents,
    0
  );
  const estimatedHigh = directives.reduce(
    (total, directive) => total + directive.metrics.estimatedExposureHighCents,
    0
  );
  return {
    label: ACCOUNTABILITY_LEDGER_NOTICE,
    totalDirectives: directives.length,
    verifiedSuccesses: directives.filter((directive) => directive.evidenceBackedCompletion).length,
    artifactOnlyCount: directives.filter((directive) => directive.currentStatus === "artifact_only").length,
    partialBlockedFailedCount: directives.filter((directive) =>
      ["partial", "blocked", "failed"].includes(directive.currentStatus)
    ).length,
    adherenceRate: evaluatedCount ? Math.round((metCount / evaluatedCount) * 100) : null,
    evidenceBackedCompletionRate: directives.length
      ? Math.round((directives.filter((directive) => directive.evidenceBackedCompletion).length / directives.length) * 100)
      : null,
    reworkCount: directives.reduce((total, directive) => total + directive.reworkCycles, 0),
    provenCostCents,
    estimatedExposureLowCents: estimatedLow,
    estimatedExposureHighCents: estimatedHigh,
    founderRatingTrend
  };
}

function summarizeDirective(directive) {
  return {
    directiveId: directive.id,
    title: directive.title,
    project: directive.directive.project,
    repository: directive.directive.repository,
    branch: directive.directive.branch,
    createdAt: directive.createdAt,
    currentStatus: directive.currentStatus,
    outcomeState: directive.currentOutcome ? directive.currentOutcome.state : null,
    founderRating: directive.founderRating ? directive.founderRating.overall : null,
    assistantSelfAssessment: directive.assistantSelfAssessment
      ? directive.assistantSelfAssessment.overall
      : null,
    verifiedEvidenceCount: countVerifiedEvidence(directive),
    deliveryCount: directive.deliveries.length,
    reworkCycles: directive.reworkCycles,
    provenCostCents: directive.metrics.provenCostCents,
    estimatedExposureLowCents: directive.metrics.estimatedExposureLowCents,
    estimatedExposureHighCents: directive.metrics.estimatedExposureHighCents,
    missingDirection: directive.missingDirection,
    missingEvidence: directive.missingEvidence,
    reconstructed: directive.reconstructed,
    incomplete: directive.incomplete,
    verbatimExcerpt: directive.directive.verbatimOriginalDirective
      ? directive.directive.verbatimOriginalDirective.slice(0, 200)
      : null
  };
}

function summarizeEvent(event) {
  return {
    id: event.id,
    sequence: event.sequence,
    recordedAt: event.recordedAt,
    directiveId: event.directiveId,
    eventType: event.eventType,
    actor: event.actor,
    reconstructed: event.reconstructed,
    incomplete: event.incomplete,
    payload: event.payload,
    previousHash: event.previousHash,
    hash: event.hash
  };
}

function summarizeResourceMetrics(resources) {
  let founderConfirmedHours = 0;
  let assistantSessionElapsedHours = 0;
  let provenCostCents = 0;
  let estimatedLow = 0;
  let estimatedHigh = 0;

  for (const entry of resources) {
    assistantSessionElapsedHours += entry.assistantSessionElapsedHours || 0;
    if (entry.entryType === "confirmed") {
      founderConfirmedHours += entry.founderConfirmedHours || 0;
      provenCostCents += entry.directCostCents || 0;
      provenCostCents += entry.opportunityCostCents || 0;
      provenCostCents += entry.reworkCostCents || 0;
      if (entry.founderConfirmedHours && entry.hourlyValueCents) {
        provenCostCents += Math.round(entry.founderConfirmedHours * entry.hourlyValueCents);
      }
    }
    if (entry.entryType === "estimated") {
      estimatedLow += entry.estimatedCostLowCents || 0;
      estimatedHigh += entry.estimatedCostHighCents || 0;
    }
  }

  return {
    founderConfirmedHours,
    assistantSessionElapsedHours,
    provenCostCents,
    estimatedExposureLowCents: estimatedLow,
    estimatedExposureHighCents: estimatedHigh
  };
}

function summarizeDeliveryCounts(deliveries) {
  const counts = {};
  for (const delivery of deliveries) {
    for (const item of delivery.items) {
      counts[item.type] = (counts[item.type] || 0) + 1;
    }
  }
  return counts;
}

function latestRating(ratings, kind) {
  const filtered = ratings.filter((entry) => entry.kind === kind);
  return filtered.at(-1) || null;
}

function computeTimeToVerifiableOutcomeHours(directive) {
  if (!directive.evidenceBackedCompletion) return null;
  const success = directive.currentOutcome;
  const milliseconds = Date.parse(success.recordedAt) - Date.parse(directive.createdAt);
  return Number.isFinite(milliseconds) ? Number((milliseconds / 3_600_000).toFixed(2)) : null;
}

function deriveDirectiveStatus(directive) {
  if (directive.currentOutcome?.state === "verified_success" && !directive.evidenceBackedCompletion) {
    return "blocked";
  }
  if (directive.currentOutcome) return directive.currentOutcome.state;
  const statuses = directive.directive.subrequirements.map((entry) => entry.currentStatus);
  if (statuses.includes("blocked")) return "blocked";
  if (statuses.includes("not_met")) return "not_met";
  if (statuses.includes("partially_met")) return "partially_met";
  if (statuses.every((status) => status === "met") && statuses.length > 0) return "met";
  return "not_evaluated";
}

function hasMissingEvidence(directive) {
  const claimedCompletionMissingEvidence = directive.deliveries.some(
    (delivery) => delivery.claimedCompletion && delivery.evidence.length === 0
  );
  if (directive.currentOutcome?.state === "verified_success") {
    const outcomeEvidenceMissing =
      verifiedOutcomeEvidenceError(directive, directive.currentOutcome.evidenceIds) !== null;
    return claimedCompletionMissingEvidence || outcomeEvidenceMissing;
  }
  return claimedCompletionMissingEvidence;
}

function verifiedOutcomeEvidenceError(directive, evidenceIds) {
  if (!Array.isArray(evidenceIds) || evidenceIds.length === 0) {
    return "verified_success requires explicit evidence";
  }
  const evidenceIndex = buildEvidenceIndex(directive);
  for (const evidenceId of evidenceIds) {
    const evidence = evidenceIndex.get(evidenceId);
    if (!evidence) {
      return `verified_success evidence does not exist: ${evidenceId}`;
    }
    if (evidence.verificationState !== "verified") {
      return "verified_success evidence must already be marked verified";
    }
  }
  return null;
}

function countVerifiedEvidence(directive) {
  return directive.deliveries.reduce(
    (count, delivery) =>
      count + delivery.evidence.filter((item) => item.verificationState === "verified").length,
    0
  );
}

function buildEvidenceIndex(directive) {
  const evidence = new Map();
  for (const delivery of directive.deliveries) {
    for (const item of delivery.evidence) {
      evidence.set(item.id, item);
    }
  }
  return evidence;
}

function renderDirectiveReportMarkdown(directive) {
  const founderRating = directive.founderRating
    ? `${directive.founderRating.overall}`
    : "Not recorded";
  const assistantRating = directive.assistantSelfAssessment
    ? `${directive.assistantSelfAssessment.overall}`
    : "Not recorded";
  const subrequirements = directive.directive.subrequirements.length
    ? directive.directive.subrequirements
      .map((item) =>
        `- **${item.id}** — ${item.text} *(status: ${item.currentStatus})*${item.latestExplanation ? ` — ${item.latestExplanation}` : ""}`
      )
      .join("\n")
    : "- None recorded";
  const deliveries = directive.deliveries.length
    ? directive.deliveries.map((delivery) => {
      const items = delivery.items.map((item) =>
        `  - ${item.type} (${item.deliveryClass}): ${item.label}${item.locator ? ` — ${item.locator}` : ""}`
      ).join("\n") || "  - None";
      const evidence = delivery.evidence.map((item) =>
        `  - ${item.type}: ${item.locator} *(state: ${item.verificationState}, verifier: ${item.verifier || "none"})*`
      ).join("\n") || "  - None";
      return `- **${delivery.summary}**${delivery.claimedCompletion ? " *(claimed completion)*" : ""}\n${items}\n  - Evidence:\n${evidence}`;
    }).join("\n")
    : "- None recorded";
  const deviations = directive.directive.subrequirements.flatMap((item) =>
    item.deviations.map((deviation) =>
      `- ${item.id}: ${deviation.type} — ${deviation.description}`
    )
  );
  const resourceLines = directive.resources.length
    ? directive.resources.map((entry) => {
      if (entry.entryType === "confirmed") {
        return `- confirmed: founder hours=${entry.founderConfirmedHours ?? "n/a"}, session hours=${entry.assistantSessionElapsedHours ?? "n/a"}, hourly value cents=${entry.hourlyValueCents ?? "n/a"}, direct cost cents=${entry.directCostCents ?? "n/a"}, opportunity cost cents=${entry.opportunityCostCents ?? "n/a"}, rework cost cents=${entry.reworkCostCents ?? "n/a"}${entry.notes ? ` — ${entry.notes}` : ""}`;
      }
      if (entry.entryType === "estimated") {
        return `- estimated: cost range cents=${entry.estimatedCostLowCents}-${entry.estimatedCostHighCents}, session hours=${entry.assistantSessionElapsedHours ?? "n/a"}${entry.notes ? ` — ${entry.notes}` : ""}`;
      }
      return `- unknown: session hours=${entry.assistantSessionElapsedHours ?? "n/a"}${entry.notes ? ` — ${entry.notes}` : ""}`;
    }).join("\n")
    : "- None recorded";

  return [
    `# Copilot accountability audit — ${directive.title}`,
    "",
    `- Directive ID: \`${directive.id}\``,
    `- Created: ${directive.createdAt}`,
    `- Project: ${directive.directive.project}`,
    `- Repository: ${directive.directive.repository}`,
    `- Branch: ${directive.directive.branch || "Not recorded"}`,
    `- Current status: ${directive.currentStatus}`,
    `- Latest recorded outcome: ${directive.currentOutcome ? directive.currentOutcome.state : "Not recorded"}`,
    `- Current evidence-backed completion: ${directive.evidenceBackedCompletion ? "yes" : "no"}`,
    `- Founder rating: ${founderRating}`,
    `- Assistant self-assessment: ${assistantRating}`,
    `- Proven cost (cents): ${directive.metrics.provenCostCents}`,
    `- Estimated exposure range (cents): ${directive.metrics.estimatedExposureLowCents}-${directive.metrics.estimatedExposureHighCents}`,
    "",
    "## Founder direction (verbatim)",
    "",
    directive.directive.verbatimOriginalDirective || "_Missing exact directive text; reconstructed/incomplete entry._",
    "",
    "## Requested deliverable and definition of done",
    "",
    `- Requested deliverable: ${directive.directive.requestedDeliverable || "Not recorded"}`,
    `- Definition of done: ${directive.directive.definitionOfDone || "Not recorded"}`,
    "",
    "## Subrequirements",
    "",
    subrequirements,
    "",
    "## Agent interpretation",
    "",
    directive.interpretations.length
      ? directive.interpretations.map((entry) => `- ${entry.recordedAt}: ${entry.interpretation}`).join("\n")
      : "- None recorded",
    "",
    "## Actual delivery",
    "",
    deliveries,
    "",
    "## Deviations",
    "",
    deviations.length ? deviations.join("\n") : "- None recorded",
    "",
    "## Recorded outcome history",
    "",
    directive.outcomes.length
      ? directive.outcomes.map((outcome) =>
        `- ${outcome.recordedAt}: ${outcome.state} — ${outcome.explanation}`
      ).join("\n")
      : "- No outcome recorded",
    "",
    "## Loss / resource ledger",
    "",
    resourceLines,
    "",
    "## Missing evidence / missing direction",
    "",
    `- Missing direction: ${directive.missingDirection ? "yes" : "no"}`,
    `- Missing evidence: ${directive.missingEvidence ? "yes" : "no"}`
  ].join("\n");
}

function missingSummary(directive) {
  return {
    directiveId: directive.id,
    title: directive.title,
    project: directive.directive.project,
    repository: directive.directive.repository,
    currentStatus: directive.currentStatus,
    outcomeState: directive.currentOutcome ? directive.currentOutcome.state : null,
    reconstructed: directive.reconstructed,
    incomplete: directive.incomplete
  };
}

function filterProjectedDirectives(directives, filters) {
  return directives.filter((directive) => {
    if (filters.project && directive.directive.project !== filters.project) return false;
    if (filters.repository && directive.directive.repository !== filters.repository) return false;
    if (filters.outcome && directive.currentOutcome?.state !== filters.outcome) return false;
    if (filters.status && directive.currentStatus !== filters.status) return false;
    if (filters.ratingMin !== null) {
      const rating = directive.founderRating?.overall;
      if (rating === undefined || rating === null || rating < filters.ratingMin) return false;
    }
    if (filters.from && directive.createdAt < filters.from) return false;
    if (filters.to && directive.createdAt > filters.to) return false;
    if (filters.search) {
      const haystack = [
        directive.title,
        directive.directive.project,
        directive.directive.repository,
        directive.directive.branch,
        directive.directive.requestedDeliverable,
        directive.directive.verbatimOriginalDirective,
        directive.directive.definitionOfDone
      ]
        .filter(Boolean)
        .join("\n")
        .toLowerCase();
      if (!haystack.includes(filters.search.toLowerCase())) return false;
    }
    return true;
  });
}

function hashEvent(event) {
  return createHash("sha256").update(JSON.stringify({
    schemaVersion: event.schemaVersion,
    id: event.id,
    sequence: event.sequence,
    recordedAt: event.recordedAt,
    directiveId: event.directiveId,
    eventType: event.eventType,
    actor: event.actor,
    reconstructed: event.reconstructed,
    incomplete: event.incomplete,
    payload: event.payload,
    previousHash: event.previousHash
  })).digest("hex");
}

function normalizeRequirementInputs(value) {
  if (!Array.isArray(value)) {
    throw new TypeError("subrequirements must be an array");
  }
  return value.map((entry) => {
    if (!isRecord(entry)) {
      throw new TypeError("subrequirements must contain objects");
    }
    if (Object.keys(entry).some((field) => !["id", "text"].includes(field))) {
      throw new TypeError("subrequirements contain unsupported fields");
    }
    return {
      id: normalizeRequirementId(entry.id || slugifyRequirement(entry.text)),
      text: normalizeLongText(entry.text, 1_000)
    };
  });
}

function normalizeChecklistMapping(value) {
  if (!Array.isArray(value)) {
    throw new TypeError("checklistMapping must be an array");
  }
  return value.map((entry) => {
    if (!isRecord(entry)) throw new TypeError("checklistMapping must contain objects");
    if (Object.keys(entry).some((field) => !["requirementId", "interpretation"].includes(field))) {
      throw new TypeError("checklistMapping contains unsupported fields");
    }
    return {
      requirementId: normalizeRequirementId(entry.requirementId),
      interpretation: normalizeLongText(entry.interpretation, 2_000)
    };
  });
}

function normalizeDeliveryItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new TypeError("delivery items must be a non-empty array");
  }
  return items.map((item) => {
    if (!isRecord(item)) throw new TypeError("delivery items must contain objects");
    if (Object.keys(item).some((field) => !["id", "type", "deliveryClass", "label", "locator", "notes"].includes(field))) {
      throw new TypeError("delivery items contain unsupported fields");
    }
    return {
      id: normalizeOptionalUuid(item.id) || randomUUID(),
      type: normalizeEnum(item.type, DELIVERY_ITEM_TYPES, "delivery item type"),
      deliveryClass: normalizeEnum(item.deliveryClass, DELIVERY_CLASSES, "deliveryClass"),
      label: normalizeBoundedText(item.label, 500),
      locator: normalizeOptionalText(item.locator, 500),
      notes: normalizeOptionalText(item.notes, 1_000)
    };
  });
}

function normalizeEvidenceItems(items, now) {
  if (!Array.isArray(items)) {
    throw new TypeError("evidence must be an array");
  }
  return items.map((item) => {
    if (!isRecord(item)) throw new TypeError("evidence must contain objects");
    if (Object.keys(item).some((field) => !["id", "type", "locator", "verificationState", "verifier", "timestamp", "notes"].includes(field))) {
      throw new TypeError("evidence contains unsupported fields");
    }
    return {
      id: normalizeOptionalUuid(item.id) || randomUUID(),
      type: normalizeEnum(item.type, EVIDENCE_TYPES, "evidence type"),
      locator: normalizeBoundedText(item.locator, 500),
      verificationState: normalizeEnum(
        item.verificationState || "unverified",
        EVIDENCE_VERIFICATION_STATES,
        "verificationState"
      ),
      verifier: normalizeOptionalText(item.verifier, 200),
      timestamp: normalizeOptionalIso(item.timestamp) || now().toISOString(),
      notes: normalizeOptionalText(item.notes, 1_000)
    };
  });
}

function normalizeDeviations(value) {
  if (!Array.isArray(value)) {
    throw new TypeError("deviations must be an array");
  }
  return value.map((entry) => {
    if (!isRecord(entry)) throw new TypeError("deviations must contain objects");
    if (Object.keys(entry).some((field) => !["type", "description"].includes(field))) {
      throw new TypeError("deviations contain unsupported fields");
    }
    return {
      type: normalizeEnum(entry.type, DEVIATION_TYPES, "deviation type"),
      description: normalizeLongText(entry.description, 2_000)
    };
  });
}

function normalizeRatingCategories(value) {
  if (!isRecord(value)) {
    throw new TypeError("rating categories must be an object");
  }
  const categories = {};
  for (const category of RATING_CATEGORIES) {
    categories[category] = normalizeRating(value[category], category);
  }
  if (Object.keys(value).some((key) => !RATING_CATEGORIES.includes(key))) {
    throw new TypeError("rating categories contain unsupported fields");
  }
  return categories;
}

function normalizeResourceEntry(value) {
  if (!isRecord(value)) {
    throw new TypeError("resource entry must be an object");
  }
  const entryType = normalizeEnum(value.entryType, RESOURCE_ENTRY_TYPES, "entryType");
  if (entryType === "confirmed") {
    const allowed = new Set([
      "entryType",
      "founderConfirmedHours",
      "assistantSessionElapsedHours",
      "hourlyValueCents",
      "directCostCents",
      "opportunityCostCents",
      "reworkCostCents",
      "notes"
    ]);
    if (Object.keys(value).some((field) => !allowed.has(field))) {
      throw new TypeError("confirmed resource entry contains unsupported fields");
    }
    return {
      entryType,
      founderConfirmedHours: normalizeOptionalPositiveNumber(value.founderConfirmedHours, "founderConfirmedHours"),
      assistantSessionElapsedHours: normalizeOptionalPositiveNumber(
        value.assistantSessionElapsedHours,
        "assistantSessionElapsedHours"
      ),
      hourlyValueCents: normalizeOptionalNonNegativeInteger(value.hourlyValueCents, "hourlyValueCents"),
      directCostCents: normalizeOptionalNonNegativeInteger(value.directCostCents, "directCostCents"),
      opportunityCostCents: normalizeOptionalNonNegativeInteger(
        value.opportunityCostCents,
        "opportunityCostCents"
      ),
      reworkCostCents: normalizeOptionalNonNegativeInteger(value.reworkCostCents, "reworkCostCents"),
      notes: normalizeOptionalText(value.notes, 2_000)
    };
  }

  if (entryType === "estimated") {
    const allowed = new Set([
      "entryType",
      "assistantSessionElapsedHours",
      "estimatedCostLowCents",
      "estimatedCostHighCents",
      "notes"
    ]);
    if (Object.keys(value).some((field) => !allowed.has(field))) {
      throw new TypeError("estimated resource entry contains unsupported fields");
    }
    const estimatedCostLowCents = normalizeOptionalNonNegativeInteger(
      value.estimatedCostLowCents,
      "estimatedCostLowCents"
    );
    const estimatedCostHighCents = normalizeOptionalNonNegativeInteger(
      value.estimatedCostHighCents,
      "estimatedCostHighCents"
    );
    if (
      estimatedCostLowCents !== null &&
      estimatedCostHighCents !== null &&
      estimatedCostHighCents < estimatedCostLowCents
    ) {
      throw new RangeError("estimatedCostHighCents must be greater than or equal to estimatedCostLowCents");
    }
    return {
      entryType,
      assistantSessionElapsedHours: normalizeOptionalPositiveNumber(
        value.assistantSessionElapsedHours,
        "assistantSessionElapsedHours"
      ),
      estimatedCostLowCents,
      estimatedCostHighCents,
      notes: normalizeOptionalText(value.notes, 2_000)
    };
  }

  const allowed = new Set(["entryType", "assistantSessionElapsedHours", "notes"]);
  if (Object.keys(value).some((field) => !allowed.has(field))) {
    throw new TypeError("unknown resource entry contains unsupported fields");
  }
  return {
    entryType,
    assistantSessionElapsedHours: normalizeOptionalPositiveNumber(
      value.assistantSessionElapsedHours,
      "assistantSessionElapsedHours"
    ),
    notes: normalizeOptionalText(value.notes, 2_000)
  };
}

function assertFilters(filters) {
  if (!isRecord(filters)) {
    throw new TypeError("filters must be an object");
  }
}

function normalizeFilters(filters) {
  const ratingMin = typeof filters.ratingMin === "string" && /^-?\d+$/.test(filters.ratingMin)
    ? Number(filters.ratingMin)
    : filters.ratingMin;
  return {
    project: normalizeOptionalText(filters.project, 120),
    repository: normalizeOptionalText(filters.repository, 200),
    from: normalizeOptionalIso(filters.from),
    to: normalizeOptionalIso(filters.to),
    outcome: filters.outcome === undefined || filters.outcome === null
      ? null
      : normalizeEnum(filters.outcome, OUTCOME_STATES, "outcome"),
    status: filters.status === undefined || filters.status === null
      ? null
      : normalizeOptionalText(filters.status, 120),
    ratingMin: ratingMin === undefined || ratingMin === null
      ? null
      : normalizeRating(ratingMin, "ratingMin"),
    search: normalizeOptionalText(filters.search, 2_000)
  };
}

function normalizeStringArray(value, maxLength) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new TypeError("expected an array of strings");
  }
  return uniqueStrings(value.map((item) => normalizeBoundedText(item, maxLength)));
}

function normalizeUuidArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new TypeError(`${fieldName} must be an array`);
  }
  return value.map((item) => normalizeRequiredUuid(item, fieldName));
}

function normalizeRequiredUuid(value, fieldName) {
  if (!isUuid(value)) {
    throw new TypeError(`${fieldName} must be a UUID`);
  }
  return value;
}

function normalizeOptionalUuid(value) {
  if (value === undefined || value === null || value === "") return null;
  if (!isUuid(value)) throw new TypeError("UUID fields must be UUIDs when provided");
  return value;
}

function normalizeRequirementId(value) {
  if (typeof value !== "string") {
    throw new TypeError("requirementId must be a string");
  }
  const normalized = value.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized) || normalized.length > 120) {
    throw new TypeError("requirementId must be lowercase kebab-case up to 120 characters");
  }
  return normalized;
}

function normalizeEnum(value, allowed, fieldName) {
  if (!allowed.has(value)) {
    throw new RangeError(`${fieldName} is unsupported`);
  }
  return value;
}

function normalizeBoundedText(value, maxLength) {
  if (typeof value !== "string" || value.trim().length === 0 || value.trim().length > maxLength) {
    throw new TypeError(`expected a non-empty string up to ${maxLength} characters`);
  }
  return value.trim();
}

function normalizeLongText(value, maxLength) {
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) {
    throw new TypeError(`expected a non-empty string up to ${maxLength} characters`);
  }
  return value;
}

function normalizeOptionalText(value, maxLength) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.trim().length === 0 || value.trim().length > maxLength) {
    throw new TypeError(`expected a non-empty string up to ${maxLength} characters when provided`);
  }
  return value.trim();
}

function normalizeOptionalIso(value) {
  if (value === undefined || value === null || value === "") return null;
  if (!isIsoTimestamp(value)) {
    throw new TypeError("timestamp fields must be valid ISO-8601 strings when provided");
  }
  return value;
}

function normalizeOptionalPositiveNumber(value, fieldName) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${fieldName} must be a non-negative number when provided`);
  }
  return value;
}

function normalizeOptionalNonNegativeInteger(value, fieldName) {
  if (value === undefined || value === null || value === "") return null;
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new TypeError(`${fieldName} must be a non-negative safe integer when provided`);
  }
  return value;
}

function normalizeRating(value, fieldName) {
  if (!Number.isInteger(value) || value < -10 || value > 10) {
    throw new RangeError(`${fieldName} must be an integer between -10 and 10`);
  }
  return value;
}

function defaultDirectiveTitle(verbatim) {
  if (!verbatim) return "Reconstructed directive";
  return verbatim.split(/\r?\n/, 1)[0].slice(0, 120) || "Directive";
}

function slugifyRequirement(text) {
  const characters = [];
  let previousWasSeparator = false;
  for (const character of String(text).toLowerCase()) {
    const isLowerAlpha = character >= "a" && character <= "z";
    const isDigit = character >= "0" && character <= "9";
    if (isLowerAlpha || isDigit) {
      characters.push(character);
      previousWasSeparator = false;
      continue;
    }
    if (!previousWasSeparator && characters.length > 0) {
      characters.push("-");
      previousWasSeparator = true;
    }
  }
  while (characters[characters.length - 1] === "-") {
    characters.pop();
  }
  const slug = characters.join("").slice(0, 120);
  return slug || randomUUID();
}

function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean))];
}

function isDirectiveId(value) {
  return isUuid(value);
}

function isUuid(value) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isHash(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isIsoTimestamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

module.exports = {
  ACCOUNTABILITY_LEDGER_ID,
  ACCOUNTABILITY_LEDGER_NOTICE,
  AccountabilityLedgerService,
  OUTCOME_STATES,
  REQUIREMENT_STATES,
  RATING_CATEGORIES
};
