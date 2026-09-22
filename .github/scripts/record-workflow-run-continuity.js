#!/usr/bin/env node

const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

const DEFAULT_CONTRACT_PATH = ".github/axi/origin-coordinate.json";

async function main() {
  const eventName = process.env.GITHUB_EVENT_NAME;
  const repository = process.env.GITHUB_REPOSITORY;
  const workspace = process.env.GITHUB_WORKSPACE;
  const event = JSON.parse(await fs.readFile(process.env.GITHUB_EVENT_PATH, "utf8"));
  const contractPath = normalizeRepositoryRelativePath(
    process.env.AXI_CONTINUITY_CONTRACT_PATH || DEFAULT_CONTRACT_PATH,
    "continuity contract path"
  );
  const upstream = normalizeUpstreamContext({
    eventName,
    repository,
    event,
    workflowName: process.env.AXI_CONTINUITY_UPSTREAM_WORKFLOW_NAME,
    runId: process.env.AXI_CONTINUITY_UPSTREAM_RUN_ID,
    headBranch: process.env.AXI_CONTINUITY_UPSTREAM_HEAD_BRANCH,
    headSha: process.env.AXI_CONTINUITY_UPSTREAM_HEAD_SHA
  });

  const contract = await readContract(workspace, contractPath);
  if (contract === null) {
    if (eventName === "workflow_run") {
      return writeResult({
        status: "skipped-no-contract",
        message: `No explicit continuity contract was found at ${contractPath} for ${upstream.headBranch}@${upstream.headSha}.`
      });
    }
    throw new Error(`No continuity contract was found at ${contractPath}.`);
  }

  const sourceReferencePath = path.join(workspace, contract.sourceReference);
  const sourceBuffer = await fs.readFile(sourceReferencePath).catch(() => null);
  if (!sourceBuffer) {
    throw new Error(`Continuity sourceReference does not exist in the checked-out repository: ${contract.sourceReference}`);
  }

  const proxyUrl = process.env.AXI_CONTINUITY_PROXY_URL;
  const adminPassword = process.env.AXI_CONTINUITY_ADMIN_PASSWORD;
  if (!isNonEmptyString(proxyUrl) || !isNonEmptyString(adminPassword)) {
    throw new Error(
      "AXI continuity proxy secrets are required when a valid contract is present: set AXI_CONTINUITY_PROXY_URL and AXI_CONTINUITY_ADMIN_PASSWORD."
    );
  }

  const requestBody = {
    repository,
    workflowRun: {
      id: upstream.id,
      name: upstream.name,
      htmlUrl: upstream.htmlUrl,
      headBranch: upstream.headBranch,
      headSha: upstream.headSha,
      conclusion: "success"
    },
    coordinate: {
      label: contract.label,
      sourceRecord: contract.sourceRecord,
      originCheckpoint: contract.originCheckpoint,
      sourceReference: contract.sourceReference,
      sourceSha256: crypto.createHash("sha256").update(sourceBuffer).digest("hex"),
      contractPath
    }
  };

  const response = await fetch(new URL("/api/automation/workflow-run-continuity", proxyUrl), {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`admin:${adminPassword}`).toString("base64")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(60_000)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Workflow continuity request failed with HTTP ${response.status}`);
  }
  if (payload.status !== "recorded" && payload.status !== "already-recorded") {
    throw new Error(`Workflow continuity request did not complete a coordinate transition (status: ${payload.status || "unknown"}).`);
  }

  writeOutput("status", payload.status);
  writeOutput("idempotency_key", payload.idempotencyKey || "");
  writeOutput("task_id", payload.task?.id || "");
  writeOutput("run_id", payload.run?.id || "");
  await appendSummary([
    `### AXI workflow continuity: ${payload.status}`,
    "",
    `- Upstream workflow run: ${upstream.name} #${upstream.id}`,
    `- Branch: \`${upstream.headBranch}\``,
    `- Commit: \`${upstream.headSha}\``,
    `- Contract: \`${contractPath}\``,
    `- Source reference: \`${contract.sourceReference}\``,
    `- Source record: \`${contract.sourceRecord}\``,
    `- Origin checkpoint: \`${contract.originCheckpoint}\``,
    `- Task ID: \`${payload.task?.id || "n/a"}\``,
    `- Run ID: \`${payload.run?.id || "n/a"}\``
  ]);
}

async function readContract(workspace, contractPath) {
  const contractFile = path.join(workspace, contractPath);
  let contents;
  try {
    contents = await fs.readFile(contractFile, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
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
  headBranch,
  headSha
}) {
  if (eventName === "workflow_run") {
    const workflowRun = event.workflow_run;
    if (!isRecord(workflowRun) ||
      workflowRun.conclusion !== "success" ||
      !isNonEmptyString(workflowRun.name) ||
      !isNonEmptyString(workflowRun.head_branch) ||
      !isNonEmptyString(workflowRun.head_sha) ||
      !/^[0-9a-f]{40}$/i.test(workflowRun.head_sha) ||
      !isPositiveIntegerLike(workflowRun.id)) {
      throw new Error("workflow_run payload does not contain a valid successful upstream workflow run.");
    }
    return {
      id: String(workflowRun.id).trim(),
      name: workflowRun.name.trim(),
      htmlUrl: `https://github.com/${repository}/actions/runs/${workflowRun.id}`,
      headBranch: workflowRun.head_branch.trim(),
      headSha: workflowRun.head_sha.toLowerCase()
    };
  }
  if (eventName !== "workflow_dispatch") {
    throw new Error(`Unsupported event for workflow continuity automation: ${eventName}`);
  }
  if (!isPositiveIntegerLike(runId)) {
    throw new Error("workflow_dispatch requires AXI_CONTINUITY_UPSTREAM_RUN_ID.");
  }
  if (!isBoundedString(headBranch, 200)) {
    throw new Error("workflow_dispatch requires AXI_CONTINUITY_UPSTREAM_HEAD_BRANCH.");
  }
  if (typeof headSha !== "string" || !/^[0-9a-f]{40}$/i.test(headSha.trim())) {
    throw new Error("workflow_dispatch requires AXI_CONTINUITY_UPSTREAM_HEAD_SHA.");
  }
  return {
    id: String(runId).trim(),
    name: isBoundedString(workflowName, 200)
      ? workflowName.trim()
      : "Running Copilot cloud agent",
    htmlUrl: `https://github.com/${repository}/actions/runs/${String(runId).trim()}`,
    headBranch: headBranch.trim(),
    headSha: headSha.trim().toLowerCase()
  };
}

function normalizeRepositoryRelativePath(value, label) {
  if (!isBoundedString(value, 200)) {
    throw new Error(`${label} must be a repository-relative path up to 200 characters.`);
  }
  const normalized = value.trim().replaceAll("\\", "/");
  const segments = normalized.split("/");
  if (normalized.startsWith("/") || segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
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

function writeOutput(key, value) {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }
  require("node:fs").appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${String(value)}\n`, "utf8");
}

async function appendSummary(lines) {
  if (!process.env.GITHUB_STEP_SUMMARY) {
    return;
  }
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`, "utf8");
}

async function writeResult({ status, message }) {
  writeOutput("status", status);
  await appendSummary([`### AXI workflow continuity: ${status}`, "", message]);
}

main().catch(async (error) => {
  writeOutput("status", "failed");
  await appendSummary([`### AXI workflow continuity: failed`, "", `- Error: ${error.message}`]);
  console.error(error.message);
  process.exitCode = 1;
});
