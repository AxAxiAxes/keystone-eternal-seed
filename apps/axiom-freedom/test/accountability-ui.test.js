const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

async function loadAccountabilityUi() {
  const markup = await fs.readFile(path.join(__dirname, "..", "accountability.html"), "utf8");
  const script = markup.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(script, "the accountability page must contain its application script");
  const elements = new Map();
  const context = vm.createContext({
    URLSearchParams,
    document: {
      querySelector(selector) {
        if (!elements.has(selector)) {
          elements.set(selector, { innerHTML: "", textContent: "", addEventListener() {} });
        }
        return elements.get(selector);
      },
      querySelectorAll() { return []; }
    },
    fetch: async () => {
      throw new Error("Network access is disabled in UI rendering tests.");
    }
  });
  vm.runInContext(script[1], context, { filename: "accountability.html" });
  await new Promise((resolve) => setImmediate(resolve));
  return { context, elements, markup };
}

test("renders hostile stored rating notes as text in directive details", async () => {
  const { context, elements } = await loadAccountabilityUi();
  const notes = '</pre><img src=x onerror="globalThis.compromised=true"><script>alert(1)</script>&\'';
  context.directive = {
    currentStatus: "blocked",
    currentOutcome: { state: "verified_success" },
    evidenceBackedCompletion: false,
    founderRating: { overall: 0, categories: { accuracy: 0 }, notes },
    assistantSelfAssessment: { overall: 0, categories: { accuracy: 0 }, notes },
    unsupportedCompletionClaims: 0,
    reworkCycles: 0,
    timeToVerifiableOutcomeHours: null,
    directive: { verbatimOriginalDirective: "Synthetic directive", subrequirements: [] },
    interpretations: [],
    deliveries: [],
    resources: [],
    history: []
  };
  await vm.runInContext(
    'state.selectedDirectiveId = "synthetic"; request = async () => directive; loadDirectiveDetail();',
    context
  );
  const detail = elements.get("#directive-detail").innerHTML;
  assert.ok(!detail.includes(notes));
  assert.doesNotMatch(detail, /<img\b|<script\b/i);
  assert.equal(detail.split("&lt;/pre&gt;&lt;img").length - 1, 2);
  assert.match(detail, /&quot;globalThis\.compromised=true&quot;/);
  assert.match(detail, /&amp;&#39;/);
  assert.match(detail, /Latest recorded outcome/);
  assert.match(detail, /Current evidence-backed completion/);
  assert.match(detail, /no longer has verified supporting evidence/);

  context.directive.founderRating.notes = "Plain text\nwith a second line";
  context.directive.assistantSelfAssessment.notes = null;
  await vm.runInContext("loadDirectiveDetail()", context);
  assert.match(elements.get("#directive-detail").innerHTML, /Plain text\nwith a second line/);
});

test("sends the explicit accountability write header from the same-origin UI", async () => {
  const { context } = await loadAccountabilityUi();
  const calls = [];
  context.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ eventType: "directive.created" })
    };
  };
  await vm.runInContext('postEvent({eventType: "directive.created"})', context);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "/api/accountability/events");
  assert.equal(calls[0].options.method, "POST");
  assert.equal(calls[0].options.credentials, "same-origin");
  assert.equal(calls[0].options.headers["Content-Type"], "application/json");
  assert.equal(calls[0].options.headers["X-AXIOM-Accountability"], "write");
});

test("labels outcome filters and list values as recorded rather than live verification", async () => {
  const { context, elements, markup } = await loadAccountabilityUi();
  assert.match(markup, /Latest recorded outcome <select id="filter-outcome"/);
  context.directives = [{
    directiveId: "synthetic",
    title: "Synthetic directive",
    currentStatus: "blocked",
    outcomeState: "verified_success"
  }];
  vm.runInContext("renderDirectiveList(directives)", context);
  const list = elements.get("#directive-list").innerHTML;
  assert.match(list, /Latest recorded outcome/);
  assert.match(list, /class="status-blocked"/);
  assert.doesNotMatch(list, /class="status-verified_success"/);
  assert.match(list, /verified_success/);
});
