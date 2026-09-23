const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { CoordinateService } = require("../coordinate-service");

const REPOSITORY = "example/continuity-fixture";
const PASSWORD = "synthetic-continuity-password";
const headers = {
  Authorization: `Basic ${Buffer.from(`admin:${PASSWORD}`).toString("base64")}`,
  "Content-Type": "application/json"
};

function continuityRequest() {
  return {
    repository: REPOSITORY,
    workflowRun: {
      id: "1234",
      name: "Running Copilot cloud agent",
      htmlUrl: `https://github.com/${REPOSITORY}/actions/runs/1234`,
      headBranch: "copilot/synthetic-continuity",
      headSha: "a".repeat(40),
      conclusion: "success",
      runAttempt: "2"
    },
    coordinate: {
      label: "Synthetic continuity fixture",
      sourceRecord: "SYNTHETIC-SOURCE",
      originCheckpoint: "synthetic-continuity",
      sourceReference: "docs/source.md",
      sourceSha256: "b".repeat(64),
      contractPath: ".github/axi/origin-coordinate.json"
    }
  };
}

async function startEngine(t, repository = REPOSITORY) {
  for (const name of Object.keys(process.env)) {
    if (/^(AXIOM_|OPENAI_|AXI_CONTINUITY_)/.test(name)) delete process.env[name];
  }
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axi-continuity-http-"));
  process.env.AXIOM_MEMORY_DIRECTORY = directory;
  process.env.AXIOM_ENGINE_ADMIN_PASSWORD = PASSWORD;
  process.env.AXIOM_AUTOMATION_ENABLED = "false";
  process.env.AXIOM_MONITORING_ENABLED = "false";
  process.env.AXIOM_WEB_ACCESS_ENABLED = "false";
  if (repository !== null) process.env.AXIOM_WORKFLOW_RUN_CONTINUITY_REPOSITORY = repository;
  delete require.cache[require.resolve("../index")];
  const server = http.createServer(require("../index"));
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await fs.rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const readiness = await fetch(`${base}/system/readiness`);
  assert.equal(readiness.status, 200);
  await readiness.json();
  return {
    directory,
    base,
    post: (body, route = "/automation/workflow-run-continuity") => fetch(`${base}${route}`, {
      method: "POST", headers, body: JSON.stringify(body)
    })
  };
}

test("workflow continuity is disabled without an explicit repository and always requires admin auth", async (t) => {
  const { base, post } = await startEngine(t, null);
  const unauthorized = await fetch(`${base}/automation/workflow-run-continuity`, { method: "POST" });
  assert.equal(unauthorized.status, 401);
  const response = await post(continuityRequest());
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "workflow continuity is not configured" });
  assert.deepEqual(await (await fetch(`${base}/automation/tasks`)).json(), []);
});

test("workflow continuity rejects non-allowlisted or malformed coordinates before creating a task", async (t) => {
  const { base, post } = await startEngine(t);
  for (const [name, change, status] of [
    ["repository", (body) => {
      body.repository = "different/repository";
      body.workflowRun.htmlUrl = "https://github.com/different/repository/actions/runs/1234";
    }, 403],
    ["workflow", (body) => { body.workflowRun.name = "Different workflow"; }, 400],
    ["branch", (body) => { body.workflowRun.headBranch = "copilot-lookalike"; }, 400],
    ["run URL", (body) => { body.workflowRun.htmlUrl = "https://example.invalid/1234"; }, 400],
    ["failed run", (body) => { body.workflowRun.conclusion = "failure"; }, 400],
    ["attempt", (body) => { body.workflowRun.runAttempt = 0; }, 400],
    ["drive path", (body) => { body.coordinate.sourceReference = "C:\\outside.md"; }, 400],
    ["git metadata", (body) => { body.coordinate.contractPath = ".git/config"; }, 400],
    ["invented confirmation", (body) => { body.humanConfirmed = true; }, 400]
  ]) {
    await t.test(name, async () => {
      const body = continuityRequest();
      change(body);
      assert.equal((await post(body)).status, status);
    });
  }
  assert.deepEqual(await (await fetch(`${base}/automation/tasks`)).json(), []);
});

