const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  ACCOUNTABILITY_LEDGER_ID,
  ACCOUNTABILITY_LEDGER_NOTICE,
  AccountabilityLedgerService,
  TASK_ID_PATTERN,
  INTELLIGENCE_EVALUATION_CRITERIA,
  VALUE_ASSESSMENT_FIELDS
} = require("../accountability-ledger-service");

const DIRECTIVE_ID = "11111111-1111-4111-8111-111111111111";
const SECOND_DIRECTIVE_ID = "22222222-2222-4222-8222-222222222222";

function directiveCreated(overrides = {}) {
  return {
    directiveId: DIRECTIVE_ID,
    eventType: "directive.created",
    actor: "founder",
    payload: {
      title: "Build accountability policy",
      verbatimOriginalDirective:
        "Implement a general task-record and accountability policy that keeps exact directives, planning, verification, financial separation, and authorship distinct.",
      project: "AXIOM",
      repository: "AxAxiAxes/keystone-eternal-seed",
      branch: "axaxiaxes-axiom-monorepo",
      taskSessionIdentifier: "session-123",
      requestedDeliverable: "A single source of truth for founder-directed task records",
      plannedDeliverables: [
        "Engine ledger",
        "Portal accountability view",
        "PR-template and CI validation"
      ],
      constraints: [
        "Do not fabricate historical facts",
        "Keep repository artifacts separate from real-world outcomes"
      ],
      assumptions: [
        "Historical backfill will remain incomplete",
        "Production state is not implied by local repository work"
      ],
      deadline: "2026-09-30",
      budgetTimeCap: "Founder approval before spending more than 4 hours",
      dependencies: ["Existing AXIOM engine and portal"],
      risks: ["Historical reconstruction gaps", "Founder confirmation still pending"],
      acceptanceCriteria: [
        "Task IDs are stable",
        "verified_success requires verified evidence and human confirmation",
        "Financial claims stay separate from confirmed costs"
      ],
      definitionOfDone:
        "A founder can create a task, track lifecycle and evidence, and export truthful reports without conflating estimates, claims, and confirmed outcomes.",
      subrequirements: [
        { id: "task-id", text: "Generate or validate a stable Task-ID." },
        { id: "human-gate", text: "Require explicit human confirmation for verified_success." }
      ],
      attribution: {
        directiveAuthor: "Axel Urartu (AX) · Axes Contracting",
        taskOwner: "Axel Urartu (AX) · Axes Contracting",
        implementers: ["Copilot App"],
        reviewers: ["pending founder review"],
        aiAttribution: ["Copilot App", "local repository edits"]
      },
      intelligenceEvaluation: {
        criteria: {
          directiveAdherence: { state: "met", notes: "Mapped directly to the founder directive." },
          scopeControl: { state: "met", notes: "Repository-only scope preserved." },
          accuracyTruthfulness: { state: "met", notes: "Claims stay tied to recorded evidence." },
          verificationQuality: { state: "needs_review", notes: "Founder verification still required for some follow-up." },
          contributionValueClassification: { state: "met", notes: "Repository artifact value kept separate from legal/market value." },
          decisionMakingQuality: { state: "needs_review", notes: "Decision quality remains founder-reviewed." },
          provenanceAttributionIntegrity: { state: "met", notes: "Founder claim, AI attribution, and verified evidence are split." }
        },
        provenanceBoundary: {
          founderClaim: "founder_claim",
          aiToolAttribution: "ai_tool_attribution",
          verifiedEvidence: "repository_verified"
        },
        notes: "Repository-controlled intelligence evaluation only."
      },
      valueAssessment: {
        creatorClaimantValue: {
          level: "high",
          validationState: "founder_reported",
          evidenceClass: "founder_claim",
          summary: "Founder-reported creator value remains separate from verified costs."
        },
        technicalValue: {
          level: "high",
          validationState: "validated",
          evidenceClass: "repository_verified",
          summary: "Implemented through the ledger, tests, and accountability UI."
        },
        evaluatedContributionValue: {
          level: "medium",
          validationState: "founder_reported",
          evidenceClass: "ai_tool_attribution",
          summary: "Contribution value still needs founder review."
        },
        estimatedValue: {
          level: "medium",
          validationState: "estimated",
          evidenceClass: "founder_claim",
          summary: "Potential value only."
        },
        validatedValue: {
          level: "low",
          validationState: "not_evaluated",
          evidenceClass: "not_provided",
          summary: "No external validation recorded."
        },
        decisionQuality: {
          level: "medium",
          validationState: "founder_reported",
          evidenceClass: "founder_claim",
          summary: "Decision quality remains under founder review."
        },
        reasoningQuality: {
          level: "medium",
          validationState: "founder_reported",
          evidenceClass: "ai_tool_attribution",
          summary: "Reasoning quality tracked separately from outcomes."
        },
        recommendationQuality: {
          level: "medium",
          validationState: "founder_reported",
          evidenceClass: "ai_tool_attribution",
          summary: "Recommendations still require founder confirmation."
        },
        founderConfirmationState: "pending",
        externalReviewState: "not_requested",
        notes: "Patent/final rights status remains founder-reported unless primary evidence is attached."
      },
      reviewDueAt: "2026-09-25T00:00:00.000Z",
      sourceReferences: ["founder-chat-2026-09-21"],
      continuityLinks: ["docs/memory/2026-09-21-accountability-policy.md"]
    },
    ...overrides
  };
}

