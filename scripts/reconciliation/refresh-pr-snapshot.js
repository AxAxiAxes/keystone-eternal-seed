#!/usr/bin/env node
// Refreshes docs/reconciliation/sources/pr-snapshot.v1.json from the GitHub
// REST API (read-only: GET /repos/{owner}/{repo}/pulls?state=all).
//
// Safety: performs only read requests against api.github.com for the named
// repository, writes only the snapshot file, and keeps the snapshot's
// boundary statement. The token is read from GITHUB_TOKEN and never written
// or logged.
//
// Usage (normally from the Reconciliation refresh workflow):
//   GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo node scripts/reconciliation/refresh-pr-snapshot.js [--date YYYY-MM-DD] [--root <dir>]
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const SNAPSHOT_PATH = "docs/reconciliation/sources/pr-snapshot.v1.json";
const REPOSITORY_PATTERN = /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/;
const MAX_PAGES = 50;

function isoDate(value) {
  return typeof value === "string" && value.length >= 10 ? value.slice(0, 10) : null;
}

function toEntry(pull) {
  const state = pull.state === "open" ? "open" : pull.merged_at ? "merged" : "closed-unmerged";
  return {
    number: pull.number,
    title: String(pull.title || "").replace(/\s+/g, " ").trim(),
    state,
    createdAt: isoDate(pull.created_at),
    closedAt: state === "open" ? null : isoDate(pull.merged_at || pull.closed_at),
    headRef: pull.head && typeof pull.head.ref === "string" ? pull.head.ref : ""
  };
}

function buildSnapshot(pulls, previous, repository, recordedAt) {
  if (!REPOSITORY_PATTERN.test(repository)) throw new Error(`Invalid repository: ${JSON.stringify(repository)}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(recordedAt)) throw new Error(`Invalid date: ${JSON.stringify(recordedAt)}`);
  const byNumber = new Map();
  for (const pull of pulls) {
    if (!Number.isInteger(pull.number) || pull.number < 1) continue;
    byNumber.set(pull.number, toEntry(pull));
  }
  return {
    schemaVersion: "axes-pr-snapshot-v1",
    repository,
    recordedAt,
    recordedBy: "Reconciliation refresh workflow (read-only GitHub pull-request listing)",
    boundary: previous && typeof previous.boundary === "string"
      ? previous.boundary
      : "Point-in-time snapshot of pull-request metadata only (number, title, state, dates, head branch). It is not a live GitHub view, does not include PR bodies or review comments, and a 'merged' state proves only that the change reached the base branch, not that its claims are verified.",
    pullRequests: [...byNumber.values()].sort((a, b) => a.number - b.number)
  };
}

async function fetchAllPulls(repository, token, fetchImpl = fetch) {
  if (!REPOSITORY_PATTERN.test(repository)) throw new Error(`Invalid repository: ${JSON.stringify(repository)}`);
  const pulls = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = `https://api.github.com/repos/${repository}/pulls?state=all&per_page=100&sort=created&direction=asc&page=${page}`;
    const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "axes-reconciliation-refresh" };
    if (token) headers.Authorization = ["Bearer", token].join(" ");
    const response = await fetchImpl(url, { headers });
    if (!response.ok) throw new Error(`GitHub API returned ${response.status} for page ${page}`);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error("GitHub API returned a non-array response");
    pulls.push(...batch);
    if (batch.length < 100) return pulls;
  }
  throw new Error(`More than ${MAX_PAGES * 100} pull requests; raise MAX_PAGES deliberately`);
}

function parseArgs(argv) {
  const options = { root: process.cwd(), date: new Date().toISOString().slice(0, 10) };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--root" || arg === "--date") {
      const value = argv[index + 1];
      if (!value) throw new Error(`${arg} requires a value`);
      options[arg.slice(2)] = arg === "--root" ? path.resolve(value) : value;
      index += 1;
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

async function main(argv, env = process.env) {
  const options = parseArgs(argv);
  const repository = env.GITHUB_REPOSITORY || "";
  const file = path.join(options.root, SNAPSHOT_PATH);
  const previous = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
  const pulls = await fetchAllPulls(repository, env.GITHUB_TOKEN || "");
  const snapshot = buildSnapshot(pulls, previous, repository, options.date);
  fs.writeFileSync(file, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  process.stdout.write(`wrote ${SNAPSHOT_PATH} (${snapshot.pullRequests.length} pull requests, recorded ${snapshot.recordedAt})\n`);
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`Snapshot refresh failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = { SNAPSHOT_PATH, toEntry, buildSnapshot, fetchAllPulls, parseArgs };
