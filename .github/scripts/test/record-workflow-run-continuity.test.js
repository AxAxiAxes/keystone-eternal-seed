const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const test = require("node:test");
const {
  main, normalizeUpstreamContext, readContract, readRepositoryFile, verifyUpstreamRun
} = require("../record-workflow-run-continuity");

const execFileAsync = promisify(execFile);
const repository = "example/continuity-fixture";
const contractPath = ".github/axi/origin-coordinate.json";
const source = Buffer.from("Synthetic committed source.\n");
const contract = {
  schemaVersion: 1,
  label: "Synthetic continuity",
  sourceRecord: "SYNTHETIC-SOURCE",
  originCheckpoint: "synthetic-continuity",
  sourceReference: "docs/source.md"
};

function workflowRun(sha = "a".repeat(40)) {
  return {
    id: 1234,
    run_attempt: 2,
    name: "Running Copilot cloud agent",
    status: "completed",
    conclusion: "success",
    head_branch: "copilot/synthetic-continuity",
    head_sha: sha,
    html_url: `https://github.com/${repository}/actions/runs/1234`,
    repository: { full_name: repository },
    head_repository: { full_name: repository }
  };
}

function recordedResult(request) {
  const idempotencyKey = "c".repeat(64);
  const taskId = "11111111-1111-4111-8111-111111111111";
  return {
    status: "recorded",
    idempotencyKey,
    task: { id: taskId, action: "coordinate.record", status: "completed" },
    run: {
      id: "22222222-2222-4222-8222-222222222222",
      taskId,
      action: "coordinate.record",
      status: "completed",
      result: {
        idempotencyKey,
        coordinate: { coordinateHash: "d".repeat(64) },
        sourceReference: request.coordinate.sourceReference,
        sourceSha256: request.coordinate.sourceSha256,
        workflowRun: request.workflowRun
      }
    }
  };
}

async function fixture(t, { includeContract = true, extraFiles = {} } = {}) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axi-workflow-fixture-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 }));
  const configFile = path.join(directory, ".git-test-config");
  await fs.writeFile(configFile, "");
  const gitEnv = { ...process.env };
  for (const name of Object.keys(gitEnv)) {
    if (/^GIT_|TOKEN|PASSWORD|SECRET|API_KEY|^NODE_OPTIONS$/.test(name)) delete gitEnv[name];
  }
  Object.assign(gitEnv, {
    GIT_CONFIG_GLOBAL: configFile,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_AUTHOR_NAME: "AXI synthetic test",
    GIT_AUTHOR_EMAIL: "axi-test@example.invalid",
    GIT_COMMITTER_NAME: "AXI synthetic test",
    GIT_COMMITTER_EMAIL: "axi-test@example.invalid"
  });
  const git = async (...args) => (await execFileAsync("git", [
    "-c", "commit.gpgsign=false", "-c", `core.hooksPath=${path.join(directory, "no-hooks")}`, ...args
  ], { cwd: directory, env: gitEnv })).stdout.trim();
  const files = {
    "docs/source.md": source,
    ".github/scripts/record-workflow-run-continuity.js":
      'require("node:fs").writeFileSync("executed.txt", "must never execute");',
    ...(includeContract ? { [contractPath]: JSON.stringify(contract) } : {}),
    ...extraFiles
  };
  await git("init", "--quiet");
  for (const [name, contents] of Object.entries(files)) {
    const destination = path.join(directory, name);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, contents);
  }
  await git("add", "--", ...Object.keys(files));
  const commit = async () => {
    await git("commit", "--quiet", "-m",
      "Synthetic continuity fixture\n\nCo-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>");
    return git("rev-parse", "HEAD");
  };
  const sha = await commit();
  const run = workflowRun(sha);
  const env = {
    GITHUB_EVENT_NAME: "workflow_run",
    GITHUB_EVENT_PATH: path.join(directory, "event.json"),
    GITHUB_REPOSITORY: repository,
    GITHUB_TOKEN: "synthetic-read-only-token",
    GITHUB_OUTPUT: path.join(directory, "output.txt"),
    GITHUB_STEP_SUMMARY: path.join(directory, "summary.md"),
    AXI_CONTINUITY_SOURCE_DIRECTORY: directory,
    AXI_CONTINUITY_PROXY_URL: "https://portal.invalid",
    AXI_CONTINUITY_ADMIN_PASSWORD: "synthetic-proxy-password"
  };
  await fs.writeFile(env.GITHUB_EVENT_PATH, JSON.stringify({ workflow_run: run }));
  return { directory, env, run, git, commit, sha };
}

