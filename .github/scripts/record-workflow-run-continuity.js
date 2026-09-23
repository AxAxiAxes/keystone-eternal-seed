#!/usr/bin/env node

const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

const DEFAULT_CONTRACT_PATH = ".github/axi/origin-coordinate.json";
const WORKFLOW_NAME = "Running Copilot cloud agent";
const execFileAsync = promisify(execFile);
const MAX_CONTRACT_BYTES = 16 * 1024;
const MAX_SOURCE_BYTES = 5 * 1024 * 1024;

async function main({ env = process.env, fetchImpl = fetch } = {}) {
  const eventName = env.GITHUB_EVENT_NAME;
  const repository = env.GITHUB_REPOSITORY;
  const sourceDirectory = env.AXI_CONTINUITY_SOURCE_DIRECTORY;
  if (!isNonEmptyString(sourceDirectory)) {
    throw new Error("AXI_CONTINUITY_SOURCE_DIRECTORY must identify the upstream data checkout.");
  }
  const event = JSON.parse(await fs.readFile(env.GITHUB_EVENT_PATH, "utf8"));
  const contractPath = normalizeRepositoryRelativePath(
    env.AXI_CONTINUITY_CONTRACT_PATH || DEFAULT_CONTRACT_PATH,
    "continuity contract path"
  );
  const requested = normalizeUpstreamContext({
    eventName,
    repository,
    event,
    workflowName: env.AXI_CONTINUITY_UPSTREAM_WORKFLOW_NAME,
    runId: env.AXI_CONTINUITY_UPSTREAM_RUN_ID,
    runAttempt: env.AXI_CONTINUITY_UPSTREAM_RUN_ATTEMPT,
    headBranch: env.AXI_CONTINUITY_UPSTREAM_HEAD_BRANCH,
    headSha: env.AXI_CONTINUITY_UPSTREAM_HEAD_SHA
  });

  const contract = await readContract(sourceDirectory, requested.headSha, contractPath);
  if (contract === null) {
    if (eventName === "workflow_run") {
      return writeResult({
        status: "skipped-no-contract",
        message: `No explicit continuity contract was found at ${contractPath} for ${requested.headBranch}@${requested.headSha}.`
      }, env);
    }
    throw new Error(`No continuity contract was found at ${contractPath}.`);
  }

  const upstream = await verifyUpstreamRun(requested, repository, env.GITHUB_TOKEN, fetchImpl);
  const sourceBuffer = await readRepositoryFile(
    sourceDirectory, upstream.headSha, contract.sourceReference, MAX_SOURCE_BYTES
  );
  if (sourceBuffer === null) {
    throw new Error(`Continuity sourceReference does not exist in the checked-out repository: ${contract.sourceReference}`);
  }

  const proxyUrl = env.AXI_CONTINUITY_PROXY_URL;
  const adminPassword = env.AXI_CONTINUITY_ADMIN_PASSWORD;
  if (!isNonEmptyString(proxyUrl) || !isNonEmptyString(adminPassword)) {
    throw new Error(
      "AXI continuity proxy secrets are required when a valid contract is present: set AXI_CONTINUITY_PROXY_URL and AXI_CONTINUITY_ADMIN_PASSWORD."
    );
  }
  const proxy = new URL(proxyUrl);
  if (proxy.protocol !== "https:" || proxy.username || proxy.password || proxy.search || proxy.hash ||
    proxy.pathname !== "/") {
    throw new Error("AXI_CONTINUITY_PROXY_URL must be an HTTPS origin without credentials, path, query, or fragment.");
  }

  const requestBody = {
    repository,
    workflowRun: upstream,
    coordinate: {
      label: contract.label,
      sourceRecord: contract.sourceRecord,
      originCheckpoint: contract.originCheckpoint,
      sourceReference: contract.sourceReference,
      sourceSha256: crypto.createHash("sha256").update(sourceBuffer).digest("hex"),
      contractPath
    }
  };

  const response = await fetchImpl(new URL("/api/automation/workflow-run-continuity", proxy), {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`admin:${adminPassword}`).toString("base64")}`,
      "Content-Type": "application/json",
      "X-AXIOM-Workflow-Continuity": "record"
    },
    body: JSON.stringify(requestBody),
    redirect: "error",
    signal: AbortSignal.timeout(60_000)
  });
  if (!response.ok) {
    throw new Error(`Workflow continuity request failed with HTTP ${response.status}`);
  }
  const payload = await response.json();
  validateRecordedResult(payload, requestBody);

  writeOutput("status", payload.status, env);
  writeOutput("idempotency_key", payload.idempotencyKey, env);
  writeOutput("task_id", payload.task.id, env);
  writeOutput("run_id", payload.run.id, env);
  await appendSummary([
    `### AXI workflow continuity: ${payload.status}`,
    "",
    `- Upstream workflow run: ${upstream.name} #${upstream.id}`,
    `- Verified upstream attempt: ${upstream.runAttempt}`,
    `- Branch: \`${upstream.headBranch}\``,
    `- Commit: \`${upstream.headSha}\``,
    `- Contract: \`${contractPath}\``,
    `- Source reference: \`${contract.sourceReference}\``,
    `- Source record: \`${contract.sourceRecord}\``,
    `- Origin checkpoint: \`${contract.originCheckpoint}\``,
    `- Task ID: \`${payload.task.id}\``,
    `- Run ID: \`${payload.run.id}\``
  ], env);
  return payload;
}