test("concurrent continuity replays retain one coordinate and never process unrelated work", async (t) => {
  const { base, post } = await startEngine(t);
  const unrelated = await (await post({
    title: "Synthetic unrelated task", action: "automation.noop"
  }, "/automation/tasks")).json();
  const body = continuityRequest();
  const responses = await Promise.all([post(body), post(body)]);
  assert.deepEqual(responses.map((response) => response.status).sort(), [200, 201]);
  const results = await Promise.all(responses.map((response) => response.json()));
  assert.equal(results[0].task.id, results[1].task.id);
  assert.equal(results[0].run.id, results[1].run.id);
  assert.equal(results[0].run.result.workflowRun.runAttempt, "2");
  assert.equal((await (await fetch(`${base}/system/coordinates/verify`)).json()).coordinateCount, 2);
  const tasks = await (await fetch(`${base}/automation/tasks`)).json();
  assert.equal(tasks.find((task) => task.id === unrelated.id).status, "pending");

  body.workflowRun.runAttempt = "3";
  const repeatedAttempt = await (await post(body)).json();
  assert.equal(repeatedAttempt.status, "already-recorded");
  assert.equal(repeatedAttempt.task.id, results[0].task.id);
  body.workflowRun.headSha = "c".repeat(40);
  const changedCommit = await post(body);
  assert.equal(changedCommit.status, 201);
  assert.notEqual((await changedCommit.json()).task.id, results[0].task.id);
  assert.equal((await (await fetch(`${base}/system/readiness`)).json()).automation.status, "disabled");
});

test("continuity processing preserves the merged accountability readiness gate", async (t) => {
  const { base, directory, post } = await startEngine(t);
  const ledger = path.join(directory, "accountability-ledger.jsonl");
  await fs.writeFile(ledger, "{invalid synthetic history\n");
  const response = await post(continuityRequest());
  assert.equal(response.status, 409);
  assert.match((await response.json()).error, /accountability ledger is ready/);
  assert.equal(await fs.readFile(ledger, "utf8"), "{invalid synthetic history\n");
  assert.deepEqual(await (await fetch(`${base}/automation/tasks`)).json(), []);
});

test("continuity processing fails closed on a suspended observer or invalid coordinate chain", async (t) => {
  const { base, directory, post } = await startEngine(t);
  const suspension = await post({
    status: "suspended", reason: "Synthetic test hold"
  }, "/automation/agents/operations-observer/accountability");
  assert.equal(suspension.status, 200);
  const suspended = await post(continuityRequest());
  assert.equal(suspended.status, 409);
  assert.match((await suspended.json()).error, /governance readiness/);
  await post({ status: "active", reason: "Synthetic test reset" }, "/automation/agents/operations-observer/accountability");
  const coordinatePath = path.join(directory, "coordinates.jsonl");
  const contents = await fs.readFile(coordinatePath, "utf8");
  const invalid = contents.replace("AXI founder-recorded Genesis coordinate", "Synthetic invalid label");
  await fs.writeFile(coordinatePath, invalid);
  const response = await post(continuityRequest());
  assert.equal(response.status, 409);
  assert.match((await response.json()).error, /coordinate ledger is ready/);
  assert.equal(await fs.readFile(coordinatePath, "utf8"), invalid);
  assert.deepEqual(await (await fetch(`${base}/automation/tasks`)).json(), []);
});

test("a failed coordinate operation returns a failure instead of a created-success response", async (t) => {
  const { post } = await startEngine(t);
  t.mock.method(CoordinateService.prototype, "create", async () => {
    throw new Error("Synthetic coordinate write failure");
  });
  const response = await post(continuityRequest());
  assert.equal(response.status, 409);
  const result = await response.json();
  assert.equal(result.status, "failed");
  assert.equal(result.run.status, "failed");
  assert.match(result.error, /did not complete/);
});

test("workflow continuity retains its ten-request authenticated rate limit", async (t) => {
  const { post } = await startEngine(t);
  for (let attempt = 0; attempt < 10; attempt += 1) {
    assert.equal((await post({})).status, 400);
  }
  const response = await post({});
  assert.equal(response.status, 429);
  assert.deepEqual(await response.json(), { error: "workflow continuity rate limit exceeded" });
});