function sampleDelivery(overrides = {}) {
  return {
    directiveId: DIRECTIVE_ID,
    eventType: "delivery.claimed",
    actor: "assistant",
    payload: {
      deliveryId: "44444444-4444-4444-8444-444444444444",
      summary: "Implemented the accountability ledger service and PR validator",
      claimedCompletion: true,
      items: [
        {
          type: "file",
          deliveryClass: "repository_artifact",
          label: "Engine ledger service",
          locator: "apps/axiom-engine/accountability-ledger-service.js"
        },
        {
          type: "pull_request",
          deliveryClass: "repository_artifact",
          label: "PR template",
          locator: ".github/PULL_REQUEST_TEMPLATE.md"
        },
        {
          type: "deployment",
          deliveryClass: "working_outcome",
          label: "Local UI preview",
          locator: "http://127.0.0.1:8080/accountability"
        }
      ],
      evidence: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          type: "test_run",
          locator: "node --test apps/axiom-engine/test/accountability-ledger-service.test.js",
          verificationState: "unverified"
        }
      ],
      sourceReference: "local-worktree"
    },
    ...overrides
  };
}

test("records task IDs, lifecycle transitions, authorship, retention, and financial separation", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-accountability-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const timestamps = [
    "2026-09-21T08:00:00.000Z",
    "2026-09-21T08:15:00.000Z",
    "2026-09-21T08:30:00.000Z",
    "2026-09-21T08:45:00.000Z",
    "2026-09-21T09:00:00.000Z",
    "2026-09-21T09:15:00.000Z",
    "2026-09-21T09:30:00.000Z",
    "2026-09-21T09:45:00.000Z",
    "2026-09-21T10:00:00.000Z"
  ];
  const service = new AccountabilityLedgerService({
    directory,
    now: () => new Date(timestamps.shift() || "2026-09-21T10:00:00.000Z")
  });

  const initial = await service.initialize();
  assert.equal(initial.id, ACCOUNTABILITY_LEDGER_ID);
  assert.equal(initial.eventCount, 0);

  await service.record(directiveCreated());
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "outcome.recorded",
    actor: "assistant",
    payload: {
      state: "accepted",
      explanation: "The founder-directed task was accepted into active work.",
      humanConfirmed: false,
      evidenceIds: []
    }
  });
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "outcome.recorded",
    actor: "assistant",
    payload: {
      state: "in_progress",
      explanation: "Implementation is underway.",
      humanConfirmed: false,
      evidenceIds: []
    }
  });
  await service.record(sampleDelivery());
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "evidence.verified",
    actor: "operator",
    payload: {
      deliveryId: "44444444-4444-4444-8444-444444444444",
      evidenceId: "33333333-3333-4333-8333-333333333333",
      verificationState: "verified",
      verifier: "Axel Urartu (AX) · Axes Contracting"
    }
  });
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "requirement.assessed",
    actor: "operator",
    payload: {
      requirementId: "task-id",
      status: "met",
      explanation: "The directive received a stable Task-ID and exposes it in reports.",
      evidenceIds: ["33333333-3333-4333-8333-333333333333"],
      deviations: []
    }
  });
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "rating.recorded",
    actor: "founder",
    payload: {
      kind: "founder",
      overall: -10,
      categories: {
        instructionAdherence: -10,
        accuracy: -10,
        scopeControl: -10,
        verification: -10,
        rework: -10,
        outcomeFocus: -10
      },
      notes: "Historical dissatisfaction remains recorded; the ledger should not erase it."
    }
  });
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "resource.recorded",
    actor: "founder",
    payload: {
      entryType: "confirmed",
      founderConfirmedHours: 4,
      assistantSessionElapsedHours: 12.5,
      hourlyValueCents: 7500,
      measuredCostCents: 1500,
      confirmedCostCents: 2500,
      externalSpendCents: 800,
      reworkCostCents: 1200,
      validatedLossCents: 3000,
      currency: "USD",
      confidenceGrade: "high",
      reviewer: "Axel Urartu (AX) · Axes Contracting",
      assumptions: ["Founder confirmed time directly"],
      notes: "Confirmed founder time plus measured/confirmed repository work costs."
    }
  });
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "resource.recorded",
    actor: "founder",
    payload: {
      entryType: "estimated",
      assistantSessionElapsedHours: 2,
      estimatedCostLowCents: 5000,
      estimatedCostHighCents: 9000,
      opportunityCostEstimateCents: 6000,
      claimedLossCents: 4000000,
      currency: "USD",
      confidenceGrade: "reported",
      assumptions: ["Founder-reported loss not yet validated"],
      reviewer: "Axel Urartu (AX) · Axes Contracting",
      notes: "Claim stays separate from confirmed/validated totals."
    }
  });

  const directiveBeforeOutcome = await service.getDirective(DIRECTIVE_ID);
  const verifiedEvidenceId = directiveBeforeOutcome.deliveries[0].evidence[0].id;
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "outcome.recorded",
    actor: "operator",
    payload: {
      state: "verified_success",
      explanation: "The founder confirmed the task only after verified evidence was recorded.",
      humanConfirmed: true,
      confirmedBy: "Axel Urartu (AX) · Axes Contracting",
      evidenceIds: [verifiedEvidenceId]
    }
  });

  const projected = await service.getDirective(DIRECTIVE_ID);
  assert.match(projected.taskId, TASK_ID_PATTERN);
  assert.equal(projected.currentOutcome.state, "verified_success");
  assert.equal(projected.currentStatus, "verified_success");
  assert.equal(projected.directive.subrequirements[0].currentStatus, "met");
  assert.equal(projected.directive.attribution.directiveAuthor, "Axel Urartu (AX) · Axes Contracting");
  assert.equal(projected.reviewStatus, "scheduled");
  assert.equal(projected.statusReport.pullRequest, "recorded");
  assert.equal(projected.statusReport.ci, "recorded");
  assert.equal(projected.statusReport.founderConfirmation, "pending");
  assert.equal(projected.statusReport.externalReview, "not_requested");
  assert.equal(projected.metrics.confirmedCostCents, 36000);
  assert.equal(projected.metrics.provenCostCents, 36000);
  assert.equal(projected.metrics.claimedLossCents, 4000000);
  assert.equal(projected.metrics.validatedLossCents, 3000);
  assert.equal(projected.evidenceBackedCompletion, true);
  assert.equal(projected.deliveryCounts.file, 1);
  assert.equal(projected.timeToVerifiableOutcomeHours, 2);
  assert.equal(projected.authorshipGaps.length, 0);
  assert.equal(projected.directive.intelligenceEvaluation.provenanceBoundary.verifiedEvidence, "repository_verified");
  assert.equal(projected.directive.valueAssessment.technicalValue.validationState, "validated");

  const summary = await service.summary();
  assert.equal(summary.totalDirectives, 1);
  assert.equal(summary.verifiedSuccesses, 1);
  assert.equal(summary.openTaskCount, 0);
  assert.equal(summary.confirmedCostCents, 36000);
  assert.equal(summary.claimedLossCents, 4000000);
  assert.deepEqual(summary.founderRatingTrend.map((entry) => entry.overall), [-10]);

  const markdown = await service.report(DIRECTIVE_ID, "markdown");
  assert.match(markdown, /Task ID/);
  assert.match(markdown, /Founder direction \(verbatim\)/);
  assert.match(markdown, /Intelligence evaluation system/);
  assert.match(markdown, /Value and decision-quality assessment/);
  assert.match(markdown, /Pull request status: recorded/);
  assert.match(markdown, /Claimed loss \(cents\): 4000000/);
});