async function readRepositoryFile(directory, sha, reference, maximumBytes) {
  const options = { timeout: 15_000, maxBuffer: maximumBytes + 1024 };
  // Read raw, tracked blobs: no checkout filters, executable code, symlinks,
  // untracked files, or platform line-ending conversions can supply evidence.
  const { stdout: entry } = await execFileAsync("git", [
    "--literal-pathspecs", "-C", directory, "ls-tree", "-z", "--full-tree", sha, "--", reference
  ], options);
  if (!entry) return null;
  const match = /^(100644|100755) blob ([a-f0-9]{40})\t([^\0]+)\0$/.exec(entry);
  if (!match || match[3] !== reference) {
    throw new Error(`Continuity reference must be a regular tracked file: ${reference}`);
  }
  const { stdout: size } = await execFileAsync("git", ["-C", directory, "cat-file", "-s", match[2]], options);
  if (!Number.isSafeInteger(Number(size)) || Number(size) > maximumBytes) {
    throw new Error(`Continuity reference exceeds ${maximumBytes} bytes: ${reference}`);
  }
  const { stdout } = await execFileAsync("git", ["-C", directory, "cat-file", "blob", match[2]], {
    ...options, encoding: "buffer"
  });
  return stdout;
}

async function readContract(directory, sha, contractPath) {
  const contents = await readRepositoryFile(directory, sha, contractPath, MAX_CONTRACT_BYTES);
  if (contents === null) return null;
  let contract;
  try {
    contract = JSON.parse(contents);
  } catch (error) {
    throw new Error(`Continuity contract is not valid JSON: ${contractPath}`);
  }
  const allowedFields = new Set([
    "schemaVersion",
    "label",
    "sourceRecord",
    "originCheckpoint",
    "sourceReference"
  ]);
  if (!isRecord(contract) || Object.keys(contract).some((field) => !allowedFields.has(field))) {
    throw new Error(`Continuity contract contains unsupported fields: ${contractPath}`);
  }
  if (contract.schemaVersion !== 1) {
    throw new Error(`Continuity contract schemaVersion must be 1: ${contractPath}`);
  }
  if (!isBoundedString(contract.label, 120)) {
    throw new Error(`Continuity contract label must be a non-empty string up to 120 characters: ${contractPath}`);
  }
  if (typeof contract.sourceRecord !== "string" ||
    !/^[A-Z][A-Z0-9-]{2,119}$/.test(contract.sourceRecord)) {
    throw new Error(`Continuity contract sourceRecord must be an uppercase identifier: ${contractPath}`);
  }
  if (typeof contract.originCheckpoint !== "string" ||
    !/^[a-z][a-z0-9-]{2,119}$/.test(contract.originCheckpoint)) {
    throw new Error(`Continuity contract originCheckpoint must be a lowercase kebab-case identifier: ${contractPath}`);
  }
  return {
    label: contract.label.trim(),
    sourceRecord: contract.sourceRecord.trim(),
    originCheckpoint: contract.originCheckpoint.trim(),
    sourceReference: normalizeRepositoryRelativePath(contract.sourceReference, "continuity contract sourceReference")
  };
}

