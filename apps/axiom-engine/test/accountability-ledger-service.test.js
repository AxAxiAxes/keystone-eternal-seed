const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  ACCOUNTABILITY_LEDGER_ID,
  ACCOUNTABILITY_LEDGER_NOTICE,
  AccountabilityLedgerService,
  RATING_CATEGORIES
} = require("../accountability-ledger-service");

const DIRECTIVE_ID = "11111111-1111-4111-8111-111111111111";
const SECOND_DIRECTIVE_ID = "22222222-2222-4222-8222-222222222222";

function directiveCreated(overrides = {}) {
  return {
    directiveId: DIRECTIVE_ID,
    eventType: "directive.created",
    actor: "founder",
    payload: {
      title: "Build Copilot accountability tracker",
      verbatimOriginalDirective:
        "Store the founder's exact directive verbatim and compare it against actual delivery with evidence, deviations, ratings, and loss tracking.",
      project: "AXIOM",
      repository: "AxAxiAxes/keystone-eternal-seed",
      branch: "axaxiaxes-axiom-monorepo",
      taskSessionIdentifier: "session-123",
      requestedDeliverable: "A locally usable directive-vs-delivery audit ledger",
      constraints: [
        "Do not treat planning or PR activity as verified success",
        "Use human-confirmed fields for money and hours"
      ],
      deadline: "2026-09-20",
      budgetTimeCap: "Founder approval before spending more than 4 hours",
      dependencies: ["Existing AXIOM engine and portal"],
      definitionOfDone:
        "A founder can preserve detailed directions verbatim, compare them to delivery, and record verified outcomes with evidence.",
      subrequirements: [
        { id: "capture-exact-direction", text: "Store the founder's exact original directive verbatim." },
        { id: "require-human-confirmation", text: "Never allow verified success without evidence and human confirmation." }
      ],
      sourceReference: "founder-chat-2026-09-19"
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
      summary: "Implemented the new accountability ledger service and UI",
      claimedCompletion: true,
      items: [
        {
          type: "file",
          deliveryClass: "repository_artifact",
          label: "Engine ledger service",
          locator: "apps/axiom-engine/accountability-ledger-service.js"
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

function sampleOutcome(payload = {}) {
  return {
    directiveId: DIRECTIVE_ID,
    eventType: "outcome.recorded",
    actor: "operator",
    payload: {
      state: "verified_success",
      explanation: "Synthetic confirmation for regression coverage only.",
      humanConfirmed: true,
      confirmedBy: "test-reviewer",
      evidenceIds: ["33333333-3333-4333-8333-333333333333"],
      ...payload
    }
  };
}

test("stores append-only directive, delivery, outcome, rating, and loss history", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-accountability-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const timestamps = [
    "2026-09-19T08:00:00.000Z",
    "2026-09-19T08:15:00.000Z",
    "2026-09-19T08:30:00.000Z",
    "2026-09-19T08:45:00.000Z",
    "2026-09-19T09:00:00.000Z",
    "2026-09-19T09:15:00.000Z",
    "2026-09-19T09:30:00.000Z",
    "2026-09-19T09:45:00.000Z",
    "2026-09-19T10:00:00.000Z"
  ];
  const service = new AccountabilityLedgerService({
    directory,
    now: () => new Date(timestamps.shift() || timestamps[timestamps.length - 1] || "2026-09-19T10:00:00.000Z")
  });

  const initial = await service.initialize();
  assert.equal(initial.id, ACCOUNTABILITY_LEDGER_ID);
  assert.equal(initial.eventCount, 0);

  await service.record(directiveCreated());
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "directive.amended",
    actor: "founder",
    payload: {
      amendmentText: "Also preserve amendments with timestamps and source references.",
      sourceReference: "founder-chat-2026-09-19-followup",
      supersedesInstructions: ["founder-chat-2026-09-19"],
      subrequirementsAdded: [
        { id: "preserve-amendments", text: "Preserve amendments and superseded instructions." }
      ],
      constraintsAdded: ["Do not invent external invoices or hours"]
    }
  });
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "interpretation.recorded",
    actor: "assistant",
    payload: {
      interpretation: "Build an append-only ledger plus a dedicated comparison UI.",
      checklistMapping: [
        {
          requirementId: "capture-exact-direction",
          interpretation: "Use a verbatimOriginalDirective field and keep it searchable."
        }
      ]
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
      requirementId: "capture-exact-direction",
      status: "met",
      explanation: "The directive is stored verbatim and shown prominently in the report.",
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
      notes: "Historical rating before the tracker can prove better follow-through."
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
      directCostCents: 1500,
      reworkCostCents: 2500,
      notes: "Confirmed founder time plus rework and direct cost."
    }
  });

  const directive = await service.getDirective(DIRECTIVE_ID);
  const verifiedEvidenceId = directive.deliveries[0].evidence[0].id;
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "outcome.recorded",
    actor: "operator",
    payload: {
      state: "verified_success",
      explanation: "The founder confirmed the tracker only after verified evidence was recorded.",
      humanConfirmed: true,
      confirmedBy: "Axel Urartu (AX) · Axes Contracting",
      evidenceIds: [verifiedEvidenceId]
    }
  });

  const projected = await service.getDirective(DIRECTIVE_ID);
  assert.equal(projected.directive.subrequirements.length, 3);
  assert.equal(projected.directive.subrequirements[0].currentStatus, "met");
  assert.equal(projected.currentOutcome.state, "verified_success");
  assert.equal(projected.founderRating.overall, -10);
  assert.equal(projected.metrics.provenCostCents, 34000);
  assert.equal(projected.metrics.assistantSessionElapsedHours, 12.5);
  assert.equal(projected.deliveryCounts.file, 1);
  assert.equal(projected.evidenceBackedCompletion, true);
  assert.equal(projected.timeToVerifiableOutcomeHours, 2);

  const summary = await service.summary();
  assert.equal(summary.totalDirectives, 1);
  assert.equal(summary.verifiedSuccesses, 1);
  assert.equal(summary.provenCostCents, 34000);
  assert.deepEqual(summary.founderRatingTrend.map((entry) => entry.overall), [-10]);

  const markdown = await service.report(DIRECTIVE_ID, "markdown");
  assert.match(markdown, /Founder direction \(verbatim\)/);
  assert.match(markdown, /verified_success/);
  assert.match(markdown, /Founder rating: -10/);
});

