const { createHash, randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const ACCOUNTABILITY_LEDGER_ID = "axi-copilot-accountability-ledger-v1";
const ACCOUNTABILITY_LEDGER_SCHEMA_VERSION = 1;
const ACCOUNTABILITY_LEDGER_FILE_NAME = "accountability-ledger.jsonl";
const ACCOUNTABILITY_LEDGER_NOTICE =
  "Directive-versus-delivery accountability ledger only; repository artifacts, planning, documentation, commits, pull requests, and status claims are not treated as verified success without explicit evidence and human confirmation.";
const TASK_ID_PATTERN = /^TASK-\d{8}-\d{4}$/;
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
  "planned",
  "accepted",
  "in_progress",
  "artifact_only",
  "partial",
  "delivered",
  "verified_success",
  "verified_partial",
  "blocked",
  "failed",
  "abandoned",
  "superseded",
  "archived"
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
const ARCHIVAL_STATES = new Set(["active", "archived"]);
const FINANCIAL_CONFIDENCE_GRADES = new Set(["reported", "low", "medium", "high", "audited"]);
const EVALUATION_STATES = new Set([
  "not_evaluated",
  "needs_review",
  "met",
  "partially_met",
  "not_met"
]);
const VALUE_LEVELS = new Set([
  "not_evaluated",
  "low",
  "medium",
  "high",
  "origin_critical"
]);
const VALUE_VALIDATION_STATES = new Set([
  "not_evaluated",
  "estimated",
  "founder_reported",
  "validated"
]);
const EVIDENCE_CLASSES = new Set([
  "not_provided",
  "founder_claim",
  "ai_tool_attribution",
  "repository_verified",
  "external_primary",
  "external_secondary"
]);
const FOUNDER_CONFIRMATION_STATES = new Set(["pending", "confirmed", "not_required"]);
const EXTERNAL_REVIEW_STATES = new Set([
  "not_requested",
  "pending",
  "reviewed",
  "not_applicable"
]);
const INTELLIGENCE_EVALUATION_CRITERIA = [
  "directiveAdherence",
  "scopeControl",
  "accuracyTruthfulness",
  "verificationQuality",
  "contributionValueClassification",
  "decisionMakingQuality",
  "provenanceAttributionIntegrity"
];
const VALUE_ASSESSMENT_FIELDS = [
  "creatorClaimantValue",
  "technicalValue",
  "evaluatedContributionValue",
  "estimatedValue",
  "validatedValue",
  "decisionQuality",
  "reasoningQuality",
  "recommendationQuality"
];

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
      const event = createStoredEvent(input, events, previousEvent, this.now);
      await fs.mkdir(this.directory, { recursive: true });
      await fs.appendFile(this.statePath(), `${JSON.stringify(event)}\n`, "utf8");
      return summarizeEvent(event);
    });
  }

  async listDirectives(filters = {}) {
    assertFilters(filters);
    const directives = filterProjectedDirectives(
      projectDirectives(await this.readValidatedEvents(), this.now()),
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
      projectDirectives(await this.readValidatedEvents(), this.now()),
      normalizeFilters(filters)
    );
    return summarizeDirectives(directives);
  }

  async getDirective(directiveId) {
    if (!isDirectiveId(directiveId)) {
      throw new TypeError("directiveId must be a UUID");
    }
    const directives = projectDirectives(await this.readValidatedEvents(), this.now());
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
      projectDirectives(await this.readValidatedEvents(), this.now()),
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

function createStoredEvent(input, events, previousEvent, now) {
  const recordedAt = now().toISOString();
  const payload = normalizePayload(
    input.eventType,
    input.payload,
    () => new Date(recordedAt),
    { events, previousEvent, recordedAt }
  );
  const event = {
    schemaVersion: ACCOUNTABILITY_LEDGER_SCHEMA_VERSION,
    id: randomUUID(),
    sequence: previousEvent ? previousEvent.sequence + 1 : 1,
    recordedAt,
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

function normalizePayload(eventType, payload, now, context = {}) {
  if (eventType === "directive.created") {
    return {
      taskId:
        normalizeOptionalTaskId(payload.taskId) ||
        generateTaskId(context.recordedAt, context.events || []),
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
      plannedDeliverables: normalizeStringArray(payload.plannedDeliverables, 1_000),
      constraints: normalizeStringArray(payload.constraints, 500),
      assumptions: normalizeStringArray(payload.assumptions, 1_000),
      deadline: normalizeOptionalText(payload.deadline, 120),
      budgetTimeCap: normalizeOptionalText(payload.budgetTimeCap, 200),
      dependencies: normalizeStringArray(payload.dependencies, 500),
      risks: normalizeStringArray(payload.risks, 1_000),
      acceptanceCriteria: normalizeStringArray(payload.acceptanceCriteria, 1_000),
      definitionOfDone:
        payload.definitionOfDone === null ? null : normalizeLongText(payload.definitionOfDone, 4_000),
      subrequirements: normalizeRequirementInputs(payload.subrequirements),
      estimate: normalizePlanEstimate(payload.estimate),
      attribution: normalizeAttribution(payload.attribution, {
        directiveAuthor: payload.directiveAuthor,
        taskOwner: payload.taskOwner
      }),
      intelligenceEvaluation: normalizeIntelligenceEvaluation(payload.intelligenceEvaluation),
      valueAssessment: normalizeValueAssessment(payload.valueAssessment),
      reviewDueAt: normalizeOptionalIso(payload.reviewDueAt),
      expiresAt: normalizeOptionalIso(payload.expiresAt),
      archivalState: payload.archivalState === undefined || payload.archivalState === null || payload.archivalState === ""
        ? "active"
        : normalizeEnum(payload.archivalState, ARCHIVAL_STATES, "archivalState"),
      sourceReferences: normalizeSourceReferences(payload),
      continuityLinks: normalizeStringArray(payload.continuityLinks, 500)
    };
  }
  if (eventType === "directive.amended") {
    return {
      amendmentText: normalizeLongText(payload.amendmentText, 8_000),
      sourceReference: normalizeBoundedText(payload.sourceReference, 500),
      supersedesInstructions: normalizeStringArray(payload.supersedesInstructions, 500),
      subrequirementsAdded: normalizeRequirementInputs(payload.subrequirementsAdded || []),
      plannedDeliverablesAdded: normalizeStringArray(payload.plannedDeliverablesAdded, 1_000),
      constraintsAdded: normalizeStringArray(payload.constraintsAdded, 500),
      assumptionsAdded: normalizeStringArray(payload.assumptionsAdded, 1_000),
      dependenciesAdded: normalizeStringArray(payload.dependenciesAdded, 500),
      risksAdded: normalizeStringArray(payload.risksAdded, 1_000),
      acceptanceCriteriaAdded: normalizeStringArray(payload.acceptanceCriteriaAdded, 1_000),
      continuityLinksAdded: normalizeStringArray(payload.continuityLinksAdded, 500),
      sourceReferencesAdded: normalizeStringArray(payload.sourceReferencesAdded, 500),
      deadline: normalizeOptionalText(payload.deadline, 120),
      budgetTimeCap: normalizeOptionalText(payload.budgetTimeCap, 200),
      reviewDueAt: normalizeOptionalIso(payload.reviewDueAt),
      expiresAt: normalizeOptionalIso(payload.expiresAt),
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

function projectDirectiveMap(events, now = null) {
  const directives = projectDirectives(events, now);
  return new Map(directives.map((directive) => [directive.id, directive]));
}

function projectDirectives(events, now = null) {
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
    .map((directive) => finalizeDirective(directive, now))
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
    taskId: payload.taskId,
    createdAt: event.recordedAt,
    latestUpdatedAt: event.recordedAt,
    reconstructed: event.reconstructed,
    incomplete: event.incomplete,
    title: payload.title || payload.requestedDeliverable || defaultDirectiveTitle(payload.verbatimOriginalDirective),
    directive: {
      taskId: payload.taskId,
      directiveTimestamp: payload.directiveTimestamp || event.recordedAt,
      verbatimOriginalDirective: payload.verbatimOriginalDirective,
      project: payload.project,
      repository: payload.repository,
      branch: payload.branch,
      taskSessionIdentifier: payload.taskSessionIdentifier,
      requestedDeliverable: payload.requestedDeliverable,
      plannedDeliverables: [...payload.plannedDeliverables],
      constraints: [...payload.constraints],
      assumptions: [...payload.assumptions],
      deadline: payload.deadline,
      budgetTimeCap: payload.budgetTimeCap,
      dependencies: [...payload.dependencies],
      risks: [...payload.risks],
      acceptanceCriteria: [...payload.acceptanceCriteria],
      definitionOfDone: payload.definitionOfDone,
      subrequirements,
      estimate: payload.estimate,
      attribution: payload.attribution,
      intelligenceEvaluation: payload.intelligenceEvaluation,
      valueAssessment: payload.valueAssessment,
      reviewDueAt: payload.reviewDueAt,
      expiresAt: payload.expiresAt,
      archivalState: payload.archivalState,
      sourceReferences: [...payload.sourceReferences],
      continuityLinks: [...payload.continuityLinks]
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
    directive.directive.plannedDeliverables.push(...event.payload.plannedDeliverablesAdded);
    directive.directive.assumptions.push(...event.payload.assumptionsAdded);
    directive.directive.dependencies.push(...event.payload.dependenciesAdded);
    directive.directive.risks.push(...event.payload.risksAdded);
    directive.directive.acceptanceCriteria.push(...event.payload.acceptanceCriteriaAdded);
    directive.directive.continuityLinks.push(...event.payload.continuityLinksAdded);
    directive.directive.sourceReferences.push(...event.payload.sourceReferencesAdded);
    if (event.payload.deadline) directive.directive.deadline = event.payload.deadline;
    if (event.payload.budgetTimeCap) directive.directive.budgetTimeCap = event.payload.budgetTimeCap;
    if (event.payload.reviewDueAt) directive.directive.reviewDueAt = event.payload.reviewDueAt;
    if (event.payload.expiresAt) directive.directive.expiresAt = event.payload.expiresAt;
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

function finalizeDirective(directive, now = null) {
  const projected = {
    ...directive,
    directive: {
      ...directive.directive,
      plannedDeliverables: uniqueStrings(directive.directive.plannedDeliverables),
      constraints: uniqueStrings(directive.directive.constraints),
      assumptions: uniqueStrings(directive.directive.assumptions),
      dependencies: uniqueStrings(directive.directive.dependencies),
      risks: uniqueStrings(directive.directive.risks),
      acceptanceCriteria: uniqueStrings(directive.directive.acceptanceCriteria),
      sourceReferences: uniqueStrings(directive.directive.sourceReferences),
      continuityLinks: uniqueStrings(directive.directive.continuityLinks),
      subrequirements: directive.directive.subrequirements.map((requirement) =>
        finalizeRequirement(requirement, directive.requirementAssessments))
    }
  };
  projected.currentOutcome = projected.outcomes.at(-1) || null;
  projected.founderRating = latestRating(projected.ratings, "founder");
  projected.assistantSelfAssessment = latestRating(projected.ratings, "assistant");
  projected.metrics = summarizeResourceMetrics(projected.resources);
  projected.deliveryCounts = summarizeDeliveryCounts(projected.deliveries);
  projected.lastVerifiedAt = latestVerifiedAt(projected);
  projected.archivalState = deriveArchivalState(projected);
  projected.reviewStatus = deriveReviewStatus(projected, now);
  projected.authorshipGaps = deriveAuthorshipGaps(projected);
  projected.statusReport = deriveStatusReport(projected);
  projected.reworkCycles = Math.max(0, projected.deliveries.length - 1);
  projected.unsupportedCompletionClaims = projected.deliveries.filter((delivery) =>
    delivery.claimedCompletion && !delivery.evidence.some((item) => item.verificationState === "verified")
  ).length;
  projected.timeToVerifiableOutcomeHours = computeTimeToVerifiableOutcomeHours(projected);
  projected.currentStatus = deriveDirectiveStatus(projected);
  projected.missingDirection = !projected.directive.verbatimOriginalDirective;
  projected.missingEvidence = hasMissingEvidence(projected);
  projected.evidenceBackedCompletion = Boolean(
    projected.currentOutcome &&
    projected.currentOutcome.state === "verified_success" &&
    projected.currentOutcome.humanConfirmed &&
    verifiedOutcomeEvidenceError(projected, projected.currentOutcome.evidenceIds) === null
  );
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
  const confirmedCostCents = directives.reduce(
    (total, directive) => total + directive.metrics.confirmedCostCents,
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
  const claimedLossCents = directives.reduce(
    (total, directive) => total + directive.metrics.claimedLossCents,
    0
  );
  const validatedLossCents = directives.reduce(
    (total, directive) => total + directive.metrics.validatedLossCents,
    0
  );
  return {
    label: ACCOUNTABILITY_LEDGER_NOTICE,
    totalDirectives: directives.length,
    openTaskCount: directives.filter((directive) => isOpenLifecycleState(directive.currentStatus)).length,
    overdueReviewCount: directives.filter((directive) => directive.reviewStatus === "overdue").length,
    verifiedSuccesses: directives.filter((directive) => directive.evidenceBackedCompletion).length,
    verifiedPartialCount: directives.filter((directive) => directive.currentOutcome?.state === "verified_partial").length,
    failedCount: directives.filter((directive) => directive.currentOutcome?.state === "failed").length,
    supersededCount: directives.filter((directive) => directive.currentOutcome?.state === "superseded").length,
    adherenceRate: evaluatedCount ? Math.round((metCount / evaluatedCount) * 100) : null,
    evidenceBackedCompletionRate: directives.length
      ? Math.round((directives.filter((directive) => directive.evidenceBackedCompletion).length / directives.length) * 100)
      : null,
    reworkCount: directives.reduce((total, directive) => total + directive.reworkCycles, 0),
    missingEvidenceCount: directives.filter((directive) => directive.missingEvidence).length,
    missingDirectionCount: directives.filter((directive) => directive.missingDirection).length,
    authorshipGapCount: directives.filter((directive) => directive.authorshipGaps.length > 0).length,
    confirmedCostCents,
    provenCostCents: confirmedCostCents,
    estimatedExposureLowCents: estimatedLow,
    estimatedExposureHighCents: estimatedHigh,
    claimedLossCents,
    validatedLossCents,
    founderRatingTrend
  };
}

function summarizeDirective(directive) {
  return {
    directiveId: directive.id,
    taskId: directive.taskId,
    title: directive.title,
    project: directive.directive.project,
    repository: directive.directive.repository,
    branch: directive.directive.branch,
    createdAt: directive.createdAt,
    reviewDueAt: directive.directive.reviewDueAt,
    reviewStatus: directive.reviewStatus,
    currentStatus: directive.currentStatus,
    outcomeState: directive.currentOutcome ? directive.currentOutcome.state : null,
    founderRating: directive.founderRating ? directive.founderRating.overall : null,
    assistantSelfAssessment: directive.assistantSelfAssessment
      ? directive.assistantSelfAssessment.overall
      : null,
    verifiedEvidenceCount: countVerifiedEvidence(directive),
    deliveryCount: directive.deliveries.length,
    reworkCycles: directive.reworkCycles,
    confirmedCostCents: directive.metrics.confirmedCostCents,
    provenCostCents: directive.metrics.confirmedCostCents,
    estimatedExposureLowCents: directive.metrics.estimatedExposureLowCents,
    estimatedExposureHighCents: directive.metrics.estimatedExposureHighCents,
    claimedLossCents: directive.metrics.claimedLossCents,
    validatedLossCents: directive.metrics.validatedLossCents,
    authorshipGaps: directive.authorshipGaps,
    statusReport: directive.statusReport,
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
  let confirmedCostCents = 0;
  let estimatedLow = 0;
  let estimatedHigh = 0;
  let claimedLossCents = 0;
  let validatedLossCents = 0;
  let externalSpendCents = 0;
  let reworkCostCents = 0;
  let opportunityCostEstimateCents = 0;

  for (const entry of resources) {
    assistantSessionElapsedHours += entry.assistantSessionElapsedHours || 0;
    if (entry.entryType === "confirmed") {
      founderConfirmedHours += entry.founderConfirmedHours || 0;
      confirmedCostCents += entry.measuredCostCents || 0;
      confirmedCostCents += entry.confirmedCostCents || 0;
      confirmedCostCents += entry.externalSpendCents || 0;
      confirmedCostCents += entry.reworkCostCents || 0;
      externalSpendCents += entry.externalSpendCents || 0;
      reworkCostCents += entry.reworkCostCents || 0;
      validatedLossCents += entry.validatedLossCents || 0;
      if (entry.founderConfirmedHours && entry.hourlyValueCents) {
        confirmedCostCents += Math.round(entry.founderConfirmedHours * entry.hourlyValueCents);
      }
    }
    if (entry.entryType === "estimated") {
      estimatedLow += entry.estimatedCostLowCents || 0;
      estimatedHigh += entry.estimatedCostHighCents || 0;
      claimedLossCents += entry.claimedLossCents || 0;
      opportunityCostEstimateCents += entry.opportunityCostEstimateCents || 0;
    }
  }

  return {
    founderConfirmedHours,
    assistantSessionElapsedHours,
    confirmedCostCents,
    provenCostCents: confirmedCostCents,
    estimatedExposureLowCents: estimatedLow,
    estimatedExposureHighCents: estimatedHigh,
    claimedLossCents,
    validatedLossCents,
    externalSpendCents,
    reworkCostCents,
    opportunityCostEstimateCents
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
  const success = directive.currentOutcome?.state === "verified_success" && directive.currentOutcome.humanConfirmed
    ? directive.currentOutcome
    : null;
  if (!success || verifiedOutcomeEvidenceError(directive, success.evidenceIds) !== null) return null;
  const milliseconds = Date.parse(success.recordedAt) - Date.parse(directive.createdAt);
  return Number.isFinite(milliseconds) ? Number((milliseconds / 3_600_000).toFixed(2)) : null;
}

function deriveDirectiveStatus(directive) {
  if (
    directive.currentOutcome?.state === "verified_success" &&
    verifiedOutcomeEvidenceError(directive, directive.currentOutcome.evidenceIds) !== null
  ) {
    return "blocked";
  }
  if (directive.currentOutcome) return directive.currentOutcome.state;
  const statuses = directive.directive.subrequirements.map((entry) => entry.currentStatus);
  if (statuses.includes("blocked")) return "blocked";
  if (statuses.includes("not_met") || statuses.includes("partially_met")) return "in_progress";
  if (statuses.every((status) => status === "met") && statuses.length > 0) return "delivered";
  return "planned";
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

function countVerifiedEvidence(directive) {
  return directive.deliveries.reduce(
    (count, delivery) =>
      count + delivery.evidence.filter((item) => item.verificationState === "verified").length,
    0
  );
}

function latestVerifiedAt(directive) {
  const verifiedTimestamps = directive.deliveries
    .flatMap((delivery) => delivery.evidence)
    .filter((item) => item.verificationState === "verified" && item.verifiedAt)
    .map((item) => item.verifiedAt)
    .sort();
  return verifiedTimestamps.at(-1) || null;
}

function deriveArchivalState(directive) {
  if (directive.currentOutcome?.state === "archived") return "archived";
  return directive.directive.archivalState || "active";
}

function deriveReviewStatus(directive, now = null) {
  if (directive.archivalState === "archived") return "archived";
  if (!directive.directive.reviewDueAt) return "not_scheduled";
  const currentTimeMs = now instanceof Date ? now.getTime() : Date.now();
  return Date.parse(directive.directive.reviewDueAt) < currentTimeMs ? "overdue" : "scheduled";
}

function deriveAuthorshipGaps(directive) {
  const gaps = [];
  const attribution = directive.directive.attribution || {};
  if (!attribution.directiveAuthor) gaps.push("directiveAuthor");
  if (!attribution.taskOwner) gaps.push("taskOwner");
  if (!attribution.implementers.length) gaps.push("implementers");
  if (!attribution.aiAttribution.length) gaps.push("aiAttribution");
  return gaps;
}

function deriveStatusReport(directive) {
  const deliveryItems = directive.deliveries.flatMap((delivery) => delivery.items);
  const evidenceItems = directive.deliveries.flatMap((delivery) => delivery.evidence);
  const hasArtifact = deliveryItems.some((item) => item.deliveryClass === "repository_artifact");
  const hasWorkingOutcome = deliveryItems.some((item) =>
    ["working_outcome", "external_action"].includes(item.deliveryClass)
  );
  const hasPullRequest = deliveryItems.some((item) => item.type === "pull_request") ||
    evidenceItems.some((item) => item.type === "pull_request");
  const hasCi = evidenceItems.some((item) => ["test_run", "log"].includes(item.type));
  const hasDeployment = deliveryItems.some((item) =>
    ["deployment", "url", "external_action"].includes(item.type)
  ) || evidenceItems.some((item) => ["deployment", "url", "external_action"].includes(item.type));
  const verifiedEvidenceCount = countVerifiedEvidence(directive);
  return {
    task: directive.currentStatus,
    pullRequest: hasPullRequest ? "recorded" : "missing",
    ci: hasCi ? "recorded" : "missing",
    deployment: hasDeployment ? (verifiedEvidenceCount ? "reported_with_verified_evidence" : "reported") : "missing",
    verification: verifiedEvidenceCount ? "verified" : evidenceItems.length ? "pending" : "missing",
    founderConfirmation: directive.directive.valueAssessment.founderConfirmationState,
    externalReview: directive.directive.valueAssessment.externalReviewState,
    repositoryArtifacts: hasArtifact ? "recorded" : "missing",
    realWorldOutcome: hasWorkingOutcome ? "reported" : "missing"
  };
}

function isOpenLifecycleState(value) {
  return ["planned", "accepted", "in_progress", "blocked", "delivered"].includes(value);
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
        return `- confirmed: founder hours=${entry.founderConfirmedHours ?? "n/a"}, session hours=${entry.assistantSessionElapsedHours ?? "n/a"}, hourly value cents=${entry.hourlyValueCents ?? "n/a"}, measured cost cents=${entry.measuredCostCents ?? "n/a"}, confirmed cost cents=${entry.confirmedCostCents ?? "n/a"}, external spend cents=${entry.externalSpendCents ?? "n/a"}, rework cost cents=${entry.reworkCostCents ?? "n/a"}, validated loss cents=${entry.validatedLossCents ?? "n/a"}, currency=${entry.currency ?? "n/a"}, confidence=${entry.confidenceGrade ?? "n/a"}${entry.notes ? ` — ${entry.notes}` : ""}`;
      }
      if (entry.entryType === "estimated") {
        return `- estimated: cost range cents=${entry.estimatedCostLowCents}-${entry.estimatedCostHighCents}, opportunity cost estimate cents=${entry.opportunityCostEstimateCents ?? "n/a"}, claimed loss cents=${entry.claimedLossCents ?? "n/a"}, session hours=${entry.assistantSessionElapsedHours ?? "n/a"}, currency=${entry.currency ?? "n/a"}, confidence=${entry.confidenceGrade ?? "n/a"}${entry.notes ? ` — ${entry.notes}` : ""}`;
      }
      return `- unknown: session hours=${entry.assistantSessionElapsedHours ?? "n/a"}${entry.notes ? ` — ${entry.notes}` : ""}`;
    }).join("\n")
    : "- None recorded";
  const intelligenceCriteria = INTELLIGENCE_EVALUATION_CRITERIA.map((field) => {
    const criterion = directive.directive.intelligenceEvaluation.criteria[field];
    return `- ${field}: ${criterion.state}${criterion.notes ? ` — ${criterion.notes}` : ""}`;
  }).join("\n");
  const valueAssessmentLines = VALUE_ASSESSMENT_FIELDS.map((field) => {
    const value = directive.directive.valueAssessment[field];
    return `- ${field}: level=${value.level}, validation=${value.validationState}, evidenceClass=${value.evidenceClass}${value.summary ? ` — ${value.summary}` : ""}`;
  }).join("\n");

  return [
    `# Copilot accountability audit — ${directive.title}`,
    "",
    `- Directive ID: \`${directive.id}\``,
    `- Task ID: \`${directive.taskId}\``,
    `- Created: ${directive.createdAt}`,
    `- Updated: ${directive.latestUpdatedAt}`,
    `- Last verified: ${directive.lastVerifiedAt || "Not recorded"}`,
    `- Project: ${directive.directive.project}`,
    `- Repository: ${directive.directive.repository}`,
    `- Branch: ${directive.directive.branch || "Not recorded"}`,
    `- Current status: ${directive.currentStatus}`,
    `- Latest recorded outcome: ${directive.currentOutcome ? directive.currentOutcome.state : "Not recorded"}`,
    `- Current evidence-backed completion: ${directive.evidenceBackedCompletion ? "yes" : "no"}`,
    `- Review due: ${directive.directive.reviewDueAt || "Not scheduled"}`,
    `- Review status: ${directive.reviewStatus}`,
    `- Archival state: ${directive.archivalState}`,
    `- Founder rating: ${founderRating}`,
    `- Assistant self-assessment: ${assistantRating}`,
    `- Confirmed cost (cents): ${directive.metrics.confirmedCostCents}`,
    `- Estimated exposure range (cents): ${directive.metrics.estimatedExposureLowCents}-${directive.metrics.estimatedExposureHighCents}`,
    `- Claimed loss (cents): ${directive.metrics.claimedLossCents}`,
    `- Validated loss (cents): ${directive.metrics.validatedLossCents}`,
    "",
    "## Founder direction (verbatim)",
    "",
    directive.directive.verbatimOriginalDirective || "_Missing exact directive text; reconstructed/incomplete entry._",
    "",
    "## Planning, ownership, and definition of done",
    "",
    `- Requested deliverable: ${directive.directive.requestedDeliverable || "Not recorded"}`,
    `- Planned deliverables: ${directive.directive.plannedDeliverables.join("; ") || "Not recorded"}`,
    `- Acceptance criteria: ${directive.directive.acceptanceCriteria.join("; ") || "Not recorded"}`,
    `- Assumptions: ${directive.directive.assumptions.join("; ") || "Not recorded"}`,
    `- Dependencies: ${directive.directive.dependencies.join("; ") || "Not recorded"}`,
    `- Risks: ${directive.directive.risks.join("; ") || "Not recorded"}`,
    `- Directive author: ${directive.directive.attribution.directiveAuthor || "Not recorded"}`,
    `- Task owner: ${directive.directive.attribution.taskOwner || "Not recorded"}`,
    `- Implementers: ${directive.directive.attribution.implementers.join("; ") || "Not recorded"}`,
    `- Reviewers: ${directive.directive.attribution.reviewers.join("; ") || "Not recorded"}`,
    `- Merger / acceptor: ${directive.directive.attribution.mergerAcceptor || "Not recorded"}`,
    `- AI / tool attribution: ${directive.directive.attribution.aiAttribution.join("; ") || "Not recorded"}`,
    `- Authorship gaps: ${directive.authorshipGaps.join(", ") || "none"}`,
    `- Definition of done: ${directive.directive.definitionOfDone || "Not recorded"}`,
    "",
    "## Intelligence evaluation system",
    "",
    "These repository-controlled fields evaluate AI work inside the task record only. They do not establish legal personhood, legal authority, or external legal conclusions.",
    "",
    intelligenceCriteria,
    `- founderClaim boundary: ${directive.directive.intelligenceEvaluation.provenanceBoundary.founderClaim}`,
    `- aiToolAttribution boundary: ${directive.directive.intelligenceEvaluation.provenanceBoundary.aiToolAttribution}`,
    `- verifiedEvidence boundary: ${directive.directive.intelligenceEvaluation.provenanceBoundary.verifiedEvidence}`,
    directive.directive.intelligenceEvaluation.notes
      ? `- Notes: ${directive.directive.intelligenceEvaluation.notes}`
      : "- Notes: None recorded",
    "",
    "## Value and decision-quality assessment",
    "",
    "Value records remain distinct from confirmed costs, legal rights, and unsupported claims. Patent or filing status remains founder-reported unless primary repository evidence is attached.",
    "",
    valueAssessmentLines,
    `- Founder confirmation state: ${directive.directive.valueAssessment.founderConfirmationState}`,
    `- External review state: ${directive.directive.valueAssessment.externalReviewState}`,
    directive.directive.valueAssessment.notes
      ? `- Notes: ${directive.directive.valueAssessment.notes}`
      : "- Notes: None recorded",
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
    "## Outcome and performance",
    "",
    directive.currentOutcome
      ? `- ${directive.currentOutcome.recordedAt}: ${directive.currentOutcome.state} — ${directive.currentOutcome.explanation}`
      : "- No outcome recorded",
    `- Pull request status: ${directive.statusReport.pullRequest}`,
    `- CI status: ${directive.statusReport.ci}`,
    `- Deployment status: ${directive.statusReport.deployment}`,
    `- Verification status: ${directive.statusReport.verification}`,
    `- Founder confirmation status: ${directive.statusReport.founderConfirmation}`,
    `- Repository artifact status: ${directive.statusReport.repositoryArtifacts}`,
    `- Real-world / production outcome status: ${directive.statusReport.realWorldOutcome}`,
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
    taskId: directive.taskId,
    title: directive.title,
    project: directive.directive.project,
    repository: directive.directive.repository,
    currentStatus: directive.currentStatus,
    outcomeState: directive.currentOutcome ? directive.currentOutcome.state : null,
    reviewStatus: directive.reviewStatus,
    authorshipGaps: directive.authorshipGaps,
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
        directive.taskId,
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
      "measuredCostCents",
      "confirmedCostCents",
      "externalSpendCents",
      "reworkCostCents",
      "validatedLossCents",
      "currency",
      "confidenceGrade",
      "assumptions",
      "reviewer",
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
      measuredCostCents: normalizeOptionalNonNegativeInteger(value.measuredCostCents, "measuredCostCents"),
      confirmedCostCents: normalizeOptionalNonNegativeInteger(value.confirmedCostCents, "confirmedCostCents"),
      externalSpendCents: normalizeOptionalNonNegativeInteger(value.externalSpendCents, "externalSpendCents"),
      reworkCostCents: normalizeOptionalNonNegativeInteger(value.reworkCostCents, "reworkCostCents"),
      validatedLossCents: normalizeOptionalNonNegativeInteger(value.validatedLossCents, "validatedLossCents"),
      currency: normalizeOptionalText(value.currency, 16),
      confidenceGrade: normalizeOptionalEnum(value.confidenceGrade, FINANCIAL_CONFIDENCE_GRADES, "confidenceGrade"),
      assumptions: normalizeStringArray(value.assumptions, 500),
      reviewer: normalizeOptionalText(value.reviewer, 200),
      notes: normalizeOptionalText(value.notes, 2_000)
    };
  }

  if (entryType === "estimated") {
    const allowed = new Set([
      "entryType",
      "assistantSessionElapsedHours",
      "estimatedCostLowCents",
      "estimatedCostHighCents",
      "opportunityCostEstimateCents",
      "claimedLossCents",
      "currency",
      "confidenceGrade",
      "assumptions",
      "reviewer",
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
      opportunityCostEstimateCents: normalizeOptionalNonNegativeInteger(
        value.opportunityCostEstimateCents,
        "opportunityCostEstimateCents"
      ),
      claimedLossCents: normalizeOptionalNonNegativeInteger(value.claimedLossCents, "claimedLossCents"),
      currency: normalizeOptionalText(value.currency, 16),
      confidenceGrade: normalizeOptionalEnum(value.confidenceGrade, FINANCIAL_CONFIDENCE_GRADES, "confidenceGrade"),
      assumptions: normalizeStringArray(value.assumptions, 500),
      reviewer: normalizeOptionalText(value.reviewer, 200),
      notes: normalizeOptionalText(value.notes, 2_000)
    };
  }

  const allowed = new Set([
    "entryType",
    "assistantSessionElapsedHours",
    "currency",
    "confidenceGrade",
    "assumptions",
    "reviewer",
    "notes"
  ]);
  if (Object.keys(value).some((field) => !allowed.has(field))) {
    throw new TypeError("unknown resource entry contains unsupported fields");
  }
  return {
    entryType,
    assistantSessionElapsedHours: normalizeOptionalPositiveNumber(
      value.assistantSessionElapsedHours,
      "assistantSessionElapsedHours"
    ),
    currency: normalizeOptionalText(value.currency, 16),
    confidenceGrade: normalizeOptionalEnum(value.confidenceGrade, FINANCIAL_CONFIDENCE_GRADES, "confidenceGrade"),
    assumptions: normalizeStringArray(value.assumptions, 500),
    reviewer: normalizeOptionalText(value.reviewer, 200),
    notes: normalizeOptionalText(value.notes, 2_000)
  };
}

function assertFilters(filters) {
  if (!isRecord(filters)) {
    throw new TypeError("filters must be an object");
  }
}

function normalizeFilters(filters) {
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
    ratingMin: filters.ratingMin === undefined || filters.ratingMin === null
      ? null
      : normalizeRating(Number(filters.ratingMin), "ratingMin"),
    search: normalizeOptionalText(filters.search, 2_000)
  };
}

function normalizeSourceReferences(value) {
  if (Array.isArray(value.sourceReferences)) {
    return normalizeStringArray(value.sourceReferences, 500);
  }
  if (value.sourceReference === undefined || value.sourceReference === null || value.sourceReference === "") {
    return [];
  }
  return [normalizeOptionalText(value.sourceReference, 500)];
}

function normalizePlanEstimate(value) {
  if (value === undefined || value === null || value === "") return null;
  if (!isRecord(value)) {
    throw new TypeError("estimate must be an object when provided");
  }
  if (
    Object.keys(value).some((field) =>
      !["summary", "founderHours", "agentHours", "costCents", "currency"].includes(field))
    ) {
    throw new TypeError("estimate contains unsupported fields");
  }
  return {
    summary: normalizeOptionalText(value.summary, 2_000),
    founderHours: normalizeOptionalPositiveNumber(value.founderHours, "estimate.founderHours"),
    agentHours: normalizeOptionalPositiveNumber(value.agentHours, "estimate.agentHours"),
    costCents: normalizeOptionalNonNegativeInteger(value.costCents, "estimate.costCents"),
    currency: normalizeOptionalText(value.currency, 16)
  };
}

function normalizeIntelligenceEvaluation(value) {
  if (value === undefined || value === null || value === "") {
    return defaultIntelligenceEvaluation();
  }
  if (!isRecord(value)) {
    throw new TypeError("intelligenceEvaluation must be an object when provided");
  }
  if (Object.keys(value).some((field) => !["criteria", "provenanceBoundary", "notes"].includes(field))) {
    throw new TypeError("intelligenceEvaluation contains unsupported fields");
  }
  const criteria = {};
  const sourceCriteria = isRecord(value.criteria) ? value.criteria : {};
  if (Object.keys(sourceCriteria).some((field) => !INTELLIGENCE_EVALUATION_CRITERIA.includes(field))) {
    throw new TypeError("intelligenceEvaluation.criteria contains unsupported fields");
  }
  for (const field of INTELLIGENCE_EVALUATION_CRITERIA) {
    criteria[field] = normalizeEvaluationCriterion(sourceCriteria[field], field);
  }
  return {
    criteria,
    provenanceBoundary: normalizeProvenanceBoundary(value.provenanceBoundary),
    notes: normalizeOptionalText(value.notes, 2_000)
  };
}

function defaultIntelligenceEvaluation() {
  const criteria = {};
  for (const field of INTELLIGENCE_EVALUATION_CRITERIA) {
    criteria[field] = { state: "not_evaluated", notes: null };
  }
  return {
    criteria,
    provenanceBoundary: {
      founderClaim: "founder_claim",
      aiToolAttribution: "ai_tool_attribution",
      verifiedEvidence: "not_provided"
    },
    notes: null
  };
}

function normalizeEvaluationCriterion(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return { state: "not_evaluated", notes: null };
  }
  if (!isRecord(value)) {
    throw new TypeError(`${fieldName} must be an object when provided`);
  }
  if (Object.keys(value).some((field) => !["state", "notes"].includes(field))) {
    throw new TypeError(`${fieldName} contains unsupported fields`);
  }
  return {
    state: normalizeEnum(value.state ?? "not_evaluated", EVALUATION_STATES, `${fieldName}.state`),
    notes: normalizeOptionalText(value.notes, 2_000)
  };
}

function normalizeProvenanceBoundary(value) {
  if (value === undefined || value === null || value === "") {
    return {
      founderClaim: "founder_claim",
      aiToolAttribution: "ai_tool_attribution",
      verifiedEvidence: "not_provided"
    };
  }
  if (!isRecord(value)) {
    throw new TypeError("provenanceBoundary must be an object when provided");
  }
  if (
    Object.keys(value).some((field) =>
      !["founderClaim", "aiToolAttribution", "verifiedEvidence"].includes(field)
    )
  ) {
    throw new TypeError("provenanceBoundary contains unsupported fields");
  }
  return {
    founderClaim: normalizeEnum(
      value.founderClaim ?? "founder_claim",
      EVIDENCE_CLASSES,
      "provenanceBoundary.founderClaim"
    ),
    aiToolAttribution: normalizeEnum(
      value.aiToolAttribution ?? "ai_tool_attribution",
      EVIDENCE_CLASSES,
      "provenanceBoundary.aiToolAttribution"
    ),
    verifiedEvidence: normalizeEnum(
      value.verifiedEvidence ?? "not_provided",
      EVIDENCE_CLASSES,
      "provenanceBoundary.verifiedEvidence"
    )
  };
}

function normalizeValueAssessment(value) {
  if (value === undefined || value === null || value === "") {
    return defaultValueAssessment();
  }
  if (!isRecord(value)) {
    throw new TypeError("valueAssessment must be an object when provided");
  }
  if (
    Object.keys(value).some((field) =>
      ![...VALUE_ASSESSMENT_FIELDS, "founderConfirmationState", "externalReviewState", "notes"].includes(field)
    )
  ) {
    throw new TypeError("valueAssessment contains unsupported fields");
  }
  const assessment = {
    founderConfirmationState: normalizeEnum(
      value.founderConfirmationState ?? "pending",
      FOUNDER_CONFIRMATION_STATES,
      "valueAssessment.founderConfirmationState"
    ),
    externalReviewState: normalizeEnum(
      value.externalReviewState ?? "not_requested",
      EXTERNAL_REVIEW_STATES,
      "valueAssessment.externalReviewState"
    ),
    notes: normalizeOptionalText(value.notes, 2_000)
  };
  for (const field of VALUE_ASSESSMENT_FIELDS) {
    assessment[field] = normalizeValueDimension(value[field], field);
  }
  return assessment;
}

function defaultValueAssessment() {
  const assessment = {
    founderConfirmationState: "pending",
    externalReviewState: "not_requested",
    notes: null
  };
  for (const field of VALUE_ASSESSMENT_FIELDS) {
    assessment[field] = {
      level: "not_evaluated",
      validationState: "not_evaluated",
      evidenceClass: "not_provided",
      summary: null
    };
  }
  return assessment;
}

function normalizeValueDimension(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return {
      level: "not_evaluated",
      validationState: "not_evaluated",
      evidenceClass: "not_provided",
      summary: null
    };
  }
  if (!isRecord(value)) {
    throw new TypeError(`${fieldName} must be an object when provided`);
  }
  if (
    Object.keys(value).some((key) =>
      !["level", "validationState", "evidenceClass", "summary"].includes(key)
    )
  ) {
    throw new TypeError(`${fieldName} contains unsupported fields`);
  }
  return {
    level: normalizeEnum(value.level ?? "not_evaluated", VALUE_LEVELS, `${fieldName}.level`),
    validationState: normalizeEnum(
      value.validationState ?? "not_evaluated",
      VALUE_VALIDATION_STATES,
      `${fieldName}.validationState`
    ),
    evidenceClass: normalizeEnum(
      value.evidenceClass ?? "not_provided",
      EVIDENCE_CLASSES,
      `${fieldName}.evidenceClass`
    ),
    summary: normalizeOptionalText(value.summary, 2_000)
  };
}

function normalizeAttribution(value, legacy = {}) {
  const merged = isRecord(value) ? { ...value } : {};
  if (legacy.directiveAuthor && merged.directiveAuthor === undefined) {
    merged.directiveAuthor = legacy.directiveAuthor;
  }
  if (legacy.taskOwner && merged.taskOwner === undefined) {
    merged.taskOwner = legacy.taskOwner;
  }
  if (
    Object.keys(merged).some((field) =>
      ![
        "directiveAuthor",
        "taskOwner",
        "implementers",
        "reviewers",
        "mergerAcceptor",
        "humanConfirmationBy",
        "aiAttribution",
        "authorshipNotes"
      ].includes(field)
    )
  ) {
    throw new TypeError("attribution contains unsupported fields");
  }
  return {
    directiveAuthor: normalizeOptionalText(merged.directiveAuthor, 200),
    taskOwner: normalizeOptionalText(merged.taskOwner, 200),
    implementers: normalizeStringArray(merged.implementers, 200),
    reviewers: normalizeStringArray(merged.reviewers, 200),
    mergerAcceptor: normalizeOptionalText(merged.mergerAcceptor, 200),
    humanConfirmationBy: normalizeOptionalText(merged.humanConfirmationBy, 200),
    aiAttribution: normalizeStringArray(merged.aiAttribution, 200),
    authorshipNotes: normalizeOptionalText(merged.authorshipNotes, 2_000)
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

function normalizeOptionalTaskId(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !TASK_ID_PATTERN.test(value.trim())) {
    throw new TypeError("taskId must match TASK-YYYYMMDD-0001");
  }
  return value.trim();
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

function normalizeOptionalEnum(value, allowed, fieldName) {
  if (value === undefined || value === null || value === "") return null;
  return normalizeEnum(value, allowed, fieldName);
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

function generateTaskId(recordedAt, events) {
  const parsed = recordedAt ? new Date(recordedAt) : new Date();
  const y = parsed.getUTCFullYear();
  const m = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const d = String(parsed.getUTCDate()).padStart(2, "0");
  const dayPrefix = `${y}${m}${d}`;
  let highestExistingSequence = 0;
  for (const event of events) {
    if (event.eventType !== "directive.created" || !isSameUtcDate(event.recordedAt, parsed)) continue;
    const explicitSequence = parseTaskIdSequence(event.payload?.taskId, dayPrefix);
    highestExistingSequence = explicitSequence === null
      ? highestExistingSequence + 1
      : Math.max(highestExistingSequence, explicitSequence);
  }
  const sequence = String(highestExistingSequence + 1).padStart(4, "0");
  return `TASK-${y}${m}${d}-${sequence}`;
}

function isSameUtcDate(isoTimestamp, expectedDate) {
  if (!isoTimestamp) return false;
  const actual = new Date(isoTimestamp);
  return (
    actual.getUTCFullYear() === expectedDate.getUTCFullYear() &&
    actual.getUTCMonth() === expectedDate.getUTCMonth() &&
    actual.getUTCDate() === expectedDate.getUTCDate()
  );
}

function parseTaskIdSequence(taskId, dayPrefix) {
  if (typeof taskId !== "string") return null;
  const match = new RegExp(`^TASK-${dayPrefix}-(\\d{4})$`).exec(taskId);
  return match ? Number(match[1]) : null;
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
  TASK_ID_PATTERN,
  OUTCOME_STATES,
  REQUIREMENT_STATES,
  RATING_CATEGORIES,
  INTELLIGENCE_EVALUATION_CRITERIA,
  VALUE_ASSESSMENT_FIELDS
};