function normalizeUpstreamContext({
  eventName,
  repository,
  event,
  workflowName,
  runId,
  runAttempt,
  headBranch,
  headSha
}) {
  if (typeof repository !== "string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error("GITHUB_REPOSITORY must be an owner/name string.");
  }
  if (eventName === "workflow_run") {
    const workflowRun = event.workflow_run;
    if (!isRecord(workflowRun) ||
      workflowRun.status !== "completed" ||
      workflowRun.conclusion !== "success" ||
      workflowRun.name !== WORKFLOW_NAME ||
      workflowRun.head_repository?.full_name !== repository ||
      !isBoundedString(workflowRun.head_branch, 200) ||
      !/^copilot\/\S+$/.test(workflowRun.head_branch) ||
      typeof workflowRun.head_sha !== "string" ||
      !/^[0-9a-f]{40}$/i.test(workflowRun.head_sha) ||
      !isPositiveIntegerLike(workflowRun.id) ||
      !isPositiveIntegerLike(workflowRun.run_attempt) ||
      workflowRun.html_url !== `https://github.com/${repository}/actions/runs/${workflowRun.id}`) {
      throw new Error("workflow_run payload does not contain a valid successful upstream workflow run.");
    }
    return {
      id: String(workflowRun.id).trim(),
      name: workflowRun.name,
      htmlUrl: workflowRun.html_url,
      headBranch: workflowRun.head_branch,
      headSha: workflowRun.head_sha.toLowerCase(),
      conclusion: workflowRun.conclusion,
      runAttempt: String(workflowRun.run_attempt)
    };
  }
  if (eventName !== "workflow_dispatch") {
    throw new Error(`Unsupported event for workflow continuity automation: ${eventName}`);
  }
  if (!isPositiveIntegerLike(runId)) {
    throw new Error("workflow_dispatch requires AXI_CONTINUITY_UPSTREAM_RUN_ID.");
  }
  if (!isBoundedString(headBranch, 200) || !/^copilot\/\S+$/.test(headBranch)) {
    throw new Error("workflow_dispatch requires a copilot/ AXI_CONTINUITY_UPSTREAM_HEAD_BRANCH.");
  }
  if (typeof headSha !== "string" || !/^[0-9a-f]{40}$/i.test(headSha.trim())) {
    throw new Error("workflow_dispatch requires AXI_CONTINUITY_UPSTREAM_HEAD_SHA.");
  }
  if (workflowName && workflowName !== WORKFLOW_NAME) {
    throw new Error("workflow_dispatch upstream workflow is not allowlisted.");
  }
  if (runAttempt && !isPositiveIntegerLike(runAttempt)) {
    throw new Error("workflow_dispatch upstream run attempt must be a positive integer.");
  }
  return {
    id: String(runId).trim(),
    name: WORKFLOW_NAME,
    headBranch: headBranch.trim(),
    headSha: headSha.trim().toLowerCase(),
    ...(runAttempt ? { runAttempt: String(runAttempt).trim() } : {})
  };
}