test("rejects unsupported verified success, invalid ratings, and tampered append-only history", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-accountability-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AccountabilityLedgerService({ directory });

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
          humanConfirmed: false,
          evidenceIds: ["33333333-3333-4333-8333-333333333333"]
        }
      }),
    /verified_success requires/
  );

  await assert.rejects(
    () =>
      service.record({
        directiveId: DIRECTIVE_ID,
        eventType: "rating.recorded",
        actor: "founder",
        payload: {
          kind: "founder",
          overall: -11,
          categories: {
            instructionAdherence: 0,
            accuracy: 0,
            scopeControl: 0,
            verification: 0,
            rework: 0,
            outcomeFocus: 0
          }
        }
      }),
    /between -10 and 10/
  );

  await assert.rejects(
    () =>
      service.record({
        directiveId: SECOND_DIRECTIVE_ID,
        eventType: "directive.created",
        actor: "founder",
        payload: {
          title: "Historical reconstructed directive",
          verbatimOriginalDirective: null,
          project: "AXIOM",
          repository: "AxAxiAxes/keystone-eternal-seed",
          requestedDeliverable: null,
          definitionOfDone: null,
          subrequirements: []
        }
      }),
    /required unless the entry is reconstructed/
  );

  await service.record({
    directiveId: SECOND_DIRECTIVE_ID,
    eventType: "directive.created",
    actor: "founder",
    reconstructed: true,
    incomplete: true,
    payload: {
      title: "Historical reconstructed directive",
      verbatimOriginalDirective: null,
      project: "AXIOM",
      repository: "AxAxiAxes/keystone-eternal-seed",
      requestedDeliverable: null,
      definitionOfDone: null,
      subrequirements: []
    }
  });

  const missing = await service.missingReport();
  assert.equal(missing.missingDirectionCount, 1);

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