function replayEnv(env, run) {
  return {
    ...env,
    GITHUB_EVENT_NAME: "workflow_dispatch",
    AXI_CONTINUITY_UPSTREAM_RUN_ID: String(run.id),
    AXI_CONTINUITY_UPSTREAM_HEAD_BRANCH: run.head_branch,
    AXI_CONTINUITY_UPSTREAM_HEAD_SHA: run.head_sha
  };
}

test("records the verified upstream attempt and hashes committed blobs without executing upstream code", async (t) => {
  const { directory, env, run } = await fixture(t);
  await fs.writeFile(path.join(directory, "docs", "source.md"), "Uncommitted replacement.");
  const calls = [];
  const result = await main({ env, fetchImpl: async (url, options) => {
    calls.push(String(url));
    assert.equal(options.redirect, "error");
    if (calls.length === 1) {
      assert.equal(String(url), `https://api.github.com/repos/${repository}/actions/runs/1234/attempts/2`);
      assert.equal(options.headers.Authorization, "Bearer synthetic-read-only-token");
      return Response.json(run);
    }
    assert.equal(String(url), "https://portal.invalid/api/automation/workflow-run-continuity");
    assert.equal(options.headers["X-AXIOM-Workflow-Continuity"], "record");
    const request = JSON.parse(options.body);
    assert.equal(request.workflowRun.headSha, run.head_sha);
    assert.equal(request.workflowRun.runAttempt, "2");
    assert.equal(request.workflowRun.conclusion, run.conclusion);
    assert.equal(request.coordinate.sourceSha256, crypto.createHash("sha256").update(source).digest("hex"));
    return Response.json(recordedResult(request), { status: 201 });
  } });
  assert.equal(result.status, "recorded");
  assert.equal(calls.length, 2);
  assert.match(await fs.readFile(env.GITHUB_OUTPUT, "utf8"), /^status=recorded\n/);
  assert.match(await fs.readFile(env.GITHUB_STEP_SUMMARY, "utf8"), /Verified upstream attempt: 2/);
  await assert.rejects(fs.access(path.join(directory, "executed.txt")), { code: "ENOENT" });
});

test("manual replay resolves the real latest attempt instead of manufacturing success", async (t) => {
  const { env, run } = await fixture(t);
  let posted = 0;
  const options = {
    env: replayEnv(env, run),
    fetchImpl: async (url, request) => {
      if (String(url).startsWith("https://api.github.com/")) {
        assert.equal(String(url), `https://api.github.com/repos/${repository}/actions/runs/1234`);
        return Response.json(run);
      }
      posted += 1;
      const body = JSON.parse(request.body);
      assert.equal(body.workflowRun.runAttempt, "2");
      return Response.json(recordedResult(body));
    }
  };
  await main(options);
  assert.equal(posted, 1);
  run.conclusion = "failure";
  await assert.rejects(main(options), /valid successful upstream workflow run/);
  assert.equal(posted, 1);
});

test("run verification rejects failed, gated, foreign, stale, and mismatched evidence", async (t) => {
  const run = workflowRun();
  const requested = normalizeUpstreamContext({
    eventName: "workflow_run", repository, event: { workflow_run: run }
  });
  for (const [label, change] of [
    ["failed attempt", (entry) => { entry.conclusion = "failure"; }],
    ["approval gate", (entry) => { entry.conclusion = "action_required"; }],
    ["still running", (entry) => { entry.status = "in_progress"; }],
    ["fork", (entry) => { entry.head_repository.full_name = "foreign/fork"; }],
    ["other repository", (entry) => { entry.repository.full_name = "foreign/repository"; }],
    ["other workflow", (entry) => { entry.name = "Unrelated workflow"; }],
    ["branch prefix lookalike", (entry) => { entry.head_branch = "copilot-not-allowed"; }],
    ["other branch", (entry) => { entry.head_branch = "copilot/different"; }],
    ["other commit", (entry) => { entry.head_sha = "b".repeat(40); }],
    ["other run", (entry) => { entry.id = 5678; }],
    ["other attempt", (entry) => { entry.run_attempt = 3; }],
    ["missing attempt", (entry) => { delete entry.run_attempt; }],
    ["unrelated evidence URL", (entry) => { entry.html_url = "https://example.invalid/"; }]
  ]) {
    await t.test(label, async () => {
      const changed = structuredClone(run);
      change(changed);
      await assert.rejects(
        verifyUpstreamRun(requested, repository, "synthetic-token", async () => Response.json(changed)),
        /workflow/
      );
    });
  }
  await assert.rejects(
    verifyUpstreamRun(requested, repository, "", async () => { assert.fail("must not call GitHub"); }),
    /GITHUB_TOKEN/
  );
  await assert.rejects(
    verifyUpstreamRun(requested, repository, "synthetic-token", async () => new Response("", { status: 403 })),
    /HTTP 403/
  );
});

