const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const RECENT_COMMIT_LIMIT = 8;
const CHANGED_PATH_LIMIT = 50;
const DRAFTS_DIRECTORY = path.join("docs", "memory", "drafts");
const TIMELINE_FILE = "PROJECT_TIMELINE.md";
const DRAFT_SUFFIX = "-daily-reconciliation-draft.md";

const SOURCE_REFERENCES = [
  "AGENTS.md",
  "README.md",
  "PROJECT_TIMELINE.md",
  "docs/AXI_PROJECT_CONTEXT_CHECKPOINT.md",
  "docs/memory/README.md",
  "docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md",
  "docs/AXES_AGENT_ORIGIN_REGISTRY.md",
  "docs/AXES_BUILD_PROGRAM.md",
  "docs/AXES_PLATFORM_PLAN.md",
  "docs/AXI_AUTOMATION_SERVICE.md",
  "docs/ENGINE_INTEGRATION.md",
  "docs/RAILWAY_DEPLOYMENT.md",
  "docs/COPILOT_ACCOUNTABILITY_TRACKER.md"
];

const NOT_VERIFIED_BY_LOCAL_RUN = [
  "Production deployment health or runtime state.",
  "Railway project, service, scheduler, monitoring, or recovery status.",
  "DNS, TLS, or domain routing for xiiom.com / axescontracting.com.",
  "External account, billing, mailbox, vendor, or cloud configuration.",
  "Live agent runtime behavior outside this local repository clone."
];

function parseArgs(argv) {
  const args = { write: false, date: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--write") {
      args.write = true;
      continue;
    }

    if (arg === "--date") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --date. Expected format: YYYY-MM-DD");
      }
      args.date = value;
      i += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function formatDateFromNow(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function validateDateInput(dateValue) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    throw new Error(`Invalid date "${dateValue}". Expected format: YYYY-MM-DD`);
  }

  const candidate = new Date(`${dateValue}T00:00:00.000Z`);
  const [year, month, day] = dateValue.split("-").map((part) => Number(part));
  if (
    Number.isNaN(candidate.getTime()) ||
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() + 1 !== month ||
    candidate.getUTCDate() !== day
  ) {
    throw new Error(`Invalid date "${dateValue}". Expected a real calendar day in YYYY-MM-DD format`);
  }

  return dateValue;
}

function runGit(repoRoot, args, runner = execFileSync) {
  try {
    return runner("git", ["-C", repoRoot, ...args], { encoding: "utf8" }).trimEnd();
  } catch (error) {
    throw new Error(`Git command failed (${args.join(" ")}): ${error.message}`);
  }
}

