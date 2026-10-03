const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");
const test = require("node:test");
const { buildLedger, readLedger } = require("../accounting-balances");

function entry(id, amount, status = "approved") {
  return {
    id, date: "2026-10-03", accountId: "operations", amount,
    description: "Synthetic internal record",
    evidenceRef: "docs/PROJECT_BUDGET.md",
    status,
    approvalRef: status === "approved" ? "docs/PROJECT_BUDGET.md#monthly-review" : null
  };
}

function source(entries = []) {
  return {
    schemaVersion: 1, scope: "internal-recordkeeping",
    accounts: [
      { id: "operations", label: "Synthetic operations", currency: "USD" },
      { id: "other", label: "Synthetic other", currency: "EUR" }
    ],
    entries
  };
}

test("sums approved amounts exactly, keeps drafts separate, and never combines currencies", () => {
  const ledger = buildLedger(source([
    entry("opening", "9007199254740993.10"),
    entry("addition", "0.20"),
    entry("correction", "-0.05"),
    entry("pending", "10.00", "draft"),
    { ...entry("other-entry", "-1.25"), accountId: "other" }
  ]));
  assert.equal(ledger.balances[0].approvedBalance, "9007199254740993.25");
  assert.equal(ledger.balances[0].draftChange, "10.00");
  assert.equal(ledger.balances[1].approvedBalance, "-1.25");
  assert.equal(ledger.entries[4].currency, "EUR");
  assert.deepEqual(buildLedger(source()), buildLedger(source()));
});

test("rejects malformed, ambiguous, duplicate, and unsupported ledger records", () => {
  const invalid = [
    value => { value.schemaVersion = 2; },
    value => { value.scope = "banking"; },
    value => { value.accounts.push(value.accounts[0]); },
    value => { value.accounts[0].currency = "usd"; },
    value => { value.entries.push(value.entries[0]); },
    value => { value.entries[0].accountId = "missing"; },
    value => { value.entries[0].date = "2026-02-30"; },
    value => { value.entries[0].date = "yesterday"; },
    value => { value.entries[0].status = "posted"; },
    value => { value.entries[0].approvalRef = null; },
    value => { value.entries[0].evidenceRef = "../private.md"; },
    value => { value.entries[0].evidenceRef = "https://example.com"; },
    value => { value.entries[0].evidenceRef = "docs/../private.md"; },
    value => { value.entries[0].approvalRef = "approved by automation"; },
    value => { value.entries[0].description = ""; },
    value => { value.entries[0].bankAccount = "unsupported"; }
  ];
  for (const mutate of invalid) {
    const value = source([entry("one", "1.00")]);
    mutate(value);
    assert.throws(() => buildLedger(value));
  }
  for (const amount of [1, "1", "1.001", "NaN", "1e2", "+1.00", "01.00", "-0.00"]) {
    assert.throws(() => buildLedger(source([entry("one", amount)])));
  }
  assert.throws(() => buildLedger(null));
  const draft = entry("draft", "1.00", "draft");
  draft.approvalRef = "docs/PROJECT_BUDGET.md";
  assert.throws(() => buildLedger(source([draft])));
});

test("canonical source and CLI report are deterministic without file writes", () => {
  const sourcePath = path.resolve(__dirname, "../../../docs/accounting-balances.json");
  const before = fs.readFileSync(sourcePath, "utf8");
  assert.deepEqual(readLedger(), buildLedger(JSON.parse(before)));
  const command = path.resolve(__dirname, "../accounting-balances.js");
  const report = execFileSync(process.execPath, [command, "--report"], { encoding: "utf8" });
  assert.equal(execFileSync(process.execPath, [command, "--report"], { encoding: "utf8" }), report);
  assert.deepEqual(JSON.parse(report), readLedger());
  assert.equal(fs.readFileSync(sourcePath, "utf8"), before);
  assert.throws(() => execFileSync(process.execPath, [command, "--write"], { stdio: "pipe" }));
});

test("fails closed on missing or malformed source and missing evidence or approval records", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "accounting-balances-test-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, "ledger.json");
  assert.throws(() => readLedger(file));
  fs.writeFileSync(file, "{");
  assert.throws(() => readLedger(file));
  const value = source([entry("one", "1.00")]);
  fs.writeFileSync(file, JSON.stringify(value));
  assert.equal(readLedger(file).balances[0].approvedBalance, "1.00");
  for (const field of ["evidenceRef", "approvalRef"]) {
    const missing = structuredClone(value);
    missing.entries[0][field] = "docs/nonexistent-ledger-reference.md";
    fs.writeFileSync(file, JSON.stringify(missing));
    assert.throws(() => readLedger(file), /Ledger reference is missing/);
  }
});

test("Command Center renders empty, approved, draft, and escaped ledger records", () => {
  const markup = fs.readFileSync(path.resolve(__dirname, "../command-center.html"), "utf8");
  const script = markup.match(/<script>([\s\S]*?)<\/script>/i)[1];
  const nodes = new Map();
  const context = vm.createContext({
    document: {
      querySelector(selector) {
        if (!nodes.has(selector)) nodes.set(selector, { addEventListener() {} });
        return nodes.get(selector);
      }
    },
    fetch: async () => ({ ok: false, json: async () => ({ error: "Offline" }) }),
    setInterval() {}
  });
  vm.runInContext(script, context);
  context.renderLedger(buildLedger(source()));
  assert.match(nodes.get("#ledger").innerHTML, /No accounting entries recorded/);
  const record = entry("draft", "-0.10", "draft");
  record.description = "<img src=x onerror=alert(1)>";
  context.renderLedger(buildLedger(source([entry("approved", "1.00"), record])));
  assert.match(nodes.get("#ledger").innerHTML, /Human approval pending/);
  assert.match(nodes.get("#ledger").innerHTML, /approved/);
  assert.match(nodes.get("#ledger").innerHTML, /&lt;img/);
  assert.doesNotMatch(nodes.get("#ledger").innerHTML, /<img/);
});
