const assert = require("node:assert/strict");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const scriptPath = path.resolve(__dirname, "..", "prepare-axes-daily-diary.js");
const scriptModule = require("../prepare-axes-daily-diary.js");

async function createTempRepository() {
  const repoRoot = await fsp.mkdtemp(path.join(os.tmpdir(), "axes-diary-script-"));
  const docsMemory = path.join(repoRoot, "docs", "memory");
  await fsp.mkdir(docsMemory, { recursive: true });

  const timelineContent = [
    "# AXIOM / KEYSTONE project timeline",
    "",
    "**Current phase:** Example phase",
    "",
    "## Current checkpoints",
    "- [ ] Keep one open checkpoint",
    "  with wrapped context",
    "- [x] Completed checkpoint",
    "- [ ] Another open checkpoint",
    "",
    "## Deployment verification",
    ""
  ].join("\n");

  await fsp.writeFile(path.join(repoRoot, "README.md"), "# Test Repo\n");
  await fsp.writeFile(path.join(repoRoot, "AGENTS.md"), "# Agents\n");
  await fsp.writeFile(path.join(repoRoot, "PROJECT_TIMELINE.md"), timelineContent);

  const run = (args) => {
    const result = spawnSync("git", args, { cwd: repoRoot, encoding: "utf8" });
    if (result.status !== 0) {
      throw new Error(`git ${args.join(" ")} failed: ${result.stderr || result.stdout}`);
    }
  };

  run(["init", "-b", "main"]);
  run(["config", "user.name", "AXES Test"]);
  run(["config", "user.email", "axes-test@example.com"]);
  run(["add", "."]);
  run(["commit", "-m", "Initial commit"]);

  return repoRoot;
}

function runScript(args, cwd) {
  return spawnSync("node", [scriptPath, ...args], { cwd, encoding: "utf8" });
}

test("preview mode is default and does not write a draft file", async (t) => {
  const repoRoot = await createTempRepository();
  t.after(() => fsp.rm(repoRoot, { recursive: true, force: true }));

  const date = "2026-09-25";
  const result = runScript(["--date", date], repoRoot);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Status:\*\* DRAFT — operator review required/);
  assert.match(result.stdout, /## Verified local repository facts/);
  const expectedPath = path.join(repoRoot, "docs", "memory", "drafts", `${date}-daily-reconciliation-draft.md`);
  assert.equal(fs.existsSync(expectedPath), false);
});

test("write mode creates only a new dated draft file", async (t) => {
  const repoRoot = await createTempRepository();
  t.after(() => fsp.rm(repoRoot, { recursive: true, force: true }));

  const date = "2026-09-25";
  const result = runScript(["--date", date, "--write"], repoRoot);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Draft written:/);

  const draftPath = path.join(repoRoot, "docs", "memory", "drafts", `${date}-daily-reconciliation-draft.md`);
  assert.equal(fs.existsSync(draftPath), true);
  const contents = await fsp.readFile(draftPath, "utf8");
  assert.match(contents, /AXES daily reconciliation draft/);
});

test("refuses malformed date values", async (t) => {
  const repoRoot = await createTempRepository();
  t.after(() => fsp.rm(repoRoot, { recursive: true, force: true }));

  const result = runScript(["--date", "2026-99-44"], repoRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Invalid date/);
});

test("refuses overwrite when draft file already exists", async (t) => {
  const repoRoot = await createTempRepository();
  t.after(() => fsp.rm(repoRoot, { recursive: true, force: true }));

  const date = "2026-09-25";
  const draftPath = path.join(repoRoot, "docs", "memory", "drafts", `${date}-daily-reconciliation-draft.md`);
  await fsp.mkdir(path.dirname(draftPath), { recursive: true });
  await fsp.writeFile(draftPath, "existing-content\n", "utf8");

  const result = runScript(["--date", date, "--write"], repoRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Refusing to overwrite existing draft/);

  const after = await fsp.readFile(draftPath, "utf8");
  assert.equal(after, "existing-content\n");
});

test("does not leak changed file content values in draft output", async (t) => {
  const repoRoot = await createTempRepository();
  t.after(() => fsp.rm(repoRoot, { recursive: true, force: true }));

  const secretValue = "SUPER_SECRET_TOKEN_123456";
  await fsp.writeFile(path.join(repoRoot, "local-notes.txt"), `api=${secretValue}\n`, "utf8");

  const result = runScript(["--date", "2026-09-25"], repoRoot);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /local-notes\.txt/);
  assert.equal(result.stdout.includes(secretValue), false);
});

test("recent commit output is bounded", async (t) => {
  const repoRoot = await createTempRepository();
  t.after(() => fsp.rm(repoRoot, { recursive: true, force: true }));

  for (let i = 1; i <= 12; i += 1) {
    await fsp.writeFile(path.join(repoRoot, `note-${i}.txt`), `line-${i}\n`, "utf8");
    const add = spawnSync("git", ["add", `note-${i}.txt`], { cwd: repoRoot, encoding: "utf8" });
    assert.equal(add.status, 0);
    const commit = spawnSync("git", ["commit", "-m", `Commit ${i}`], { cwd: repoRoot, encoding: "utf8" });
    assert.equal(commit.status, 0);
  }

  const result = runScript(["--date", "2026-09-25"], repoRoot);
  assert.equal(result.status, 0);
  const commitLines = result.stdout
    .split(/\r?\n/)
    .filter((line) => /^- `[\da-f]+` \| /.test(line));
  assert.equal(commitLines.length, scriptModule.RECENT_COMMIT_LIMIT);
});

test("unchecked checkpoints are extracted with wrapped lines", () => {
  const timeline = [
    "## Current checkpoints",
    "- [ ] Open checkpoint one",
    "  continued details",
    "- [x] Done checkpoint",
    "- [ ] Open checkpoint two",
    "## Next section"
  ].join("\n");

  const checkpoints = scriptModule.parseUncheckedTimelineCheckpoints(timeline);
  assert.deepEqual(checkpoints, [
    "Open checkpoint one continued details",
    "Open checkpoint two"
  ]);
});

test("changed-path parser handles porcelain -z rename/copy format without counting old path", () => {
  const parsed = scriptModule.parseChangedPaths("R  old-name.txt\0new-name.txt\0M  changed.txt\0");
  assert.equal(parsed.isClean, false);
  assert.equal(parsed.totalChangedPaths, 2);
  assert.deepEqual(parsed.changedPaths, ["new-name.txt", "changed.txt"]);
});

test("help output uses provided stdout stream in main()", () => {
  let output = "";
  const stdout = {
    write(text) {
      output += text;
    }
  };

  const result = scriptModule.main(["--help"], { stdout });
  assert.equal(result.mode, "help");
  assert.match(output, /Usage:/);
});

test("output includes explicit unverified external/runtime disclaimer section", async (t) => {
  const repoRoot = await createTempRepository();
  t.after(() => fsp.rm(repoRoot, { recursive: true, force: true }));

  const result = runScript(["--date", "2026-09-25"], repoRoot);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /## Not verified by this local run/);
  assert.match(result.stdout, /Railway project, service, scheduler, monitoring, or recovery status/);
  assert.match(result.stdout, /DNS, TLS, or domain routing/);
});