test("tracks intelligence evaluation and value assessment defaults and explicit states", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-accountability-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AccountabilityLedgerService({ directory });

  await service.record(directiveCreated());
  const projected = await service.getDirective(DIRECTIVE_ID);

  assert.equal(
    Object.keys(projected.directive.intelligenceEvaluation.criteria).length,
    INTELLIGENCE_EVALUATION_CRITERIA.length
  );
  assert.equal(
    Object.keys(projected.directive.valueAssessment).filter((key) => VALUE_ASSESSMENT_FIELDS.includes(key)).length,
    VALUE_ASSESSMENT_FIELDS.length
  );
  assert.equal(projected.directive.valueAssessment.creatorClaimantValue.validationState, "founder_reported");
  assert.equal(projected.directive.valueAssessment.validatedValue.validationState, "not_evaluated");
});

test("removes evidence-backed completion when previously verified evidence becomes disputed", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-accountability-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AccountabilityLedgerService({ directory });

  await service.record(directiveCreated());
  await service.record(sampleDelivery());
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "evidence.verified",
    actor: "operator",
    payload: {
      deliveryId: "44444444-4444-4444-8444-444444444444",
      evidenceId: "33333333-3333-4333-8333-333333333333",
      verificationState: "verified",
      verifier: "Axel Urartu (AX) · Axes Contracting"
    }
  });
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "outcome.recorded",
    actor: "operator",
    payload: {
      state: "verified_success",
      explanation: "Verified at first.",
      humanConfirmed: true,
      confirmedBy: "Axel Urartu (AX) · Axes Contracting",
      evidenceIds: ["33333333-3333-4333-8333-333333333333"]
    }
  });
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "evidence.verified",
    actor: "operator",
    payload: {
      deliveryId: "44444444-4444-4444-8444-444444444444",
      evidenceId: "33333333-3333-4333-8333-333333333333",
      verificationState: "disputed",
      verifier: "Axel Urartu (AX) · Axes Contracting",
      notes: "Evidence integrity needs re-review."
    }
  });

  const projected = await service.getDirective(DIRECTIVE_ID);
  assert.equal(projected.currentOutcome.state, "verified_success");
  assert.equal(projected.currentStatus, "blocked");
  assert.equal(projected.evidenceBackedCompletion, false);
  assert.equal(projected.missingEvidence, true);

  const summary = await service.summary();
  assert.equal(summary.verifiedSuccesses, 0);
});