function resolveRepositoryRoot(cwd = process.cwd(), runner = execFileSync) {
  try {
    const root = runner("git", ["-C", cwd, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
    if (!root) {
      throw new Error("empty git root");
    }
    return root;
  } catch (error) {
    throw new Error(`Unable to determine repository root from "${cwd}": ${error.message}`);
  }
}

function parseChangedPaths(statusOutput) {
  const entries = statusOutput.split("\0").filter(Boolean);
  const paths = [];
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const statusCode = entry.slice(0, 2);
    const pathField = entry.slice(3).trim();
    if (!pathField) {
      continue;
    }

    let normalized = pathField.includes(" -> ")
      ? pathField.split(" -> ").pop().trim()
      : pathField;

    const isRenameOrCopy = statusCode.includes("R") || statusCode.includes("C");
    if (isRenameOrCopy && i + 1 < entries.length) {
      normalized = entries[i + 1].trim();
      i += 1;
    }

    paths.push(normalized);
  }

  const unique = [...new Set(paths)];
  return {
    isClean: unique.length === 0,
    totalChangedPaths: unique.length,
    changedPaths: unique.slice(0, CHANGED_PATH_LIMIT)
  };
}

function parseRecentCommits(logOutput) {
  if (!logOutput.trim()) {
    return [];
  }

  return logOutput
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .slice(0, RECENT_COMMIT_LIMIT)
    .map((line) => {
      const firstTab = line.indexOf("\t");
      const secondTab = line.indexOf("\t", firstTab + 1);
      const thirdTab = line.indexOf("\t", secondTab + 1);
      const sha = firstTab === -1 ? line : line.slice(0, firstTab);
      const date = secondTab === -1 ? "" : line.slice(firstTab + 1, secondTab);
      const author = thirdTab === -1 ? "" : line.slice(secondTab + 1, thirdTab);
      const subject = thirdTab === -1 ? "" : line.slice(thirdTab + 1);
      return { sha, date, author, subject };
    });
}

function parseUncheckedTimelineCheckpoints(timelineContent) {
  const sectionStart = timelineContent.indexOf("## Current checkpoints");
  if (sectionStart === -1) {
    throw new Error('Missing "## Current checkpoints" section in PROJECT_TIMELINE.md');
  }

  const nextSectionStart = timelineContent.indexOf("\n## ", sectionStart + 1);
  const sectionEnd = nextSectionStart === -1 ? timelineContent.length : nextSectionStart;
  const lines = timelineContent.slice(sectionStart, sectionEnd).split(/\r?\n/);

  const checkpoints = [];
  let currentCheckpoint = null;
  for (const line of lines) {
    const match = line.match(/^- \[([ xX])\]\s+(.+)$/);
    if (match) {
      const isUnchecked = match[1].toLowerCase() !== "x";
      currentCheckpoint = null;
      if (isUnchecked) {
        currentCheckpoint = match[2].trim();
        checkpoints.push(currentCheckpoint);
      }
      continue;
    }

    if (currentCheckpoint && /^\s{2,}\S/.test(line)) {
      const updated = `${currentCheckpoint} ${line.trim()}`;
      checkpoints[checkpoints.length - 1] = updated;
      currentCheckpoint = updated;
    }
  }

  return checkpoints;
}

function checkExpectedFiles(repoRoot, expectedRelativePaths) {
  return expectedRelativePaths.map((relativePath) => ({
    path: relativePath,
    exists: fs.existsSync(path.join(repoRoot, relativePath))
  }));
}

function buildOutputPath(repoRoot, dateValue) {
  const draftsDirectory = path.resolve(repoRoot, DRAFTS_DIRECTORY);
  const fileName = `${dateValue}${DRAFT_SUFFIX}`;
  const outputPath = path.resolve(draftsDirectory, fileName);
  const relativeToDrafts = path.relative(draftsDirectory, outputPath);

  if (!fileName.match(/^\d{4}-\d{2}-\d{2}-daily-reconciliation-draft\.md$/)) {
    throw new Error(`Unsafe draft filename generated: ${fileName}`);
  }
  if (relativeToDrafts.startsWith("..") || path.isAbsolute(relativeToDrafts)) {
    throw new Error(`Unsafe output path: ${outputPath}`);
  }

  return { draftsDirectory, outputPath, fileName };
}

function collectFacts({ cwd = process.cwd(), runner = execFileSync, now = new Date(), dateOverride }) {
  const repositoryRoot = resolveRepositoryRoot(cwd, runner);
  const timelinePath = path.join(repositoryRoot, TIMELINE_FILE);

  if (!fs.existsSync(timelinePath)) {
    throw new Error(`Missing canonical timeline file: ${timelinePath}`);
  }

  const date = validateDateInput(dateOverride || formatDateFromNow(now));
  const branch = runGit(repositoryRoot, ["rev-parse", "--abbrev-ref", "HEAD"], runner).trim();
  const headSha = runGit(repositoryRoot, ["rev-parse", "HEAD"], runner).trim();
  const statusOutput = runGit(repositoryRoot, ["status", "--porcelain=v1", "-z"], runner);
  const logOutput = runGit(
    repositoryRoot,
    ["log", "--date=short", "--pretty=format:%h%x09%ad%x09%an%x09%s", "-n", String(RECENT_COMMIT_LIMIT)],
    runner
  );
  const timelineContent = fs.readFileSync(timelinePath, "utf8");
  const uncheckedCheckpoints = parseUncheckedTimelineCheckpoints(timelineContent);
  const expectedFiles = checkExpectedFiles(repositoryRoot, SOURCE_REFERENCES);

  return {
    repositoryRoot,
    date,
    branch,
    headSha,
    generatedAt: new Date(now).toISOString(),
    changed: parseChangedPaths(statusOutput),
    recentCommits: parseRecentCommits(logOutput),
    uncheckedCheckpoints,
    expectedFiles
  };
}

function toMarkdown(facts) {
  const lines = [];
  lines.push(`# ${facts.date} — AXES daily reconciliation draft (local repository run)`);
  lines.push("");
  lines.push("**Status:** DRAFT — operator review required before any promotion to canonical records.");
  lines.push("**Generated by:** `node scripts/prepare-axes-daily-diary.js`");
  lines.push("**Generated at:** " + facts.generatedAt);
  lines.push("");
  lines.push("## Verified local repository facts");
  lines.push("");
  lines.push("### Repository context");
  lines.push(`- Date basis used for this draft: \`${facts.date}\``);
  lines.push(`- Repository root: \`${facts.repositoryRoot}\``);
  lines.push(`- Branch: \`${facts.branch}\``);
  lines.push(`- HEAD commit: \`${facts.headSha}\``);
  lines.push("");
  lines.push("### Working tree state (paths only, no file contents)");
  if (facts.changed.isClean) {
    lines.push("- Working tree is clean.");
  } else {
    lines.push(`- Working tree has ${facts.changed.totalChangedPaths} changed path(s).`);
    for (const changedPath of facts.changed.changedPaths) {
      lines.push(`  - \`${changedPath}\``);
    }
    if (facts.changed.totalChangedPaths > facts.changed.changedPaths.length) {
      lines.push(`  - … truncated to first ${CHANGED_PATH_LIMIT} paths for safety.`);
    }
  }
  lines.push("");
  lines.push(`### Recent commits (bounded to ${RECENT_COMMIT_LIMIT})`);
  if (facts.recentCommits.length === 0) {
    lines.push("- No commits found.");
  } else {
    for (const commit of facts.recentCommits) {
      lines.push(`- \`${commit.sha}\` | ${commit.date} | ${commit.author} | ${commit.subject}`);
    }
  }
  lines.push("");
  lines.push("### Current unchecked checkpoints (`PROJECT_TIMELINE.md`)");
  if (facts.uncheckedCheckpoints.length === 0) {
    lines.push("- No unchecked checkpoints found in the canonical timeline section.");
  } else {
    for (const checkpoint of facts.uncheckedCheckpoints) {
      lines.push(`- [ ] ${checkpoint}`);
    }
  }
  lines.push("");
  lines.push("### Required source documents present locally");
  for (const fileStatus of facts.expectedFiles) {
    const marker = fileStatus.exists ? "✅" : "⚠️";
    const state = fileStatus.exists ? "present" : "missing";
    lines.push(`- ${marker} \`${fileStatus.path}\` — ${state}`);
  }
  lines.push("");
  lines.push("### Governance/accountability/automation references for review");
  lines.push("- `AGENTS.md`");
  lines.push("- `docs/AXI_AUTOMATION_SERVICE.md`");
  lines.push("- `docs/COPILOT_ACCOUNTABILITY_TRACKER.md`");
  lines.push("- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`");
  lines.push("- `docs/AXES_AGENT_ORIGIN_REGISTRY.md`");
  lines.push("- `docs/RAILWAY_DEPLOYMENT.md`");
  lines.push("");
  lines.push("## Not verified by this local run");
  for (const item of NOT_VERIFIED_BY_LOCAL_RUN) {
    lines.push(`- ${item}`);
  }
  lines.push("");
  lines.push("## Operator review checklist (manual, human-controlled)");
  lines.push("- [ ] Confirm each fact against the repository and local environment.");
  lines.push("- [ ] Add interpretation, decisions, and any external evidence manually.");
  lines.push("- [ ] If accepted, copy/promote reviewed content into a canonical `docs/memory/` entry.");
  lines.push("- [ ] Update `PROJECT_TIMELINE.md` and `docs/memory/README.md` manually when warranted.");
  lines.push("");
  lines.push("_This draft is local, deterministic, and repository-only. It does not call OpenAI, Copilot model endpoints, web APIs, Railway APIs, DNS providers, email providers, or any external service._");

  return lines.join("\n");
}

function printUsage(stdout = process.stdout) {
  const message = [
    "Usage:",
    "  node scripts/prepare-axes-daily-diary.js [--date YYYY-MM-DD] [--write]",
    "",
    "Default behavior prints the draft markdown to stdout (preview mode).",
    "--write creates a new file at docs/memory/drafts/YYYY-MM-DD-daily-reconciliation-draft.md and refuses overwrite."
  ].join("\n");
  stdout.write(message + "\n");
}

function main(argv = process.argv.slice(2), options = {}) {
  const stdout = options.stdout || process.stdout;
  const args = parseArgs(argv);
  if (args.help) {
    printUsage(stdout);
    return { mode: "help" };
  }

  const facts = collectFacts({
    cwd: options.cwd || process.cwd(),
    runner: options.runner || execFileSync,
    now: options.now || new Date(),
    dateOverride: args.date
  });
  const markdown = toMarkdown(facts);

  if (!args.write) {
    stdout.write(markdown + "\n");
    return { mode: "preview", markdown };
  }

  const { draftsDirectory, outputPath } = buildOutputPath(facts.repositoryRoot, facts.date);
  if (fs.existsSync(outputPath)) {
    throw new Error(`Refusing to overwrite existing draft: ${outputPath}`);
  }

  fs.mkdirSync(draftsDirectory, { recursive: true });
  fs.writeFileSync(outputPath, markdown + "\n", "utf8");
  stdout.write(`Draft written: ${outputPath}\n`);
  return { mode: "write", outputPath, markdown };
}

module.exports = {
  CHANGED_PATH_LIMIT,
  DRAFT_SUFFIX,
  NOT_VERIFIED_BY_LOCAL_RUN,
  RECENT_COMMIT_LIMIT,
  buildOutputPath,
  collectFacts,
  main,
  parseArgs,
  parseChangedPaths,
  parseRecentCommits,
  parseUncheckedTimelineCheckpoints,
  printUsage,
  toMarkdown,
  validateDateInput
};

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exitCode = 1;
  }
}