async function verifyUpstreamRun(requested, repository, token, fetchImpl) {
  if (!isNonEmptyString(token)) {
    throw new Error("GITHUB_TOKEN with actions:read is required to verify the upstream run.");
  }
  const attemptPath = requested.runAttempt ? `/attempts/${requested.runAttempt}` : "";
  const response = await fetchImpl(
    `https://api.github.com/repos/${repository}/actions/runs/${requested.id}${attemptPath}`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      redirect: "error",
      signal: AbortSignal.timeout(15_000)
    }
  );
  if (!response.ok) {
    throw new Error(`Upstream workflow verification failed with HTTP ${response.status}.`);
  }
  const run = await response.json();
  if (run.repository?.full_name !== repository) {
    throw new Error("Upstream workflow repository does not match GITHUB_REPOSITORY.");
  }
  const verified = normalizeUpstreamContext({
    eventName: "workflow_run", repository, event: { workflow_run: run }
  });
  for (const field of ["id", "name", "headBranch", "headSha", "runAttempt"]) {
    if (requested[field] !== undefined && requested[field] !== verified[field]) {
      throw new Error(`Verified upstream workflow ${field} does not match the supplied context.`);
    }
  }
  return verified;
}

function validateRecordedResult(payload, request) {
  const result = payload?.run?.result;
  const identifier = /^[a-f0-9-]{36}$/;
  const hash = /^[a-f0-9]{64}$/;
  if (!isRecord(payload) || !["recorded", "already-recorded"].includes(payload.status) ||
    !hash.test(payload.idempotencyKey || "") ||
    !identifier.test(payload.task?.id || "") || payload.task.status !== "completed" ||
    payload.task.action !== "coordinate.record" ||
    !identifier.test(payload.run?.id || "") || payload.run.status !== "completed" ||
    payload.run.taskId !== payload.task.id || payload.run.action !== "coordinate.record" ||
    !hash.test(result?.coordinate?.coordinateHash || "") ||
    result.idempotencyKey !== payload.idempotencyKey ||
    result.sourceReference !== request.coordinate.sourceReference ||
    result.sourceSha256 !== request.coordinate.sourceSha256 ||
    result.workflowRun?.id !== request.workflowRun.id ||
    result.workflowRun?.headSha !== request.workflowRun.headSha) {
    throw new Error("Workflow continuity response lacks a matching completed task, run, and coordinate.");
  }
}

function normalizeRepositoryRelativePath(value, label) {
  if (!isBoundedString(value, 200)) {
    throw new Error(`${label} must be a repository-relative path up to 200 characters.`);
  }
  const normalized = value.trim().replaceAll("\\", "/");
  const segments = normalized.split("/");
  if (normalized.startsWith("/") || /[:\x00-\x1f\x7f]/.test(normalized) ||
    segments.some((segment) => segment === "" || segment === "." || segment === ".." ||
      segment.toLowerCase() === ".git")) {
    throw new Error(`${label} must be a repository-relative path up to 200 characters.`);
  }
  return normalized;
}

function isPositiveIntegerLike(value) {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0;
  }
  return typeof value === "string" && /^[1-9][0-9]{0,19}$/.test(value.trim());
}

function isBoundedString(value, maximumLength) {
  return typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maximumLength;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function writeOutput(key, value, env = process.env) {
  if (!env.GITHUB_OUTPUT) {
    return;
  }
  require("node:fs").appendFileSync(env.GITHUB_OUTPUT, `${key}=${String(value)}\n`, "utf8");
}

async function appendSummary(lines, env = process.env) {
  if (!env.GITHUB_STEP_SUMMARY) {
    return;
  }
  await fs.appendFile(env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`, "utf8");
}

async function writeResult({ status, message }, env) {
  writeOutput("status", status, env);
  await appendSummary([`### AXI workflow continuity: ${status}`, "", message], env);
  return { status, message };
}

module.exports = { main, normalizeUpstreamContext, readContract, readRepositoryFile, verifyUpstreamRun };

if (require.main === module) {
  main().catch(async (error) => {
    writeOutput("status", "failed");
    await appendSummary([`### AXI workflow continuity: failed`, "", `- Error: ${error.message}`]);
    console.error(error.message);
    process.exitCode = 1;
  });
}