test("rejects invalid Task-IDs and unverified verified_success transitions", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-accountability-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AccountabilityLedgerService({ directory });

  await assert.rejects(
    () => service.record(directiveCreated({
      payload: {
        ...directiveCreated().payload,
        taskId: "bad-task-id"
      }
    })),
    /taskId must match TASK-YYYYMMDD-0001/
  );

  await service.record(directiveCreated());
  await service.record(sampleDelivery());

  await assert.rejects(
    () =>
      service.record({
        directiveId: DIRECTIVE_ID,
        eventType: "outcome.recorded",
        actor: "operator",
        payload: {
          state: "verified_success",
          explanation: "Should fail because evidence is not verified yet.",
          humanConfirmed: true,
          confirmedBy: "Axel Urartu (AX) · Axes Contracting",
          evidenceIds: ["33333333-3333-4333-8333-333333333333"]
        }
      }),
    /verified_success evidence must already be marked verified/
  );
});

test("autogenerates per-day Task-IDs from directive-created events only", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-accountability-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const timestamps = [
    "2026-09-21T08:00:00.000Z",
    "2026-09-21T08:15:00.000Z",
    "2026-09-21T08:30:00.000Z"
  ];
  const service = new AccountabilityLedgerService({
    directory,
    now: () => new Date(timestamps.shift() || "2026-09-21T08:45:00.000Z")
  });

  await service.record(directiveCreated());
  await service.record(sampleDelivery());
  await service.record(directiveCreated({
    directiveId: SECOND_DIRECTIVE_ID,
    payload: {
      ...directiveCreated().payload,
      title: "Second accountability policy task"
    }
  }));

  const directives = (await service.listDirectives()).directives.sort((left, right) =>
    left.taskId.localeCompare(right.taskId)
  );
  assert.deepEqual(
    directives.map((directive) => directive.taskId),
    ["TASK-20260921-0001", "TASK-20260921-0002"]
  );
});