test("manual replay pins an explicitly selected attempt and rejects mismatched head claims", async () => {
  const run = workflowRun();
  const requested = normalizeUpstreamContext({
    eventName: "workflow_dispatch", repository, event: {},
    runId: "1234", runAttempt: "2", headBranch: run.head_branch, headSha: run.head_sha
  });
  const result = await verifyUpstreamRun(requested, repository, "synthetic-token", async (url) => {
    assert.match(String(url), /\/runs\/1234\/attempts\/2$/);
    return Response.json(run);
  });
  assert.equal(result.runAttempt, "2");
  assert.equal(result.conclusion, "success");
  await assert.rejects(
    verifyUpstreamRun({ ...requested, headSha: "b".repeat(40) }, repository,
      "synthetic-token", async () => Response.json(run)),
    /headSha does not match/
  );
});

test("missing contracts skip automatic recording without secrets or network access but fail manual replay", async (t) => {
  const { env, run } = await fixture(t, { includeContract: false });
  delete env.GITHUB_TOKEN;
  delete env.AXI_CONTINUITY_ADMIN_PASSWORD;
  const fetchImpl = async () => { assert.fail("a missing contract must not contact any service"); };
  const result = await main({ env, fetchImpl });
  assert.equal(result.status, "skipped-no-contract");
  await assert.rejects(main({ env: replayEnv(env, run), fetchImpl }), /No continuity contract/);
});

test("contracts reject unsupported fields and unsafe paths before contacting any service", async (t) => {
  const cases = [
    { ...contract, schemaVersion: 2 },
    { ...contract, humanConfirmed: true },
    { ...contract, sourceRecord: "not-an-origin-record" },
    { ...contract, originCheckpoint: "Not-A-Checkpoint" },
    ...["../outside", "/absolute", "C:\\outside", ".git/config", "docs/\nfile"].map(
      (sourceReference) => ({ ...contract, sourceReference })
    ),
    "{invalid"
  ];
  const extraFiles = Object.fromEntries(cases.map((value, index) => [
    `contracts/invalid-${index}.json`, typeof value === "string" ? value : JSON.stringify(value)
  ]));
  const { env } = await fixture(t, { extraFiles });
  for (const [index] of cases.entries()) {
    await t.test(`invalid contract ${index}`, async () => {
      await assert.rejects(main({
        env: { ...env, AXI_CONTINUITY_CONTRACT_PATH: `contracts/invalid-${index}.json` },
        fetchImpl: async () => { assert.fail("invalid contract must not contact any service"); }
      }), /continuity contract|Continuity contract/);
    });
  }
});

test("source evidence excludes untracked files, symlinks, directories, and oversized blobs", async (t) => {
  const { directory, git, commit, sha } = await fixture(t);
  await fs.writeFile(path.join(directory, "untracked.md"), "not committed");
  assert.equal(await readRepositoryFile(directory, sha, "untracked.md", 1024), null);
  await assert.rejects(readRepositoryFile(directory, sha, "docs", 1024), /regular tracked file/);
  await assert.rejects(readRepositoryFile(directory, sha, "docs/source.md", 2), /exceeds 2 bytes/);
  const blob = await git("rev-parse", `${sha}:docs/source.md`);
  await git("update-index", "--add", "--cacheinfo", `120000,${blob},docs/link.md`);
  const symlinkSha = await commit();
  await assert.rejects(readRepositoryFile(directory, symlinkSha, "docs/link.md", 1024), /regular tracked file/);
});