test("filters directives and keeps estimated exposure separate from proven cost", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-accountability-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const timestamps = [
    "2026-09-19T08:00:00.000Z",
    "2026-09-19T08:01:00.000Z",
    "2026-09-19T08:02:00.000Z",
    "2026-09-19T08:03:00.000Z"
  ];
  const service = new AccountabilityLedgerService({
    directory,
    now: () => new Date(timestamps.shift())
  });

  await service.record(directiveCreated());
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "resource.recorded",
    actor: "founder",
    payload: {
      entryType: "estimated",
      assistantSessionElapsedHours: 249.25,
      estimatedCostLowCents: 623125,
      estimatedCostHighCents: 3738750,
      notes: "Estimated exposure only; not confirmed founder labor."
    }
  });
  await service.record({
    directiveId: SECOND_DIRECTIVE_ID,
    eventType: "directive.created",
    actor: "founder",
    reconstructed: true,
    incomplete: true,
    payload: {
      title: "Reconstructed AXIOM outage record",
      verbatimOriginalDirective: "Investigate the live AXIOM chat outage and preserve evidence.",
      project: "AXIOM",
      repository: "AxAxiAxes/keystone-eternal-seed",
      branch: "axaxiaxes-axiom-monorepo",
      requestedDeliverable: "Honest outage record",
      definitionOfDone: "Evidence of what was delivered versus what remained blocked",
      subrequirements: [
        { id: "outage-proof", text: "Record the outage and remaining blockers honestly." }
      ]
    }
  });
  await service.record({
    directiveId: SECOND_DIRECTIVE_ID,
    eventType: "outcome.recorded",
    actor: "operator",
    reconstructed: true,
    incomplete: true,
    payload: {
      state: "blocked",
      explanation: "The deployment/integration path remained incomplete.",
      humanConfirmed: true,
      confirmedBy: "Axel Urartu (AX) · Axes Contracting",
      evidenceIds: []
    }
  });

  const summary = await service.summary({ outcome: "blocked" });
  assert.equal(summary.totalDirectives, 1);

  const directives = await service.listDirectives({ search: "verbatim", repository: "AxAxiAxes/keystone-eternal-seed" });
  assert.equal(directives.directives.length, 1);
  assert.equal(directives.directives[0].directiveId, DIRECTIVE_ID);

  const fullSummary = await service.summary();
  assert.equal(fullSummary.provenCostCents, 0);
  assert.equal(fullSummary.estimatedExposureLowCents, 623125);
  assert.equal(fullSummary.estimatedExposureHighCents, 3738750);
});

test("accepts bounded integer rating query strings without coercing invalid filters", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-accountability-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AccountabilityLedgerService({ directory });
  await service.record(directiveCreated());
  await service.record({
    directiveId: DIRECTIVE_ID,
    eventType: "rating.recorded",
    actor: "founder",
    payload: {
      kind: "founder",
      overall: -10,
      categories: Object.fromEntries(RATING_CATEGORIES.map((category) => [category, -10]))
    }
  });

  for (const ratingMin of [-10, "-10"]) {
    assert.equal((await service.listDirectives({ ratingMin })).directives.length, 1);
    assert.equal((await service.summary({ ratingMin })).totalDirectives, 1);
    assert.equal((await service.missingReport({ ratingMin })).totalDirectives, 1);
  }
  for (const ratingMin of [0, "0", 10, "10"]) {
    assert.equal((await service.listDirectives({ ratingMin })).directives.length, 0);
  }
  for (const ratingMin of ["", " ", "1.5", "11", "-11", "invalid", "0x0", [], ["0"], {}, false]) {
    await assert.rejects(
      () => service.listDirectives({ ratingMin }),
      /ratingMin must be an integer between -10 and 10/
    );
  }
});

test("rejects non-boolean human confirmation without appending an event", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-accountability-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AccountabilityLedgerService({ directory });
  await service.record(directiveCreated());
  const delivery = sampleDelivery();
  delivery.payload.evidence[0].verificationState = "verified";
  delivery.payload.evidence[0].verifier = "test-reviewer";
  await service.record(delivery);
  const statePath = path.join(directory, "accountability-ledger.jsonl");
  const original = await fs.readFile(statePath, "utf8");

  for (const state of ["verified_success", "blocked"]) {
    await t.test(state, async () => {
      for (const humanConfirmed of ["false", "true", "", 0, 1, null, [], {}]) {
        await assert.rejects(
          () => service.record(sampleOutcome({ state, humanConfirmed })),
          { name: "TypeError", message: "humanConfirmed must be a boolean when provided" }
        );
        assert.equal(await fs.readFile(statePath, "utf8"), original);
      }
    });
  }

  for (const humanConfirmed of [false, undefined]) {
    await assert.rejects(
      () => service.record(sampleOutcome({ humanConfirmed })),
      /verified_success requires/
    );
    const recorded = await service.record(sampleOutcome({ state: "blocked", humanConfirmed }));
    assert.equal(recorded.payload.humanConfirmed, false);
  }
  const confirmed = await service.record(sampleOutcome());
  assert.equal(confirmed.payload.humanConfirmed, true);
  const reopened = new AccountabilityLedgerService({ directory });
  assert.equal((await reopened.getDirective(DIRECTIVE_ID)).evidenceBackedCompletion, true);
});