test("autogeneration advances past the highest same-day explicit Task-ID", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-accountability-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const timestamps = [
    "2026-09-21T08:00:00.000Z",
    "2026-09-21T08:05:00.000Z",
    "2026-09-21T08:10:00.000Z"
  ];
  const service = new AccountabilityLedgerService({
    directory,
    now: () => new Date(timestamps.shift() || "2026-09-21T08:15:00.000Z")
  });

  await service.record(directiveCreated());
  await service.record(directiveCreated({
    directiveId: SECOND_DIRECTIVE_ID,
    payload: {
      ...directiveCreated().payload,
      taskId: "TASK-20260921-0173",
      title: "Backfilled explicit task"
    }
  }));
  await service.record(directiveCreated({
    directiveId: "33333333-3333-4333-8333-333333333333",
    payload: {
      ...directiveCreated().payload,
      title: "Next generated task"
    }
  }));

  const directives = (await service.listDirectives()).directives;
  const generated = directives.find((directive) => directive.title === "Next generated task");
  assert.equal(generated.taskId, "TASK-20260921-0174");
});

test("flags overdue review and missing authorship without deleting evidence", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-accountability-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AccountabilityLedgerService({
    directory,
    now: () => new Date("2026-09-21T12:00:00.000Z")
  });

  await service.record({
    directiveId: SECOND_DIRECTIVE_ID,
    eventType: "directive.created",
    actor: "founder",
    reconstructed: true,
    incomplete: true,
    payload: {
      title: "Historical backfill",
      taskId: "TASK-20260901-0007",
      verbatimOriginalDirective: "Reconstruct a historical PR without inventing facts.",
      project: "AXIOM",
      repository: "AxAxiAxes/keystone-eternal-seed",
      requestedDeliverable: "Backfilled accountability record",
      definitionOfDone: "Historical facts are marked reconstructed/incomplete.",
      subrequirements: [],
      reviewDueAt: "2020-01-01T00:00:00.000Z",
      attribution: {
        directiveAuthor: null,
        taskOwner: null,
        implementers: [],
        reviewers: [],
        aiAttribution: []
      }
    }
  });

  const historical = await service.getDirective(SECOND_DIRECTIVE_ID);
  assert.equal(historical.reviewStatus, "overdue");
  assert.deepEqual(historical.authorshipGaps.sort(), [
    "directiveAuthor",
    "implementers",
    "taskOwner"
  ]);
  assert.equal(historical.reconstructed, true);
  assert.equal(historical.incomplete, true);

  const missing = await service.missingReport();
  assert.equal(missing.missingEvidenceCount, 0);
  assert.equal(missing.missingDirectionCount, 0);

  const summary = await service.summary();
  assert.equal(summary.openTaskCount, 1);
  assert.equal(summary.overdueReviewCount, 1);
  assert.equal(summary.authorshipGapCount, 1);
});

test("flags missing aiAttribution only when AI or assistant work is actually recorded", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-accountability-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AccountabilityLedgerService({ directory });

  await service.record(directiveCreated({
    payload: {
      ...directiveCreated().payload,
      attribution: {
        ...directiveCreated().payload.attribution,
        aiAttribution: []
      }
    }
  }));

  const projected = await service.getDirective(DIRECTIVE_ID);
  assert.ok(projected.authorshipGaps.includes("aiAttribution"));
});

test("reports attention when the append-only ledger is tampered with", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-accountability-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AccountabilityLedgerService({ directory });

  await service.record(directiveCreated());
  const statePath = path.join(directory, "accountability-ledger.jsonl");
  const original = await fs.readFile(statePath, "utf8");
  await fs.writeFile(statePath, original.replace("AXIOM", "BROKEN"));

  assert.deepEqual(await service.status(), {
    status: "attention",
    code: "accountability-ledger-invalid",
    expectedId: ACCOUNTABILITY_LEDGER_ID,
    expectedSchemaVersion: 1,
    label: ACCOUNTABILITY_LEDGER_NOTICE
  });
});