test("enforces the exact 16 KiB contract and 5 MiB source limits", async (t) => {
  const contractLimit = 16 * 1024;
  const sourceLimit = 5 * 1024 * 1024;
  const { directory, sha } = await fixture(t, {
    extraFiles: {
      "contracts/at-limit.json": JSON.stringify(contract).padEnd(contractLimit),
      "contracts/over-limit.json": JSON.stringify(contract).padEnd(contractLimit + 1),
      "docs/at-limit.bin": Buffer.alloc(sourceLimit, "a"),
      "docs/over-limit.bin": Buffer.alloc(sourceLimit + 1, "a")
    }
  });
  assert.equal((await readContract(directory, sha, "contracts/at-limit.json")).sourceReference,
    contract.sourceReference);
  await assert.rejects(readContract(directory, sha, "contracts/over-limit.json"), /exceeds 16384 bytes/);
  assert.equal((await readRepositoryFile(directory, sha, "docs/at-limit.bin", sourceLimit)).length, sourceLimit);
  await assert.rejects(readRepositoryFile(directory, sha, "docs/over-limit.bin", sourceLimit),
    /exceeds 5242880 bytes/);
});

test("missing secrets, insecure destinations, and incomplete runtime results cannot report success", async (t) => {
  const { env, run } = await fixture(t, {
    extraFiles: {
      "contracts/missing-source.json": JSON.stringify({ ...contract, sourceReference: "docs/missing.md" })
    }
  });
  let posts = 0;
  const fetchImpl = async (url) => {
    if (String(url).startsWith("https://api.github.com/")) return Response.json(run);
    posts += 1;
    return Response.json({ status: "recorded" });
  };
  await assert.rejects(main({
    env: { ...env, AXI_CONTINUITY_ADMIN_PASSWORD: "" }, fetchImpl
  }), /proxy secrets are required/);
  await assert.rejects(main({
    env: { ...env, AXI_CONTINUITY_CONTRACT_PATH: "contracts/missing-source.json" }, fetchImpl
  }), /sourceReference does not exist/);
  for (const proxy of ["http://portal.invalid", "https://user:password@portal.invalid", "https://portal.invalid/path"]) {
    await assert.rejects(main({
      env: { ...env, AXI_CONTINUITY_PROXY_URL: proxy }, fetchImpl
    }), /HTTPS origin/);
  }
  assert.equal(posts, 0);
  await assert.rejects(main({ env, fetchImpl }), /matching completed task, run, and coordinate/);
  assert.equal(posts, 1);
  await assert.rejects(fs.access(env.GITHUB_OUTPUT), { code: "ENOENT" });
});

test("workflow wiring separates trusted execution, data, opt-in, and validation events", async () => {
  const workflow = await fs.readFile(path.join(__dirname, "..", "..", "workflows",
    "axi-continuity-validation.yml"), "utf8");
  const job = workflow.slice(workflow.indexOf("  copilot-workflow-run-continuity:"));
  assert.match(job, /vars\.AXI_CONTINUITY_ENABLED == 'true'/);
  assert.match(job, /github\.ref == 'refs\/heads\/axaxiaxes-axiom-monorepo'/);
  assert.match(job, /github\.event_name == 'workflow_dispatch'/);
  assert.match(job, /github\.event_name == 'workflow_run'/);
  assert.doesNotMatch(job, /github\.event_name == '(push|pull_request)'/);
  assert.match(job, /ref: \$\{\{ github\.workflow_sha \}\}\s+path: continuity-runner/);
  assert.match(job, /path: continuity-source/);
  assert.equal((job.match(/persist-credentials: false/g) || []).length, 2);
  assert.match(job, /run: node continuity-runner\/\.github\/scripts\/record-workflow-run-continuity\.js/);
  assert.doesNotMatch(job, /run:.*continuity-source/);
  assert.match(job, /actions: read/);
  assert.doesNotMatch(job, /contents: write|actions: write/);
  assert.match(workflow, /node --test \.\.\/\.\.\/\.github\/scripts\/test\/record-workflow-run-continuity\.test\.js/);
  assert.match(workflow, /group:.*github\.event_name.*github\.event\.workflow_run\.id/);
});