test("recomputes current verification while preserving recorded success and its history", async (t) => {
  for (const verificationState of ["disputed", "unverified", "not_applicable"]) {
    await t.test(verificationState, async (t) => {
      const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-accountability-"));
      t.after(() => fs.rm(directory, { recursive: true, force: true }));
      const service = new AccountabilityLedgerService({
        directory,
        now: () => new Date("2026-09-22T12:00:00.000Z")
      });
      await service.record(directiveCreated());
      const delivery = sampleDelivery();
      const secondEvidenceId = "77777777-7777-4777-8777-777777777777";
      const unrelatedEvidenceId = "88888888-8888-4888-8888-888888888888";
      delivery.payload.evidence[0].verificationState = "verified";
      delivery.payload.evidence[0].verifier = "test-reviewer";
      delivery.payload.evidence.push(
        { ...delivery.payload.evidence[0], id: secondEvidenceId },
        { ...delivery.payload.evidence[0], id: unrelatedEvidenceId }
      );
      await service.record(delivery);
      const outcome = sampleOutcome({
        evidenceIds: [delivery.payload.evidence[0].id, secondEvidenceId]
      });
      const success = await service.record(outcome);
      const statePath = path.join(directory, "accountability-ledger.jsonl");
      const original = await fs.readFile(statePath, "utf8");
      const before = await service.getDirective(DIRECTIVE_ID);
      assert.equal(before.evidenceBackedCompletion, true);
      assert.equal(before.currentStatus, "verified_success");

      const evidenceReview = {
        directiveId: DIRECTIVE_ID,
        eventType: "evidence.verified",
        actor: "operator",
        payload: {
          deliveryId: delivery.payload.deliveryId,
          evidenceId: secondEvidenceId,
          verificationState,
          verifier: "test-reviewer"
        }
      };
      await service.record(evidenceReview);
      assert.ok((await fs.readFile(statePath, "utf8")).startsWith(original));
      const reopened = new AccountabilityLedgerService({ directory });
      assert.equal((await reopened.status()).status, "ready");
      const current = await reopened.getDirective(DIRECTIVE_ID);
      assert.equal(current.currentStatus, "blocked");
      assert.equal(current.evidenceBackedCompletion, false);
      assert.equal(current.missingEvidence, true);
      assert.equal(current.timeToVerifiableOutcomeHours, null);
      assert.deepEqual(current.currentOutcome, before.currentOutcome);
      assert.deepEqual(current.outcomes, before.outcomes);
      assert.deepEqual(current.history.slice(0, -1), before.history);
      assert.deepEqual(current.history.find((event) => event.id === success.id), success);

      const summary = await reopened.summary();
      assert.equal(summary.verifiedSuccesses, 0);
      assert.equal(summary.evidenceBackedCompletionRate, 0);
      assert.equal(summary.partialBlockedFailedCount, 1);
      const list = await reopened.listDirectives({ status: "blocked" });
      assert.equal(list.directives.length, 1);
      assert.equal(list.directives[0].outcomeState, "verified_success");
      assert.equal((await reopened.listDirectives({ status: "verified_success" })).directives.length, 0);
      assert.equal((await reopened.listDirectives({ outcome: "verified_success" })).directives.length, 1);
      const missing = await reopened.missingReport();
      assert.equal(missing.missingEvidenceCount, 1);
      assert.equal(missing.missingEvidence[0].currentStatus, "blocked");
      assert.deepEqual(await reopened.report(DIRECTIVE_ID, "json"), current);
      const markdown = await reopened.report(DIRECTIVE_ID, "markdown");
      assert.match(markdown, /Current status: blocked/);
      assert.match(markdown, /Latest recorded outcome: verified_success/);
      assert.match(markdown, /Current evidence-backed completion: no/);
      assert.match(markdown, /Recorded outcome history/);
      await assert.rejects(
        () => reopened.record(outcome),
        /verified_success evidence must already be marked verified/
      );

      evidenceReview.payload.verificationState = "verified";
      await reopened.record(evidenceReview);
      const restored = await reopened.getDirective(DIRECTIVE_ID);
      assert.equal(restored.evidenceBackedCompletion, true);
      assert.equal(restored.currentStatus, "verified_success");
      assert.equal(restored.missingEvidence, false);
      assert.equal(restored.timeToVerifiableOutcomeHours, before.timeToVerifiableOutcomeHours);
      assert.deepEqual(restored.outcomes, before.outcomes);
      assert.equal((await reopened.summary()).verifiedSuccesses, 1);
      assert.equal((await reopened.summary()).partialBlockedFailedCount, 0);
      assert.equal((await reopened.missingReport()).missingEvidenceCount, 0);

      evidenceReview.payload.evidenceId = unrelatedEvidenceId;
      evidenceReview.payload.verificationState = verificationState;
      await reopened.record(evidenceReview);
      assert.equal((await reopened.getDirective(DIRECTIVE_ID)).evidenceBackedCompletion, true);
      await reopened.record(sampleOutcome({ state: "blocked", humanConfirmed: false }));
      assert.equal((await reopened.getDirective(DIRECTIVE_ID)).evidenceBackedCompletion, false);
      assert.equal((await reopened.summary()).verifiedSuccesses, 0);
      assert.equal((await reopened.getDirective(DIRECTIVE_ID)).outcomes[0].state, "verified_success");
    });
  }
});
