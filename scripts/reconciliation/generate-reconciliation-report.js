#!/usr/bin/env node
// Repository-only reconciliation report generator.
//
// Collects repository records (timeline, governance, origin, ownership,
// business-plan, accountability, memory, and a committed pull-request
// snapshot), classifies them with explicit status labels, reconciles the
// curated inputs against the files that actually exist, schedules the
// ordered founder-directive roadmap with ETAs and review findings, and
// renders the reports under docs/reconciliation/.
//
// Safety: reads only files inside the repository root, writes only the
// generated Markdown files listed in OUTPUT_FILES, makes no network, git,
// provider, or account calls, and uses no clock — output depends only on
// repository content, so re-running on the same tree is byte-identical.
//
// Usage:
//   node scripts/reconciliation/generate-reconciliation-report.js            # regenerate
//   node scripts/reconciliation/generate-reconciliation-report.js --check    # validate, warn if stale
//   node scripts/reconciliation/generate-reconciliation-report.js --check --strict  # fail if stale
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const CONFIG_PATH = "docs/reconciliation/sources/reconciliation-config.v1.json";
const SNAPSHOT_PATH = "docs/reconciliation/sources/pr-snapshot.v1.json";
const OUTPUT_DIR = "docs/reconciliation";
const OUTPUT_FILES = Object.freeze([
  "RECONCILIATION_INDEX.md",
  "PR_RECONCILIATION.md",
  "ORIGIN_OWNERSHIP_GOVERNANCE_MATRIX.md",
  "TIMELINE_AND_BUSINESS_SYNTHESIS.md",
  "MISSING_MEANING_AND_GAPS.md",
  "DIRECTIVES_ROADMAP_AND_ETA.md"
]);
const REGENERATE_COMMAND = "node scripts/reconciliation/generate-reconciliation-report.js";

const STATUS_LABELS = Object.freeze([
  "verified",
  "operational",
  "proposed",
  "symbolic",
  "historical",
  "blocked",
  "unfiled"
]);
const STATUS_DEFINITIONS = Object.freeze({
  verified: "Confirmed by a deterministic evidence probe against this repository, or by an official source already recorded in the repository and cited as verification evidence. A verified merge does not verify the claims inside a document.",
  operational: "Implemented in repository code or adopted as internal governance currently in force. Internal governance is not an external legal determination.",
  proposed: "Draft, plan, candidate offer, claim awaiting review, or open pull request awaiting a founder or professional decision.",
  symbolic: "Founder philosophical, cosmological, or creative framing preserved as an attributed statement. Not a technical, legal, scientific, or financial claim.",
  historical: "Preserved record of a past session, source, event, or superseded state.",
  blocked: "Requires an external, professional, account, or authorized human action that repository access cannot perform.",
  unfiled: "Meaning that is referenced but has no canonical record on the base branch: missing, empty, present only in an open pull request, or outside the repository."
});
const PR_STATES = Object.freeze(["merged", "open", "closed-unmerged"]);
const CONCEPT_KINDS = Object.freeze(["definition", "governance", "constitution", "declaration", "invention", "plan"]);
const INVENTORY_CATEGORIES = Object.freeze(["directive", "plan", "terminology", "invention", "definition", "document", "automation"]);
const REQUIRED_FOCUS_PRS = Object.freeze([173, 199, 201, 204, 205, 206, 217, 218, 219, 220]);
const ROADMAP_OWNERS = Object.freeze(["founder", "agent", "founder + agent", "founder + professional", "authorized operator"]);
const DONE_STATUSES = new Set(["verified", "operational", "historical"]);
const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const PR_THEME_RULES = Object.freeze([
  ["origin", /origin|genesis|anchor|coordinate|oorr|birth|eternal|creator/i],
  ["ownership", /owner|rights|\bip\b|patent|trademark|entity|license|notice|attribution|invention/i],
  ["governance", /constitution|governance|protocol|policy|safeguard|boundar|authority|declaration|charter/i],
  ["accountability", /accountab|audit|ledger|responsib|rating|loss|scope-match|self-measurement|task-record/i],
  ["review-process", /review|triage|template|merge|\bci\b|continuity|checkpoint|reconcil/i],
  ["business", /business|revenue|financial|budget|launch|contracting|income|investor|pricing|domain|dmc|market|plan\b/i],
  ["incident", /outage|\b50[23]\b|crash|broken|bug|stale|incident|hallucinat/i],
  ["symbolic-record", /statement|symbolism|framing|vocabulary|concept|letter|soul|sphere|temple|athanor|dome|image|seed/i]
]);
const RELEVANT_PR_THEMES = new Set(["origin", "ownership", "governance", "accountability", "review-process", "business"]);
const CORRECTION_PATTERN = /\b(correct\w*|clarif\w*|restor\w*|missed|recurr\w*|reconfirm\w*|re-?verif\w*|follow-?up|reconcil\w*|escalat\w*)\b/i;
const CAPTURE_PATTERN = /\b(record\w*|preserv\w*|document\w*|confirm\w*)\b/i;
const ORIGIN_OWNERSHIP_SLUG = /origin|owner|genesis|rights|attribution|declaration|creator|invention|patent|anchor|constitution|-ip-/i;
const SETBACK_SLUG = /loss|lost|broken|missed|not-found|outage|gap|fail|incident|crash|502|503|stale|dispute|recurr|declined|unverified|breach|regression|duplicate-automation/i;
const GAP_PHRASE = /\b(not yet filed|unfiled|not filed|not recorded|unrecorded|unverified|not verified|pending founder|founder action required|needs founder|not found|still missing|was lost|were lost|never existed)\b/i;

const DOMAIN_RULES = Object.freeze([
  ["constitution-governance", /CONSTITUTION|GOVERNANCE|SAFEGUARD|CHARTE|PROTOCOL|^AGENTS|SOVEREIGNTY|SOUL|DECLARATION|BILL OF ETERNAL RIGHTS|RIGHT_OF_SELF/i],
  ["origin", /ORIGIN|GENESIS|ANCHOR|COORDINATE|BIRTH|SEED|SACRED/i],
  ["ownership-ip", /OWNERSHIP|PATENT|INVENTION|ENTITY|LICENSE|NOTICE|IP PROTECTION|INTENT_AND_RIGHTS|LEGACY_BUSINESS|BOND/i],
  ["accountability", /ACCOUNTAB|AUDIT|LEDGER|PERFORMANCE|ACTION_QUEUE|DECISION_REGISTER|EVIDENCE|STATUS_REPORT|INVENTORY_20/i],
  ["business", /BUSINESS|REVENUE|FINANCIAL|BUDGET|INVESTOR|LAUNCH|INCOME|VENTURE|DOMAIN|DIRECTORY|CONSULTATION|DMC|CONTRACTING|URNUR|CHICHETKI|MARKET|VENDOR|OBJECTIVES|PLATFORM_PLAN|TIMELINE|FULFILLMENT|SERVICE_REGISTRY|APPLICATION_INVENTORY|ASSET_USE|RELEASE_C|SCHOOL|AXOUS|CREATOR_STUDIO/i],
  ["automation-platform", /AUTOMATION|ENGINE|RAILWAY|AXES_OS|BUILD_PROGRAM|MEMORY|CONTINU|RUNTIME|SOURCE_CATALOG|WEB_ACCESS|GITHUB|CHAT|EMAIL|CREATION_TOOLS|GUIDE|PROJECT_CONTEXT|AGENT_OPERATING|METRICS|ARCHIVE|README|INCIDENT|EXTERNAL_INTERACTION|DRAFT_RECORDS/i],
  ["symbolic-creative", /SYMBOLISM|CERTIFICATE|TEMPLE|ATHANOR|VISION|LETTER|HARMONICS|AXAXAR|SPHERE|DOME|PAGE_8|INTERACTIVE|INTEL REPORT|MASTER/i]
]);
const DOMAIN_ORDER = Object.freeze(["constitution-governance", "origin", "ownership-ip", "accountability", "business", "automation-platform", "symbolic-creative", "other"]);

// ---------------------------------------------------------------- utilities

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function isSafeRelativePath(value) {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value.includes("\\") || value.includes("\0")) return false;
  if (path.posix.isAbsolute(value) || /^[A-Za-z]:/.test(value)) return false;
  const normalized = path.posix.normalize(value);
  return normalized === value && !normalized.startsWith("../") && normalized !== "..";
}

function resolveInside(root, rel) {
  if (!isSafeRelativePath(rel)) throw new Error(`Unsafe repository path: ${JSON.stringify(rel)}`);
  const absolute = path.resolve(root, rel);
  const relative = path.relative(root, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path escapes repository root: ${rel}`);
  }
  return absolute;
}

function fileExists(root, rel) {
  try {
    const stat = fs.lstatSync(resolveInside(root, rel));
    return stat.isFile();
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return false;
    throw error;
  }
}

function readText(root, rel) {
  const absolute = resolveInside(root, rel);
  let stat;
  try {
    stat = fs.lstatSync(absolute);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return null;
    throw error;
  }
  if (!stat.isFile()) return null;
  const buffer = fs.readFileSync(absolute);
  if (buffer.subarray(0, 8192).includes(0)) return null;
  return buffer.toString("utf8").replace(/\r\n?/g, "\n");
}

function readJson(root, rel) {
  const text = readText(root, rel);
  if (text === null) throw new Error(`Missing required input: ${rel}`);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON in ${rel}: ${error.message}`);
  }
}

function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function isIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function addDays(date, days) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

function daysBetween(from, to) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

// Internal, content-addressed record identifier. It is deterministic (same
// content, same ID) and changes when the identifying content changes. It is
// not an external, legal, or registry filing.
function originId(kind, id, parts) {
  const digest = sha256([kind, id, ...parts].join("\u001f")).slice(0, 12).toUpperCase();
  return `AXES-OID-${kind}-${id}-${digest}`;
}

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function md(value) {
  return String(value === undefined || value === null ? "" : value)
    .replace(/\s+/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();
}

function truncate(value, max) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function code(value) {
  return "`" + String(value).replace(/`/g, "'") + "`";
}

function table(headers, rows) {
  const lines = [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`];
  for (const row of rows) lines.push(`| ${row.join(" | ")} |`);
  return lines.join("\n");
}

function linkFromReports(rel) {
  // Generated reports live in docs/reconciliation/; build a relative link.
  const target = path.posix.relative(OUTPUT_DIR, rel);
  return `[${md(rel)}](${encodeURI(target)})`;
}

// ---------------------------------------------------------------- collection

function walkFiles(root, relDir, excludeDirs) {
  const results = [];
  const stack = [relDir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (excludeDirs.has(current)) continue;
    let entries;
    try {
      entries = fs.readdirSync(resolveInside(root, current), { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    for (const entry of entries) {
      const rel = `${current}/${entry.name}`;
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
        stack.push(rel);
      } else if (entry.isFile()) {
        results.push(rel);
      }
    }
  }
  return results.sort(compareStrings);
}

function isTextCandidate(rel) {
  const ext = path.posix.extname(rel).toLowerCase();
  return ext === ".md" || ext === ".txt" || ext === "";
}

function extractTitle(text) {
  const match = text.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

function extractField(text, label) {
  const lines = text.split("\n");
  const prefix = `**${label}:**`;
  for (let index = 0; index < lines.length && index < 40; index += 1) {
    if (!lines[index].startsWith(prefix)) continue;
    const parts = [lines[index].slice(prefix.length)];
    for (let next = index + 1; next < lines.length && parts.length < 4; next += 1) {
      const line = lines[next];
      if (line.trim() === "" || line.startsWith("**") || line.startsWith("#")) break;
      parts.push(line);
    }
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }
  return "";
}

function extractPrRefs(text) {
  const found = new Set();
  const patterns = [
    /\bPRs?\s*#(\d{1,4})(?:\s*(?:-|–|to)\s*#?(\d{1,4}))?/gi,
    /\/pull\/(\d{1,4})\b/g,
    /\(#(\d{1,4})\)/g
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      found.add(Number(match[1]));
      if (match[2]) found.add(Number(match[2]));
    }
  }
  return [...found].filter((value) => value > 0).sort((a, b) => a - b);
}

function gapPhraseHits(text) {
  const lines = text.split("\n");
  const hits = [];
  lines.forEach((line, index) => {
    if (GAP_PHRASE.test(line)) hits.push(index + 1);
  });
  return hits;
}

function classifyDocument(rel, statusText, overrides) {
  const override = overrides.get(rel);
  if (override) return { status: override.status, rule: `override: ${override.reason}` };
  const name = path.posix.basename(rel);
  const status = (statusText || "").toLowerCase();
  if (/^(README|AGENTS|NOTICE|PROJECT_TIMELINE)\.md$/.test(rel) || rel === "docs/memory/README.md") {
    return { status: "operational", rule: "repository entry point or continuity index" };
  }
  if (rel.startsWith("docs/memory/")) return { status: "historical", rule: "continuity memory record" };
  if (rel.startsWith("docs/keystone/") && path.posix.extname(rel) === "") {
    return { status: "historical", rule: "preserved KEYSTONE founding source (extensionless)" };
  }
  if (status) {
    if (/historical|point-in-time|snapshot|reconstructed|preserved/.test(status)) return { status: "historical", rule: "status line: historical/preserved" };
    if (/symbolic|philosoph|dedication|design symbolism|founder-stated|founder-shared|conceptual|vision and reference/.test(status)) return { status: "symbolic", rule: "status line: symbolic/conceptual" };
    if (/blocking|founder action required|destination pending/.test(status)) return { status: "blocked", rule: "status line: blocking/pending external action" };
    if (/draft|propos|not approved|candidate|future|planned|planning|template|for founder review|concept|scoping|readiness/.test(status)) return { status: "proposed", rule: "status line: draft/proposal/future" };
    if (/active|implemented|shipped|adopted|governing|constitution|foundation|protocol|repository-controlled|register|registry|record|inventory|checklist|guide|overlay|program|framework|access|capability|plan|synthesis|coordination|assessment|research/.test(status)) {
      return { status: "operational", rule: "status line: active/adopted record" };
    }
  }
  if (/SACRED|CERTIFICATE|SYMBOLISM|SOUL|LETTER|HARMONICS|TEMPLE|ATHANOR|VISION/i.test(name)) return { status: "symbolic", rule: "filename: symbolic/creative source" };
  if (/INCIDENT|STATUS_REPORT|AUDIT|INVENTORY_20|VENTURE_ANALYSIS|INSTITUTIONAL_MEMORY|MASTER_CONSOLIDATED|PATENT_APPLICATION/i.test(name)) return { status: "historical", rule: "filename: dated report or preserved source" };
  if (/READINESS/i.test(name)) return { status: "blocked", rule: "filename: readiness gate" };
  if (/PLAN|PROPOSAL|TIMELINE|BRIEF/i.test(name)) return { status: "proposed", rule: "filename: plan/proposal" };
  if (/^(README|AGENTS|NOTICE|PROJECT_TIMELINE)\.md$|RUNBOOK|SERVICE|INTEGRATION|DEPLOYMENT|TRACKER|PROTOCOL|WORKFLOW|TEMPLATE/i.test(name)) {
    return { status: "operational", rule: "filename: operating record" };
  }
  return { status: "proposed", rule: "default: unclassified material is never treated as verified" };
}

function classifyDomain(rel, title) {
  const subject = `${path.posix.basename(rel)} ${title}`;
  for (const [domain, pattern] of DOMAIN_RULES) {
    if (pattern.test(path.posix.basename(rel))) return domain;
  }
  for (const [domain, pattern] of DOMAIN_RULES) {
    if (pattern.test(subject)) return domain;
  }
  return "other";
}

function prThemes(title) {
  return PR_THEME_RULES.filter(([, pattern]) => pattern.test(title)).map(([theme]) => theme);
}

function evaluateProbe(root, probe) {
  if (!probe || !isSafeRelativePath(probe.path)) return { ok: false, detail: "invalid probe" };
  if (probe.type === "path") {
    const ok = fileExists(root, probe.path);
    return { ok, detail: ok ? "file present on this tree" : "file absent on this tree" };
  }
  if (probe.type === "contains") {
    const text = readText(root, probe.path);
    if (text === null) return { ok: false, detail: "file absent on this tree" };
    const ok = text.includes(probe.text);
    return { ok, detail: ok ? `contains ${JSON.stringify(probe.text)}` : `does not contain ${JSON.stringify(probe.text)}` };
  }
  return { ok: false, detail: `unknown probe type ${JSON.stringify(probe.type)}` };
}

function splitTableRow(line) {
  const cells = line.split(/(?<!\\)\|/).map((cell) => cell.trim());
  return cells.slice(1, cells.length - 1);
}

function parseTimeline(text) {
  const rows = [];
  const checkpoints = [];
  if (!text) return { rows, checkpoints };
  const lines = text.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\|\s*\d{4}-\d{2}-\d{2}/.test(line)) {
      const cells = splitTableRow(line);
      const date = cells[0].slice(0, 10);
      rows.push({ date, status: cells[1] || "", milestone: cells[2] || "", line: index + 1 });
      continue;
    }
    const checkpoint = line.match(/^- \[( |x|X)\]\s+(.*)$/);
    if (checkpoint) {
      const parts = [checkpoint[2]];
      for (let next = index + 1; next < lines.length && /^\s{2,}\S/.test(lines[next]); next += 1) {
        parts.push(lines[next].trim());
      }
      checkpoints.push({ checked: checkpoint[1] !== " ", text: parts.join(" "), line: index + 1 });
    }
  }
  return { rows, checkpoints };
}

function memoryRecordFromPath(rel, text) {
  const name = path.posix.basename(rel, ".md");
  const match = name.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!match) return null;
  return {
    path: rel,
    date: match[1],
    slug: name,
    title: extractTitle(text) || name,
    originOwnership: ORIGIN_OWNERSHIP_SLUG.test(name),
    setback: SETBACK_SLUG.test(name)
  };
}

// ---------------------------------------------------------------- validation

function validateInputs(root, config, snapshot) {
  const errors = [];
  const fail = (message) => errors.push(message);
  const prNumbers = new Set();

  if (!snapshot || snapshot.schemaVersion !== "axes-pr-snapshot-v1") fail("PR snapshot schemaVersion must be axes-pr-snapshot-v1");
  if (!snapshot || !/^\d{4}-\d{2}-\d{2}$/.test(String(snapshot.recordedAt))) fail("PR snapshot recordedAt must be YYYY-MM-DD");
  const pullRequests = snapshot && Array.isArray(snapshot.pullRequests) ? snapshot.pullRequests : [];
  if (pullRequests.length === 0) fail("PR snapshot must list pullRequests");
  for (const pr of pullRequests) {
    if (!Number.isInteger(pr.number) || pr.number < 1) { fail(`PR snapshot entry has invalid number: ${JSON.stringify(pr.number)}`); continue; }
    if (prNumbers.has(pr.number)) fail(`PR snapshot lists #${pr.number} more than once`);
    prNumbers.add(pr.number);
    if (!PR_STATES.includes(pr.state)) fail(`PR #${pr.number} has invalid state ${JSON.stringify(pr.state)}`);
    if (typeof pr.title !== "string" || pr.title.trim() === "") fail(`PR #${pr.number} is missing a title`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(pr.createdAt))) fail(`PR #${pr.number} createdAt must be YYYY-MM-DD`);
    if (pr.state !== "open" && !/^\d{4}-\d{2}-\d{2}$/.test(String(pr.closedAt))) fail(`PR #${pr.number} closedAt must be YYYY-MM-DD when not open`);
  }

  if (!config || config.schemaVersion !== "axes-reconciliation-config-v1") fail("Config schemaVersion must be axes-reconciliation-config-v1");
  if (!config || !/^\d{4}-\d{2}-\d{2}$/.test(String(config.recordedAt))) fail("Config recordedAt must be YYYY-MM-DD");
  if (!config) return { errors, prNumbers };

  const checkRefs = (context, refs) => {
    if (!Array.isArray(refs) || refs.length === 0) { fail(`${context}: sourceRefs must be a non-empty array`); return; }
    for (const ref of refs) {
      const prMatch = typeof ref === "string" ? ref.match(/^pr:#(\d+)$/) : null;
      if (prMatch) {
        if (!prNumbers.has(Number(prMatch[1]))) fail(`${context}: ${ref} is not in the PR snapshot`);
      } else if (!isSafeRelativePath(ref)) {
        fail(`${context}: unsafe source path ${JSON.stringify(ref)}`);
      } else if (!fileExists(root, ref)) {
        fail(`${context}: source ${ref} does not exist`);
      }
    }
  };
  const checkStatus = (context, status) => {
    if (!STATUS_LABELS.includes(status)) fail(`${context}: status ${JSON.stringify(status)} is not one of ${STATUS_LABELS.join(", ")}`);
  };
  const checkVerified = (context, item) => {
    if (item.status !== "verified") return;
    if (!Array.isArray(item.verificationEvidence) || item.verificationEvidence.length === 0) {
      fail(`${context}: status verified requires verificationEvidence`);
    } else {
      checkRefs(`${context} verificationEvidence`, item.verificationEvidence);
    }
  };

  const parties = Array.isArray(config.responsibleParties) ? config.responsibleParties : [];
  const roles = parties.map((party) => party.role);
  for (const required of ["Founder / human owner", "GitHub repository / account context", "Assigned completion agent"]) {
    if (!roles.includes(required)) fail(`responsibleParties must include role ${JSON.stringify(required)}`);
  }
  parties.forEach((party, index) => {
    for (const field of ["role", "name", "authority", "boundary"]) {
      if (typeof party[field] !== "string" || party[field].trim() === "") fail(`responsibleParties[${index}].${field} is required`);
    }
    checkRefs(`responsibleParties[${index}]`, party.sourceRefs);
  });

  const requiredSources = Array.isArray(config.requiredSources) ? config.requiredSources : [];
  if (requiredSources.length === 0) fail("requiredSources must not be empty");
  requiredSources.forEach((source, index) => {
    if (!isSafeRelativePath(source.path)) fail(`requiredSources[${index}] has unsafe path ${JSON.stringify(source.path)}`);
    checkStatus(`requiredSources[${index}] (${source.path})`, source.status);
    checkVerified(`requiredSources[${index}]`, source);
  });

  (Array.isArray(config.classificationOverrides) ? config.classificationOverrides : []).forEach((override, index) => {
    if (!isSafeRelativePath(override.path)) fail(`classificationOverrides[${index}] has unsafe path`);
    checkStatus(`classificationOverrides[${index}]`, override.status);
    if (override.status === "verified") fail(`classificationOverrides[${index}]: overrides may not assign verified`);
    if (typeof override.reason !== "string" || override.reason.trim() === "") fail(`classificationOverrides[${index}].reason is required`);
  });

  const focus = Array.isArray(config.focusPullRequests) ? config.focusPullRequests : [];
  const focusNumbers = new Set();
  focus.forEach((entry, index) => {
    if (!Number.isInteger(entry.number)) { fail(`focusPullRequests[${index}].number must be an integer`); return; }
    if (focusNumbers.has(entry.number)) fail(`focusPullRequests lists #${entry.number} more than once`);
    focusNumbers.add(entry.number);
    if (!prNumbers.has(entry.number)) fail(`focusPullRequests #${entry.number} is not in the PR snapshot`);
    if (!Array.isArray(entry.evidence) || entry.evidence.length === 0) fail(`focusPullRequests #${entry.number} needs at least one evidence probe`);
    (entry.evidence || []).forEach((probe, probeIndex) => {
      if (!["path", "contains"].includes(probe.type)) fail(`focusPullRequests #${entry.number} evidence[${probeIndex}] has unknown type`);
      if (!isSafeRelativePath(probe.path)) fail(`focusPullRequests #${entry.number} evidence[${probeIndex}] has unsafe path`);
      if (probe.type === "contains" && (typeof probe.text !== "string" || probe.text === "")) fail(`focusPullRequests #${entry.number} evidence[${probeIndex}] needs text`);
    });
  });
  for (const number of REQUIRED_FOCUS_PRS) {
    if (!focusNumbers.has(number)) fail(`focusPullRequests must include #${number}`);
  }

  (Array.isArray(config.chronologyPhases) ? config.chronologyPhases : []).forEach((phase, index) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(phase.start)) || !/^\d{4}-\d{2}-\d{2}$/.test(String(phase.end)) || phase.start > phase.end) {
      fail(`chronologyPhases[${index}] needs valid start <= end dates`);
    }
    checkRefs(`chronologyPhases[${index}]`, phase.sourceRefs);
  });

  (Array.isArray(config.originGovernanceConcepts) ? config.originGovernanceConcepts : []).forEach((concept, index) => {
    const context = `originGovernanceConcepts[${index}] (${concept.term})`;
    checkStatus(context, concept.status);
    if (!CONCEPT_KINDS.includes(concept.kind)) fail(`${context}: kind must be one of ${CONCEPT_KINDS.join(", ")}`);
    if (concept.status === "verified") fail(`${context}: concepts, terms, and definitions may not be labeled verified`);
    checkRefs(context, concept.sourceRefs);
  });

  (Array.isArray(config.valueMap) ? config.valueMap : []).forEach((entry, index) => {
    const context = `valueMap[${index}] (${entry.value})`;
    checkStatus(context, entry.status);
    checkVerified(context, entry);
    checkRefs(context, entry.sourceRefs);
  });

  const inventoryIds = new Set();
  (Array.isArray(config.inventory) ? config.inventory : []).forEach((item, index) => {
    const context = `inventory[${index}] (${item.id})`;
    if (typeof item.id !== "string" || inventoryIds.has(item.id)) fail(`${context}: id must be unique`);
    inventoryIds.add(item.id);
    checkStatus(context, item.status);
    checkVerified(context, item);
    if (!INVENTORY_CATEGORIES.includes(item.category)) fail(`${context}: category must be one of ${INVENTORY_CATEGORIES.join(", ")}`);
    for (const score of ["profit", "urgency"]) {
      if (!Number.isInteger(item[score]) || item[score] < 1 || item[score] > 5) fail(`${context}: ${score} must be an integer 1-5`);
    }
    checkRefs(context, item.sourceRefs);
  });

  (Array.isArray(config.knownGaps) ? config.knownGaps : []).forEach((gap, index) => {
    const context = `knownGaps[${index}] (${gap.id})`;
    checkStatus(context, gap.status);
    if (gap.status === "verified") fail(`${context}: a gap cannot be verified`);
    checkRefs(context, gap.sourceRefs);
  });

  const directives = Array.isArray(config.originalDirectives) ? config.originalDirectives : [];
  if (directives.length === 0) fail("originalDirectives must not be empty");
  const directiveIds = new Set();
  const directiveOrders = new Set();
  directives.forEach((directive, index) => {
    const context = `originalDirectives[${index}] (${directive.id})`;
    if (typeof directive.id !== "string" || directive.id === "" || directiveIds.has(directive.id)) fail(`${context}: id must be unique`);
    directiveIds.add(directive.id);
    if (!Number.isInteger(directive.order) || directive.order < 1 || directiveOrders.has(directive.order)) fail(`${context}: order must be a unique positive integer`);
    directiveOrders.add(directive.order);
    if (!isIsoDate(directive.given)) fail(`${context}: given must be a valid YYYY-MM-DD date`);
    for (const field of ["wording", "objective", "statusNote"]) {
      if (typeof directive[field] !== "string" || directive[field].trim() === "") fail(`${context}: ${field} is required`);
    }
    checkStatus(context, directive.status);
    if (directive.status === "verified") fail(`${context}: a directive's delivery cannot be labeled verified by curation`);
    checkRefs(context, directive.sourceRefs);
  });

  (Array.isArray(config.storySynopsis) ? config.storySynopsis : []).forEach((chapter, index) => {
    const context = `storySynopsis[${index}]`;
    if (!Number.isInteger(chapter.chapter)) fail(`${context}: chapter must be an integer`);
    if (!(config.chronologyPhases || []).some((phase) => phase.id === chapter.phase)) fail(`${context}: phase ${JSON.stringify(chapter.phase)} is not a chronology phase`);
    if (typeof chapter.text !== "string" || chapter.text.trim() === "") fail(`${context}: text is required`);
    checkRefs(context, chapter.sourceRefs);
  });

  const roadmap = config.roadmap && typeof config.roadmap === "object" ? config.roadmap : null;
  const steps = roadmap && Array.isArray(roadmap.steps) ? roadmap.steps : [];
  if (!roadmap || !isIsoDate(roadmap.startDate)) fail("roadmap.startDate must be a valid YYYY-MM-DD date");
  if (steps.length === 0) fail("roadmap.steps must not be empty");
  const stepIds = new Set();
  const stepOrders = new Set();
  steps.forEach((step) => {
    if (typeof step.id === "string" && step.id !== "") {
      if (stepIds.has(step.id)) fail(`roadmap step ${step.id}: id must be unique`);
      stepIds.add(step.id);
    }
  });
  const coveredDirectives = new Set();
  steps.forEach((step, index) => {
    const context = `roadmap.steps[${index}] (${step.id})`;
    if (typeof step.id !== "string" || step.id === "") fail(`${context}: id is required`);
    if (!Number.isInteger(step.order) || step.order < 1 || stepOrders.has(step.order)) fail(`${context}: order must be a unique positive integer`);
    stepOrders.add(step.order);
    for (const field of ["stage", "title", "acceptance"]) {
      if (typeof step[field] !== "string" || step[field].trim() === "") fail(`${context}: ${field} is required`);
    }
    if (!ROADMAP_OWNERS.includes(step.owner)) fail(`${context}: owner must be one of ${ROADMAP_OWNERS.join(", ")}`);
    if (!Number.isInteger(step.durationDays) || step.durationDays < 1 || step.durationDays > 365) fail(`${context}: durationDays must be an integer 1-365`);
    checkStatus(context, step.status);
    checkVerified(context, step);
    for (const dep of Array.isArray(step.dependsOn) ? step.dependsOn : [null]) {
      if (!stepIds.has(dep)) fail(`${context}: dependsOn ${JSON.stringify(dep)} is not a roadmap step`);
    }
    const stepDirectives = Array.isArray(step.directives) ? step.directives : [];
    if (stepDirectives.length === 0) fail(`${context}: directives must list at least one directive`);
    for (const directive of stepDirectives) {
      if (!directiveIds.has(directive)) fail(`${context}: directive ${JSON.stringify(directive)} is not defined`);
      coveredDirectives.add(directive);
    }
    for (const ref of Array.isArray(step.inventoryRefs) ? step.inventoryRefs : [null]) {
      if (!inventoryIds.has(ref)) fail(`${context}: inventoryRef ${JSON.stringify(ref)} is not an inventory id`);
    }
    for (const number of Array.isArray(step.prRefs) ? step.prRefs : [null]) {
      if (!prNumbers.has(number)) fail(`${context}: prRef ${JSON.stringify(number)} is not in the PR snapshot`);
    }
    checkRefs(context, step.sourceRefs);
  });
  for (const id of directiveIds) {
    if (!coveredDirectives.has(id)) fail(`originalDirectives ${id} has no roadmap step; every directive must be scheduled`);
  }
  if (steps.length > 0 && errors.length === 0 && scheduleRoadmap(roadmap) === null) fail("roadmap.steps dependencies contain a cycle");

  if (!config.missionNarrative || typeof config.missionNarrative.mission !== "string") fail("missionNarrative.mission is required");
  else checkRefs("missionNarrative", config.missionNarrative.sourceRefs);

  return { errors, prNumbers };
}

// ---------------------------------------------------------------- reconciliation model

function collect(root) {
  const config = readJson(root, CONFIG_PATH);
  const snapshot = readJson(root, SNAPSHOT_PATH);
  const { errors } = validateInputs(root, config, snapshot);
  const warnings = [];
  if (!config || typeof config !== "object" || !snapshot || typeof snapshot !== "object") {
    return { errors: errors.length > 0 ? errors : ["Reconciliation inputs must be JSON objects"], warnings };
  }

  const scan = config.scan || {};
  const excludeDirs = new Set(Array.isArray(scan.excludeDirs) ? scan.excludeDirs : []);
  const maxBytes = Number.isInteger(scan.maxFileBytes) ? scan.maxFileBytes : 2000000;
  const candidates = new Set();
  for (const rel of Array.isArray(scan.rootFiles) ? scan.rootFiles : []) {
    if (isSafeRelativePath(rel) && fileExists(root, rel)) candidates.add(rel);
  }
  for (const dir of Array.isArray(scan.roots) ? scan.roots : []) {
    if (!isSafeRelativePath(dir)) continue;
    for (const rel of walkFiles(root, dir, excludeDirs)) {
      if (isTextCandidate(rel)) candidates.add(rel);
    }
  }
  for (const source of config.requiredSources || []) {
    if (isSafeRelativePath(source.path) && fileExists(root, source.path)) candidates.add(source.path);
  }

  const overrides = new Map((config.classificationOverrides || []).map((entry) => [entry.path, entry]));
  const documents = [];
  const memoryRecords = [];
  for (const rel of [...candidates].sort(compareStrings)) {
    const absolute = resolveInside(root, rel);
    if (fs.statSync(absolute).size > maxBytes) { warnings.push(`Skipped oversized file ${rel}`); continue; }
    const text = readText(root, rel);
    if (text === null) continue;
    const statusText = extractField(text, "Status") || extractField(text, "Document type");
    const title = extractTitle(text);
    const classification = classifyDocument(rel, statusText, overrides);
    const doc = {
      path: rel,
      title,
      statusText,
      recorded: extractField(text, "Recorded"),
      lines: text === "" ? 0 : text.replace(/\n$/, "").split("\n").length,
      sha256: sha256(text),
      prRefs: extractPrRefs(text),
      gapLines: gapPhraseHits(text),
      domain: classifyDomain(rel, title),
      status: classification.status,
      rule: classification.rule
    };
    documents.push(doc);
    if (rel.startsWith("docs/memory/") && path.posix.basename(rel) !== "README.md") {
      const record = memoryRecordFromPath(rel, text);
      if (record) memoryRecords.push(record);
    }
  }
  memoryRecords.sort((a, b) => compareStrings(a.date, b.date) || compareStrings(a.path, b.path));
  const documentsByPath = new Map(documents.map((doc) => [doc.path, doc]));

  const timelineText = readText(root, "PROJECT_TIMELINE.md");
  const timeline = parseTimeline(timelineText);

  const pullRequests = [...(snapshot.pullRequests || [])].sort((a, b) => a.number - b.number);
  const prByNumber = new Map(pullRequests.map((pr) => [pr.number, pr]));
  const citations = new Map();
  for (const doc of documents) {
    for (const number of doc.prRefs) {
      if (!citations.has(number)) citations.set(number, []);
      citations.get(number).push(doc.path);
    }
  }
  const unknownCitedPrs = [...citations.keys()].filter((number) => !prByNumber.has(number)).sort((a, b) => a - b);

  const focusByNumber = new Map((config.focusPullRequests || []).map((entry) => [entry.number, entry]));
  const prRecords = pullRequests.map((pr) => {
    const focus = focusByNumber.get(pr.number) || null;
    const themes = [...new Set([...(focus ? focus.themes || [] : []), ...prThemes(pr.title)])].sort(compareStrings);
    const probes = focus ? (focus.evidence || []).map((probe) => ({ probe, result: evaluateProbe(root, probe) })) : [];
    const record = {
      ...pr,
      themes,
      focus,
      probes,
      citedBy: (citations.get(pr.number) || []).slice().sort(compareStrings),
      relevant: Boolean(focus) || themes.some((theme) => RELEVANT_PR_THEMES.has(theme)),
      correction: CORRECTION_PATTERN.test(pr.title),
      capture: CAPTURE_PATTERN.test(pr.title)
    };
    record.reconciliation = reconcilePr(record);
    return record;
  });

  const requiredSources = (config.requiredSources || []).map((source) => {
    const doc = documentsByPath.get(source.path) || null;
    return { ...source, present: Boolean(doc), doc };
  });

  const fingerprint = sha256(
    [
      `${CONFIG_PATH}\t${sha256(JSON.stringify(config))}`,
      `${SNAPSHOT_PATH}\t${sha256(JSON.stringify(snapshot))}`,
      ...documents.map((doc) => `${doc.path}\t${doc.sha256}`)
    ].join("\n")
  );

  return {
    config,
    snapshot,
    plan: errors.length === 0 ? buildPlan(config, snapshot, prByNumber) : null,
    errors,
    warnings,
    documents,
    documentsByPath,
    memoryRecords,
    timeline,
    prRecords,
    prByNumber,
    unknownCitedPrs,
    requiredSources,
    fingerprint,
    refExists: (ref) => {
      const prMatch = ref.match(/^pr:#(\d+)$/);
      if (prMatch) return prByNumber.has(Number(prMatch[1]));
      return isSafeRelativePath(ref) && fileExists(root, ref);
    }
  };
}

function scheduleRoadmap(roadmap) {
  const steps = [...roadmap.steps].sort((a, b) => a.order - b.order);
  const byId = new Map(steps.map((step) => [step.id, step]));
  const schedule = new Map();
  const visiting = new Set();
  const visit = (id) => {
    if (schedule.has(id)) return schedule.get(id);
    if (visiting.has(id)) return null;
    visiting.add(id);
    const step = byId.get(id);
    let start = roadmap.startDate;
    for (const dep of step.dependsOn) {
      const depEntry = visit(dep);
      if (depEntry === null) return null;
      const next = depEntry.done ? roadmap.startDate : addDays(depEntry.eta, 1);
      if (next > start) start = next;
    }
    visiting.delete(id);
    const done = DONE_STATUSES.has(step.status);
    const entry = done ? { done, start: null, eta: null } : { done, start, eta: addDays(start, step.durationDays - 1) };
    schedule.set(id, entry);
    return entry;
  };
  for (const step of steps) {
    if (visit(step.id) === null) return null;
  }
  return schedule;
}

function buildPlan(config, snapshot, prByNumber) {
  const roadmap = config.roadmap;
  const schedule = scheduleRoadmap(roadmap);
  const asOf = snapshot.recordedAt;
  const steps = [...roadmap.steps].sort((a, b) => a.order - b.order).map((step) => {
    const entry = schedule.get(step.id);
    const prs = step.prRefs.map((number) => prByNumber.get(number));
    const findings = [];
    if (!entry.done && entry.eta < asOf) findings.push(`overdue by ${daysBetween(entry.eta, asOf)} day(s) as of ${asOf}`);
    if (!entry.done && prs.length > 0 && prs.every((pr) => pr.state !== "open")) {
      findings.push(`all referenced PRs are closed or merged (${prs.map((pr) => `#${pr.number} ${pr.state}`).join(", ")}); confirm the step and update its status`);
    }
    if (!entry.done && entry.start <= asOf && entry.eta >= asOf) findings.push(`in its ETA window as of ${asOf}`);
    return {
      ...step,
      ...entry,
      prs,
      findings,
      originId: originId("STEP", step.id, [step.title, step.acceptance])
    };
  });
  const stepsById = new Map(steps.map((step) => [step.id, step]));
  const directives = [...config.originalDirectives].sort((a, b) => a.order - b.order).map((directive) => {
    const linked = steps.filter((step) => step.directives.includes(directive.id));
    const open = linked.filter((step) => !step.done);
    const eta = open.length ? open.map((step) => step.eta).sort(compareStrings)[open.length - 1] : null;
    return {
      ...directive,
      steps: linked,
      eta,
      originId: originId("DIR", directive.id, [config.responsibleParties[0].name, directive.given, directive.wording])
    };
  });
  const inventoryIds = new Set(steps.flatMap((step) => step.inventoryRefs));
  const unscheduledInventory = config.inventory.filter((item) => !inventoryIds.has(item.id));
  const scheduledPrs = new Set(steps.flatMap((step) => step.prRefs));
  const unscheduledOpenPrs = snapshot.pullRequests
    .filter((pr) => pr.state === "open" && !scheduledPrs.has(pr.number))
    .sort((a, b) => a.number - b.number);
  const reviewQueue = steps
    .flatMap((step) => step.prs.filter((pr) => pr.state === "open").map((pr) => ({ pr, step })))
    .map(({ pr, step }) => ({ pr, step, daysOpen: daysBetween(pr.createdAt, asOf) }));
  const finalEta = steps.filter((step) => !step.done).map((step) => step.eta).sort(compareStrings).pop() || null;
  return { asOf, startDate: roadmap.startDate, etaRule: roadmap.etaRule, steps, stepsById, directives, unscheduledInventory, unscheduledOpenPrs, reviewQueue, finalEta };
}

function reconcilePr(record) {
  const presentCount = record.probes.filter((entry) => entry.result.ok).length;
  const total = record.probes.length;
  if (record.state === "closed-unmerged") {
    return { status: "historical", note: "Closed without merge; not adopted on the canonical branch." };
  }
  if (record.state === "merged") {
    if (total === 0) return { status: "historical", note: "Merged per snapshot; no evidence probe defined, so its claims are not verified here." };
    if (presentCount === total) return { status: "verified", note: `Merged per snapshot and all ${total} evidence probe(s) pass on this tree.` };
    return { status: "unfiled", note: `Merged per snapshot but ${total - presentCount} of ${total} evidence probe(s) fail on this tree.` };
  }
  if (total === 0) return { status: "proposed", note: "Open; its content is not on the canonical branch." };
  if (presentCount === 0) return { status: "proposed", note: `Open; none of its ${total} evidence artifact(s) exist on this tree, so its meaning is unfiled on the canonical branch.` };
  return { status: "proposed", note: `Open; ${presentCount} of ${total} evidence artifact(s) already exist on this tree (possibly via another change) and need founder review.` };
}

// ---------------------------------------------------------------- rendering helpers

function header(model, title, purpose) {
  const { config, snapshot } = model;
  return [
    `<!-- GENERATED FILE — do not edit by hand. Regenerate with \`${REGENERATE_COMMAND}\`. -->`,
    "",
    `# ${title}`,
    "",
    `> ${purpose}`,
    ">",
    `> Generated from repository records only. Curated inputs recorded ${config.recordedAt}; pull-request snapshot recorded ${snapshot.recordedAt}. Source fingerprint ${code(`sha256:${model.fingerprint.slice(0, 16)}`)}. Every status label below follows the definitions in [RECONCILIATION_INDEX.md](RECONCILIATION_INDEX.md#status-labels); symbolic or proposed material is never presented as verified, and nothing here is a legal, financial, or professional determination.`,
    ""
  ].join("\n");
}

function responsibleFraming(model) {
  const rows = model.config.responsibleParties.map((party) => [
    `**${md(party.role)}**`,
    md(party.name),
    md(party.authority),
    md(party.boundary)
  ]);
  return ["## Responsible parties", "", table(["Role", "Party", "Authority / responsibility", "Boundary"], rows), ""].join("\n");
}

function refList(model, refs) {
  return refs
    .map((ref) => {
      if (ref.startsWith("pr:")) return md(ref.slice(3)) + (model.refExists(ref) ? "" : " ⚠ missing");
      return linkFromReports(ref) + (model.refExists(ref) ? "" : " ⚠ missing");
    })
    .join("; ");
}

function countBy(items, keyFn) {
  const counts = new Map();
  for (const item of items) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function statusCounts(items) {
  const counts = countBy(items, (item) => item.status);
  return STATUS_LABELS.map((label) => `${label} ${counts.get(label) || 0}`).join(" · ");
}

function originOwnershipStats(model) {
  const prs = model.prRecords.filter((pr) => pr.themes.includes("origin") || pr.themes.includes("ownership"));
  const byState = countBy(prs, (pr) => pr.state);
  const memory = model.memoryRecords.filter((record) => record.originOwnership);
  const dates = [...prs.map((pr) => pr.createdAt), ...memory.map((record) => record.date)].sort(compareStrings);
  return {
    prs,
    merged: byState.get("merged") || 0,
    open: byState.get("open") || 0,
    closedUnmerged: byState.get("closed-unmerged") || 0,
    memory,
    first: dates[0] || "n/a",
    last: dates[dates.length - 1] || "n/a",
    corrections: model.prRecords.filter((pr) => pr.correction).length,
    captures: model.prRecords.filter((pr) => pr.capture).length
  };
}

function prioritizedInventory(model) {
  return [...model.config.inventory]
    .map((item) => ({ ...item, score: item.profit * item.urgency }))
    .sort((a, b) => b.score - a.score || b.urgency - a.urgency || compareStrings(a.id, b.id));
}

// ---------------------------------------------------------------- reports

function renderIndex(model) {
  const { config, snapshot } = model;
  const prStates = countBy(model.prRecords, (pr) => pr.state);
  const focus = model.prRecords.filter((pr) => pr.focus);
  const stats = originOwnershipStats(model);
  const missingRequired = model.requiredSources.filter((source) => !source.present);
  const openCheckpoints = model.timeline.checkpoints.filter((checkpoint) => !checkpoint.checked);
  const parts = [
    header(model, "Reconciliation index", "Entry point for the repository-backed reconciliation of origin, ownership, constitution and governance, timeline, pull-request history, and business-plan priorities."),
    responsibleFraming(model),
    "## Scope and boundaries",
    "",
    `- **Repository:** ${code(config.scope.repository)} (canonical branch ${code(config.scope.canonicalBranch)}).`,
    `- **Scope decision:** ${md(config.scope.decision)}`,
    `- **Boundary:** ${md(config.scope.boundary)}`,
    `- **PR snapshot boundary:** ${md(snapshot.boundary)}`,
    "",
    "## Status labels",
    "",
    table(["Label", "Meaning"], STATUS_LABELS.map((label) => [code(label), md(STATUS_DEFINITIONS[label])])),
    "",
    "## Executive summary",
    "",
    `- Reviewed **${model.documents.length}** repository text records (${model.memoryRecords.length} dated continuity memory records), **${model.timeline.rows.length}** timeline rows, and **${model.timeline.checkpoints.length}** timeline checkpoints (${openCheckpoints.length} still open).`,
    `- Required sources: **${model.requiredSources.length - missingRequired.length} of ${model.requiredSources.length}** present${missingRequired.length ? ` — missing: ${missingRequired.map((source) => code(source.path)).join(", ")}` : ""}.`,
    `- Pull requests in snapshot: **${model.prRecords.length}** (merged ${prStates.get("merged") || 0}, open ${prStates.get("open") || 0}, closed without merge ${prStates.get("closed-unmerged") || 0}).`,
    `- Focus pull requests reconciled: **${focus.length}** — ${statusCounts(focus.map((pr) => pr.reconciliation))}.`,
    `- Origin/ownership work in the PR history: **${stats.prs.length}** pull requests (${stats.merged} merged, ${stats.open} still open, ${stats.closedUnmerged} closed without merge) and **${stats.memory.length}** origin/ownership continuity records; dated origin/ownership activity spans ${stats.first} to ${stats.last}.`,
    `- After-the-fact capture: **${stats.captures}** PR titles record, preserve, document, or confirm earlier meaning; **${stats.corrections}** PR titles correct, clarify, restore, reconfirm, follow up, or reconcile earlier work.`,
    `- Founder directives: **${model.plan.directives.length}** in order; roadmap: **${model.plan.steps.length}** ordered steps from ${model.plan.startDate}, projected completion **${model.plan.finalEta || "n/a"}** (see [DIRECTIVES_ROADMAP_AND_ETA.md](DIRECTIVES_ROADMAP_AND_ETA.md)).`,
    `- Curated inventory: **${config.inventory.length}** items (${statusCounts(config.inventory)}); concepts: **${config.originGovernanceConcepts.length}** (${statusCounts(config.originGovernanceConcepts)}); known gaps: **${config.knownGaps.length}**.`,
    "",
    "## Reports",
    "",
    table(["Report", "Contents"], [
      ["[PR_RECONCILIATION.md](PR_RECONCILIATION.md)", "Focus PR chain with evidence probes, relevant PR ledger, after-the-fact capture counts, closed-unmerged PRs."],
      ["[ORIGIN_OWNERSHIP_GOVERNANCE_MATRIX.md](ORIGIN_OWNERSHIP_GOVERNANCE_MATRIX.md)", "Authority separation, origin science / constitution / governance concepts, and every reviewed record classified by domain and status."],
      ["[TIMELINE_AND_BUSINESS_SYNTHESIS.md](TIMELINE_AND_BUSINESS_SYNTHESIS.md)", "Chronology, loss/gain graph, values → operational values, inventory prioritized by profit and urgency, mission narrative."],
      ["[MISSING_MEANING_AND_GAPS.md](MISSING_MEANING_AND_GAPS.md)", "Unfiled, missing, unverified, and blocked meaning, including open PRs whose content is not on the canonical branch."],
      ["[DIRECTIVES_ROADMAP_AND_ETA.md](DIRECTIVES_ROADMAP_AND_ETA.md)", "Founder directives in order, story synopsis, ordered roadmap with ETAs, origin IDs and the origin-ID ETA, report and business plan on one timeline, review queue and automated review findings."]
    ]),
    "",
    "## Required source inventory",
    "",
    table(
      ["Source", "Domain", "Curated status", "Auto status", "Authority", "Lines", "SHA-256"],
      model.requiredSources.map((source) => [
        source.present ? linkFromReports(source.path) : `${md(source.path)} ⚠ missing`,
        md(source.domain),
        code(source.status),
        source.doc ? code(source.doc.status) : code("unfiled"),
        md(source.authority),
        source.doc ? String(source.doc.lines) : "—",
        source.doc ? code(source.doc.sha256.slice(0, 12)) : "—"
      ])
    ),
    "",
    "## Regenerate and validate",
    "",
    "```bash",
    REGENERATE_COMMAND,
    `${REGENERATE_COMMAND} --check            # validate inputs; warn if reports are stale`,
    `${REGENERATE_COMMAND} --check --strict   # fail if reports are stale`,
    "node --test scripts/reconciliation/test/generate-reconciliation-report.test.js",
    "```",
    "",
    "Curated inputs live in [sources/reconciliation-config.v1.json](sources/reconciliation-config.v1.json) and [sources/pr-snapshot.v1.json](sources/pr-snapshot.v1.json). See [README.md](README.md) for how to update them.",
    ""
  ];
  return parts.join("\n");
}

function renderPrReconciliation(model) {
  const stats = originOwnershipStats(model);
  const focus = model.prRecords.filter((pr) => pr.focus).sort((a, b) => a.number - b.number);
  const relevant = model.prRecords.filter((pr) => pr.relevant);
  const closedUnmerged = model.prRecords.filter((pr) => pr.state === "closed-unmerged");
  const themeCounts = new Map();
  for (const pr of model.prRecords) for (const theme of pr.themes) themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);

  const parts = [
    header(model, "Pull-request reconciliation", "PR-by-PR reconciliation of origin, ownership, governance, accountability, review-process, and business-plan work against what actually exists on this tree."),
    responsibleFraming(model),
    "## How often meaning had to be re-established",
    "",
    "Counts come from pull-request titles in the committed snapshot and dated memory filenames. They measure repository records only; conversations that were never committed are not counted (see [MISSING_MEANING_AND_GAPS.md](MISSING_MEANING_AND_GAPS.md)).",
    "",
    table(["Measure", "Count"], [
      ["Pull requests touching origin or ownership", String(stats.prs.length)],
      ["— merged", String(stats.merged)],
      ["— still open (meaning not on the canonical branch)", String(stats.open)],
      ["— closed without merge", String(stats.closedUnmerged)],
      ["Origin/ownership continuity memory records", String(stats.memory.length)],
      ["PR titles capturing earlier meaning after the fact (record / preserve / document / confirm)", String(stats.captures)],
      ["PR titles correcting earlier work (correct / clarify / restore / reconfirm / follow-up / reconcile / escalate)", String(stats.corrections)]
    ]),
    "",
    "Theme counts across all snapshot PRs: " + [...themeCounts.entries()].sort((a, b) => compareStrings(a[0], b[0])).map(([theme, count]) => `${theme} ${count}`).join(" · ") + ".",
    "",
    "## Focus pull-request chain",
    ""
  ];
  for (const pr of focus) {
    parts.push(`### #${pr.number} — ${md(pr.title)}`);
    parts.push("");
    parts.push(`- **Snapshot state:** ${code(pr.state)} · created ${pr.createdAt}${pr.closedAt ? ` · ${pr.state === "merged" ? "merged" : "closed"} ${pr.closedAt}` : ""} · branch ${code(pr.headRef)}`);
    parts.push(`- **Themes:** ${pr.themes.map(code).join(", ") || "—"}`);
    parts.push(`- **Summary:** ${md(pr.focus.summary)}`);
    parts.push(`- **Reconciliation:** ${code(pr.reconciliation.status)} — ${md(pr.reconciliation.note)}`);
    parts.push(`- **Cited by repository records:** ${pr.citedBy.length}${pr.citedBy.length ? ` (${pr.citedBy.slice(0, 8).map(linkFromReports).join(", ")}${pr.citedBy.length > 8 ? `, +${pr.citedBy.length - 8} more` : ""})` : ""}`);
    parts.push("");
    parts.push(table(["Evidence probe", "Result"], pr.probes.map(({ probe, result }) => [
      probe.type === "contains" ? `${code(probe.path)} contains ${code(probe.text)}` : `${code(probe.path)} exists`,
      `${result.ok ? "✅" : "❌"} ${md(result.detail)}`
    ])));
    parts.push("");
  }
  parts.push("## Relevant pull-request ledger");
  parts.push("");
  parts.push(`All ${relevant.length} snapshot PRs whose title or curated themes touch origin, ownership, governance, accountability, review process, or business planning. Merged PRs are labeled ${code("historical")} unless a focus evidence probe verifies them; open PRs are ${code("proposed")} and their content is unfiled on the canonical branch.`);
  parts.push("");
  parts.push(table(["#", "Created", "Closed/merged", "State", "Label", "Themes", "Cited by", "Title"], relevant.map((pr) => [
    String(pr.number),
    pr.createdAt,
    pr.closedAt || "—",
    code(pr.state),
    code(pr.reconciliation.status),
    md(pr.themes.join(", ")),
    String(pr.citedBy.length),
    md(truncate(pr.title, 110))
  ])));
  parts.push("");
  parts.push("## Closed without merge (not adopted)");
  parts.push("");
  parts.push(closedUnmerged.length ? table(["#", "Created", "Closed", "Title"], closedUnmerged.map((pr) => [String(pr.number), pr.createdAt, pr.closedAt, md(pr.title)])) : "None in snapshot.");
  parts.push("");
  parts.push("## PR numbers cited in repository records but absent from the snapshot");
  parts.push("");
  parts.push(model.unknownCitedPrs.length
    ? `${model.unknownCitedPrs.map((number) => `#${number}`).join(", ")} — likely references to other repositories or numbers outside the snapshot; review before treating them as this repository's PRs.`
    : "None.");
  parts.push("");
  return parts.join("\n");
}

function renderMatrix(model) {
  const { config } = model;
  const byDomain = new Map(DOMAIN_ORDER.map((domain) => [domain, []]));
  for (const doc of model.documents) {
    if (doc.path.startsWith("docs/memory/")) continue;
    byDomain.get(doc.domain).push(doc);
  }
  const parts = [
    header(model, "Origin, ownership, and governance matrix", "Separates founder authority, repository context, and assistant responsibility, and classifies origin science, constitution, governance, ownership, and invention material by status."),
    responsibleFraming(model),
    "## Authority separation",
    "",
    table(["Claim class", "Who holds it", "What the repository can show", "What it cannot show"], [
      ["Founder / owner authority (internal governance)", md(config.responsibleParties[0].name), "Recorded founder claim, Genesis checkpoint fields enforced on agent records, dated approvals and corrections.", "External legal title, patent, trademark, copyright, contract, or third-party rights."],
      ["Repository / account context", md(config.responsibleParties[1].name), "Commits, pull requests, CI results, and the snapshot of PR metadata.", "Who controls the GitHub, Railway, registrar, or API billing accounts (founder-only audit)."],
      ["Automation / agent role", md(config.responsibleParties[2].name), "Allowlisted actions, accountability ledger entries, PR template fields, this generator's deterministic output.", "Any origin, ownership, authorship, or decision authority; external actions; professional determinations."],
      ["Legal / operational claims", "Qualified professionals and authorized humans", "Readiness gates and blockers recorded in the repository.", "A legal conclusion; repository records preserve evidence only."],
      ["Symbolic / conceptual material", "Founder (attributed statements)", "Verbatim preservation with attribution and date.", "Scientific, mathematical, financial, or legal validity."]
    ]),
    "",
    "## Origin science, constitution, governance, and invention concepts",
    "",
    table(["Term", "Kind", "Status", "Meaning", "Operational use", "Sources"], config.originGovernanceConcepts.map((concept) => [
      `**${md(concept.term)}**`,
      code(concept.kind),
      code(concept.status),
      md(concept.meaning),
      md(concept.operationalUse),
      refList(model, concept.sourceRefs)
    ])),
    "",
    `Concept status totals: ${statusCounts(config.originGovernanceConcepts)}.`,
    "",
    "## Every reviewed record by domain",
    "",
    "Auto status is assigned by ordered, auditable rules (status line, then filename, then a conservative default of `proposed`). Automatic rules never assign `verified`. Dated memory records are listed in [TIMELINE_AND_BUSINESS_SYNTHESIS.md](TIMELINE_AND_BUSINESS_SYNTHESIS.md).",
    ""
  ];
  for (const domain of DOMAIN_ORDER) {
    const docs = byDomain.get(domain);
    if (!docs.length) continue;
    parts.push(`### ${domain} (${docs.length})`);
    parts.push("");
    parts.push(`Status totals: ${statusCounts(docs)}.`);
    parts.push("");
    parts.push(table(["Record", "Status", "Rule", "Status line", "PR refs", "Gap phrases"], docs.map((doc) => [
      linkFromReports(doc.path),
      code(doc.status),
      md(truncate(doc.rule, 70)),
      md(truncate(doc.statusText || "—", 110)),
      String(doc.prRefs.length),
      String(doc.gapLines.length)
    ])));
    parts.push("");
  }
  return parts.join("\n");
}

function dailyActivity(model) {
  const days = new Map();
  const day = (date) => {
    if (!days.has(date)) days.set(date, { timelineComplete: 0, timelineAttention: 0, timelineOther: 0, memory: 0, memorySetback: 0, prOpened: 0, prMerged: 0, prClosedUnmerged: 0 });
    return days.get(date);
  };
  for (const row of model.timeline.rows) {
    const entry = day(row.date);
    if (/^complete/i.test(row.status)) entry.timelineComplete += 1;
    else if (/attention/i.test(row.status)) entry.timelineAttention += 1;
    else entry.timelineOther += 1;
  }
  for (const record of model.memoryRecords) {
    const entry = day(record.date);
    entry.memory += 1;
    if (record.setback) entry.memorySetback += 1;
  }
  for (const pr of model.prRecords) {
    day(pr.createdAt).prOpened += 1;
    if (pr.state === "merged") day(pr.closedAt).prMerged += 1;
    if (pr.state === "closed-unmerged") day(pr.closedAt).prClosedUnmerged += 1;
  }
  return [...days.entries()].sort((a, b) => compareStrings(a[0], b[0]));
}

function renderTimeline(model) {
  const { config } = model;
  const activity = dailyActivity(model);
  const stats = originOwnershipStats(model);
  const inventory = prioritizedInventory(model);
  const maxValue = Math.max(1, ...activity.map(([, entry]) => Math.max(entry.timelineComplete + entry.prMerged, entry.timelineAttention + entry.memorySetback + entry.prClosedUnmerged)));
  const scale = (value) => Math.round((value / maxValue) * 30);
  const totals = activity.reduce((sum, [, entry]) => {
    sum.gains += entry.timelineComplete + entry.prMerged;
    sum.setbacks += entry.timelineAttention + entry.memorySetback + entry.prClosedUnmerged;
    return sum;
  }, { gains: 0, setbacks: 0 });
  const openPrs = model.prRecords.filter((pr) => pr.state === "open");
  const gains = config.inventory.filter((item) => item.status === "verified" || item.status === "operational");
  const losses = config.inventory.filter((item) => item.status === "unfiled" || item.status === "blocked");
  const opportunities = inventory.filter((item) => item.status === "proposed" || item.status === "blocked").slice(0, 8);
  const mission = config.missionNarrative;

  const parts = [
    header(model, "Timeline and business synthesis", "Chronology first, then inventory, values mapped to operational values, inventory prioritized by profit and urgency, the loss/gain picture, future opportunities, and a business-plan-ready mission narrative."),
    responsibleFraming(model),
    "## 1. Chronology by phase",
    "",
    table(["Phase", "Dates", "What happened", "Timeline rows", "Memory records", "PRs merged", "Origin/ownership PRs opened", "Sources"], config.chronologyPhases.map((phase) => {
      const inPhase = (date) => date >= phase.start && date <= phase.end;
      return [
        `**${md(phase.id)} ${md(phase.name)}**`,
        `${phase.start} → ${phase.end}`,
        md(phase.description),
        String(model.timeline.rows.filter((row) => inPhase(row.date)).length),
        String(model.memoryRecords.filter((record) => inPhase(record.date)).length),
        String(model.prRecords.filter((pr) => pr.state === "merged" && inPhase(pr.closedAt)).length),
        String(stats.prs.filter((pr) => inPhase(pr.createdAt)).length),
        refList(model, phase.sourceRefs)
      ];
    })),
    "",
    "## 2. Loss / gain graph",
    "",
    "Gains (`+`) = completed timeline milestones + merged PRs. Setbacks (`-`) = timeline rows needing attention + continuity records naming a loss, outage, miss, gap, or failure + PRs closed without merge. Bars are scaled to the busiest day; counts are exact.",
    "",
    "```text",
    ...activity.map(([date, entry]) => {
      const gain = entry.timelineComplete + entry.prMerged;
      const setback = entry.timelineAttention + entry.memorySetback + entry.prClosedUnmerged;
      return `${date}  +${String(gain).padStart(3)} ${"+".repeat(scale(gain)).padEnd(30)}  -${String(setback).padStart(3)} ${"-".repeat(scale(setback))}`;
    }),
    "```",
    "",
    `Totals: **${totals.gains}** gains, **${totals.setbacks}** setbacks, and **${openPrs.length}** pull requests still open (pending, not yet filed on the canonical branch).`,
    "",
    "### Daily activity detail",
    "",
    table(["Date", "Timeline complete", "Timeline attention/other", "Memory records", "Setback records", "PRs opened", "PRs merged", "PRs closed unmerged"], activity.map(([date, entry]) => [
      date,
      String(entry.timelineComplete),
      `${entry.timelineAttention}/${entry.timelineOther}`,
      String(entry.memory),
      String(entry.memorySetback),
      String(entry.prOpened),
      String(entry.prMerged),
      String(entry.prClosedUnmerged)
    ])),
    "",
    "## 3. How origin and ownership evolved",
    "",
    `${stats.prs.length} origin/ownership pull requests and ${stats.memory.length} origin/ownership continuity records, ${stats.first} → ${stats.last}.`,
    "",
    table(["Date", "Record", "Kind", "Status"], [
      ...stats.memory.map((record) => ({ date: record.date, label: linkFromReports(record.path) + ` — ${md(truncate(record.title, 90))}`, kind: "memory record", status: "historical" })),
      ...stats.prs.map((pr) => ({ date: pr.createdAt, label: `PR #${pr.number} — ${md(truncate(pr.title, 90))}`, kind: `PR (${pr.state})`, status: pr.reconciliation.status }))
    ].sort((a, b) => compareStrings(a.date, b.date) || compareStrings(a.label, b.label)).map((entry) => [entry.date, entry.label, md(entry.kind), code(entry.status)])),
    "",
    "## 4. Values → operational values",
    "",
    table(["Value", "Operational value", "Mechanism", "Status", "Sources"], config.valueMap.map((entry) => [
      `**${md(entry.value)}**`,
      md(entry.operationalValue),
      md(entry.mechanism),
      code(entry.status),
      refList(model, entry.sourceRefs)
    ])),
    "",
    "## 5. Inventory prioritized by profit and urgency",
    "",
    "Score = profit (1-5) × urgency (1-5). Scores are the assigned completion agent's proposed ranking from repository evidence; the founder confirms or changes them by editing the curated config.",
    "",
    table(["Rank", "ID", "Item", "Category", "Status", "Profit", "Urgency", "Score", "Authority required", "Next action", "Sources"], inventory.map((item, index) => [
      String(index + 1),
      code(item.id),
      md(item.item),
      code(item.category),
      code(item.status),
      String(item.profit),
      String(item.urgency),
      `**${item.score}**`,
      md(item.authority),
      md(item.nextAction),
      refList(model, item.sourceRefs)
    ])),
    "",
    "## 6. Losses, gains, and opportunities",
    "",
    `- **Gains on record (${gains.length}):** ${gains.map((item) => `${item.id} ${md(item.item)} (${item.status})`).join("; ") || "none"}.`,
    `- **Losses / exposures (${losses.length}):** ${losses.map((item) => `${item.id} ${md(item.item)} (${item.status})`).join("; ") || "none"}.`,
    `- **Open pull requests holding unfiled meaning (${openPrs.length}):** ${openPrs.map((pr) => `#${pr.number}`).join(", ") || "none"}.`,
    `- **Top opportunities:** ${opportunities.map((item) => `${item.id} ${md(item.item)} (score ${item.score})`).join("; ") || "none"}.`,
    "",
    "## 7. Business-plan-ready mission narrative",
    "",
    "_Draft for founder review, composed only from the cited repository records._",
    "",
    `**Mission.** ${md(mission.mission)}`,
    "",
    `**Problem we are solving for ourselves first.** ${md(mission.problem)}`,
    "",
    "**Assets on record.**",
    "",
    ...mission.assets.map((asset) => `- ${md(asset)}`),
    "",
    "**Differentiators.**",
    "",
    ...mission.differentiators.map((entry) => `- ${md(entry)}`),
    "",
    `**Near-term revenue path.** ${md(mission.nearTermRevenue)}`,
    "",
    `**Sources.** ${refList(model, mission.sourceRefs)}`,
    "",
    "## 8. Open timeline checkpoints",
    "",
    ...model.timeline.checkpoints.filter((checkpoint) => !checkpoint.checked).map((checkpoint) => `- [ ] ${md(truncate(checkpoint.text, 220))} (PROJECT_TIMELINE.md line ${checkpoint.line})`),
    ""
  ];
  return parts.join("\n");
}

function renderGaps(model) {
  const { config } = model;
  const openPrs = model.prRecords.filter((pr) => pr.state === "open");
  const unfiledConcepts = config.originGovernanceConcepts.filter((concept) => concept.status === "unfiled");
  const exposures = prioritizedInventory(model).filter((item) => item.status === "unfiled" || item.status === "blocked");
  const missingRequired = model.requiredSources.filter((source) => !source.present);
  const mergedProbeFailures = model.prRecords.filter((pr) => pr.state === "merged" && pr.reconciliation.status === "unfiled");
  const gapDense = model.documents
    .filter((doc) => doc.gapLines.length > 0 && !doc.path.startsWith("docs/memory/"))
    .sort((a, b) => b.gapLines.length - a.gapLines.length || compareStrings(a.path, b.path))
    .slice(0, 25);
  const allCurated = [...config.originGovernanceConcepts, ...config.valueMap, ...config.inventory, ...config.knownGaps];

  const parts = [
    header(model, "Missing meaning and gaps", "Everything the repository references but has not filed, verified, or completed — so it can be refiled, decided, or explicitly left open."),
    responsibleFraming(model),
    "## Proposed vs verified separation",
    "",
    `Across all curated concepts, values, inventory items, and gaps: ${statusCounts(allCurated)}. Only items carrying explicit verification evidence may be labeled ${code("verified")}; the generator rejects any other use.`,
    "",
    "## Known gaps",
    "",
    table(["ID", "Gap", "Status", "Detail", "Sources"], config.knownGaps.map((gap) => [code(gap.id), md(gap.gap), code(gap.status), md(gap.detail), refList(model, gap.sourceRefs)])),
    "",
    "## Meaning held only in open pull requests (unfiled on the canonical branch)",
    "",
    table(["#", "Created", "Themes", "Evidence on this tree", "Title"], openPrs.map((pr) => [
      String(pr.number),
      pr.createdAt,
      md(pr.themes.join(", ")),
      pr.probes.length ? `${pr.probes.filter((entry) => entry.result.ok).length}/${pr.probes.length} present` : "no probe",
      md(truncate(pr.title, 120))
    ])),
    "",
    "## Unfiled origin, ownership, and governance concepts",
    "",
    unfiledConcepts.length
      ? table(["Term", "Meaning", "Where it lives now"], unfiledConcepts.map((concept) => [`**${md(concept.term)}**`, md(concept.meaning), refList(model, concept.sourceRefs)]))
      : "None.",
    "",
    "## Unfiled or blocked inventory (highest priority first)",
    "",
    table(["ID", "Item", "Status", "Score", "Authority required", "Next action"], exposures.map((item) => [code(item.id), md(item.item), code(item.status), String(item.score), md(item.authority), md(item.nextAction)])),
    "",
    "## Automated integrity findings",
    "",
    `- Missing required sources: ${missingRequired.length ? missingRequired.map((source) => code(source.path)).join(", ") : "none"}.`,
    `- Merged focus PRs whose evidence is missing on this tree: ${mergedProbeFailures.length ? mergedProbeFailures.map((pr) => `#${pr.number}`).join(", ") : "none"}.`,
    `- PR numbers cited in records but absent from the snapshot: ${model.unknownCitedPrs.length ? model.unknownCitedPrs.map((number) => `#${number}`).join(", ") : "none"}.`,
    `- Unchecked timeline checkpoints: ${model.timeline.checkpoints.filter((checkpoint) => !checkpoint.checked).length} (listed in [TIMELINE_AND_BUSINESS_SYNTHESIS.md](TIMELINE_AND_BUSINESS_SYNTHESIS.md#8-open-timeline-checkpoints)).`,
    "",
    "## Records with the most unfiled / unverified / pending language",
    "",
    "Line numbers point to phrases such as \"not yet filed\", \"unverified\", \"pending founder\", \"not found\", or \"never existed\".",
    "",
    table(["Record", "Status", "Hits", "First lines"], gapDense.map((doc) => [linkFromReports(doc.path), code(doc.status), String(doc.gapLines.length), doc.gapLines.slice(0, 6).join(", ")])),
    "",
    "## Outside this automation's reach",
    "",
    "- Chats, uploads, images, and decisions that were never committed to this repository.",
    "- External account, registrar, hosting, filing, and legal status (only what the repository already records is shown).",
    "- Other repositories, per the founder's \"reconcile under 1\" scope decision.",
    "",
    "To close a gap: commit a public-safe record (or use the private archive workflow), update the curated config, and regenerate.",
    ""
  ];
  return parts.join("\n");
}

function weekGantt(plan) {
  const open = plan.steps.filter((step) => !step.done);
  if (open.length === 0) return "No open roadmap steps.";
  const weeks = Math.max(1, Math.floor(daysBetween(plan.startDate, plan.finalEta) / 7) + 1);
  const headerCells = Array.from({ length: weeks }, (_, index) => `W${String(index + 1).padStart(2, "0")}`);
  const lines = [`${"Step".padEnd(5)} ${headerCells.join(" ")}  ETA`];
  for (const step of open) {
    const first = Math.floor(daysBetween(plan.startDate, step.start) / 7);
    const last = Math.floor(daysBetween(plan.startDate, step.eta) / 7);
    const cells = headerCells.map((_, index) => (index >= first && index <= last ? "███" : " · "));
    lines.push(`${step.id.padEnd(5)} ${cells.join(" ")}  ${step.eta}`);
  }
  lines.push("");
  lines.push(headerCells.map((label, index) => `${label} starts ${addDays(plan.startDate, index * 7)}`).join(" · "));
  return ["```text", ...lines, "```"].join("\n");
}

function renderRoadmap(model) {
  const { config } = model;
  const plan = model.plan;
  const inventoryById = new Map(prioritizedInventory(model).map((item) => [item.id, item]));
  const phaseById = new Map(config.chronologyPhases.map((phase) => [phase.id, phase]));
  const openSteps = plan.steps.filter((step) => !step.done);
  const originStep = plan.steps.find((step) => /origin id/i.test(step.title));
  const findings = plan.steps.filter((step) => step.findings.length > 0);
  const stages = [...new Set(plan.steps.map((step) => step.stage))];
  const prLabel = (pr) => `#${pr.number} (${pr.state})`;
  const stepLink = (id) => `[${id}](#${id.toLowerCase()})`;
  const months = new Map();
  for (const step of openSteps) {
    const month = step.eta.slice(0, 7);
    if (!months.has(month)) months.set(month, []);
    months.get(month).push(step);
  }

  const parts = [
    header(model, "Directives, roadmap, and ETA", "The founder's directives in order, the story so far, the ordered execution roadmap with ETAs (including the origin-ID ETA), the report and business plan on one timeline, and the automated review that keeps it current."),
    responsibleFraming(model),
    "## At a glance",
    "",
    `- **Directives recorded:** ${plan.directives.length} (${statusCounts(plan.directives)}).`,
    `- **Roadmap:** ${plan.steps.length} ordered steps in ${stages.length} stages, starting ${plan.startDate}; ${openSteps.length} open. Projected completion of all open steps: **${plan.finalEta || "n/a"}**.`,
    originStep ? `- **Origin ID registration ETA:** **${originStep.done ? "done" : originStep.eta}** (${stepLink(originStep.id)}, after ${originStep.dependsOn.map(stepLink).join(", ")}).` : "- **Origin ID registration ETA:** no roadmap step names origin IDs.",
    `- **Review status as of ${plan.asOf}:** ${plan.reviewQueue.length} open PRs in the review queue, ${findings.length} steps with automated findings, ${plan.unscheduledOpenPrs.length} open PRs not on the roadmap.`,
    `- **ETA rule:** ${md(plan.etaRule)}`,
    "",
    "## 1. Story synopsis",
    "",
    "The story in chronological order, one chapter per phase. Counts are computed from repository records; chapter text is the agent's summary of the cited records for founder review.",
    ""
  ];
  for (const chapter of [...config.storySynopsis].sort((a, b) => a.chapter - b.chapter)) {
    const phase = phaseById.get(chapter.phase);
    const inPhase = (date) => date >= phase.start && date <= phase.end;
    const merged = model.prRecords.filter((pr) => pr.state === "merged" && inPhase(pr.closedAt)).length;
    const memory = model.memoryRecords.filter((record) => inPhase(record.date)).length;
    const setbacks = model.memoryRecords.filter((record) => record.setback && inPhase(record.date)).length;
    parts.push(`### Chapter ${chapter.chapter} — ${md(chapter.title)} (${phase.start} → ${phase.end})`);
    parts.push("");
    parts.push(md(chapter.text));
    parts.push("");
    parts.push(`_Record: ${merged} PRs merged · ${memory} continuity records · ${setbacks} recorded setbacks. Sources: ${refList(model, chapter.sourceRefs)}._`);
    parts.push("");
  }
  parts.push(`### Chapter ${config.storySynopsis.length + 1} — What happens next (${plan.startDate} → ${plan.finalEta || "n/a"})`);
  parts.push("");
  parts.push(`${openSteps.length} ordered steps turn the directives into filed, merged, and evidenced records: ${stages.map(md).join("; ")}. The first founder action is ${stepLink(plan.steps[0].id)} — ${md(plan.steps[0].title)}.`);
  parts.push("");

  parts.push("## 2. Founder directives in order");
  parts.push("");
  parts.push("Exact wording is preserved as given. Status describes delivery on the canonical branch, not whether the directive is valid. ETA is the latest ETA among the directive's open roadmap steps.");
  parts.push("");
  parts.push(table(["Order", "ID", "Given", "Directive (short)", "Status", "Steps", "ETA"], plan.directives.map((directive) => [
    String(directive.order),
    code(directive.id),
    directive.given,
    md(truncate(directive.wording, 80)),
    code(directive.status),
    directive.steps.map((step) => stepLink(step.id)).join(", "),
    directive.eta || "done"
  ])));
  parts.push("");
  for (const directive of plan.directives) {
    parts.push(`### ${directive.id} — directive ${directive.order}`);
    parts.push("");
    parts.push(`> ${md(directive.wording)}`);
    parts.push("");
    parts.push(`- **Given:** ${directive.given} · **Origin ID:** ${code(directive.originId)}`);
    parts.push(`- **Objective:** ${md(directive.objective)}`);
    parts.push(`- **Status:** ${code(directive.status)} — ${md(directive.statusNote)}`);
    parts.push(`- **Roadmap:** ${directive.steps.map((step) => `${stepLink(step.id)} ${step.done ? "done" : `ETA ${step.eta}`}`).join(" · ")}`);
    parts.push(`- **Directive ETA:** ${directive.eta || "done"}`);
    parts.push(`- **Sources:** ${refList(model, directive.sourceRefs)}`);
    parts.push("");
  }

  parts.push("## 3. Execution order and ETA");
  parts.push("");
  parts.push(table(["Order", "Step", "Stage", "Owner", "Depends on", "Directives", "Start", "ETA", "Status", "PRs", "Inventory"], plan.steps.map((step) => [
    String(step.order),
    `**${code(step.id)}** ${md(step.title)}`,
    md(step.stage),
    md(step.owner),
    step.dependsOn.length ? step.dependsOn.map(stepLink).join(", ") : "—",
    step.directives.map(code).join(", "),
    step.done ? "—" : step.start,
    step.done ? "done" : `**${step.eta}**`,
    code(step.status),
    step.prs.length ? step.prs.map(prLabel).join(", ") : "—",
    step.inventoryRefs.length ? step.inventoryRefs.map(code).join(", ") : "—"
  ])));
  parts.push("");
  for (const step of plan.steps) {
    parts.push(`### ${step.id}`);
    parts.push("");
    parts.push(`**${md(step.title)}** — ${md(step.stage)} · owner ${md(step.owner)} · ${step.durationDays} day(s) · ${step.done ? "done" : `${step.start} → ETA ${step.eta}`} · ${code(step.status)}`);
    parts.push("");
    parts.push(`- **Acceptance:** ${md(step.acceptance)}`);
    parts.push(`- **Origin ID:** ${code(step.originId)}`);
    if (step.inventoryRefs.length) {
      parts.push(`- **Business value:** ${step.inventoryRefs.map((id) => { const item = inventoryById.get(id); return `${code(id)} ${md(item.item)} (profit ${item.profit} × urgency ${item.urgency} = ${item.score})`; }).join("; ")}`);
    }
    parts.push(`- **Review findings:** ${step.findings.length ? step.findings.map(md).join("; ") : "none"}`);
    parts.push(`- **Sources:** ${refList(model, step.sourceRefs)}`);
    parts.push("");
  }

  parts.push("## 4. Origin IDs");
  parts.push("");
  parts.push(`Origin IDs are internal, content-addressed record identifiers: ${code("AXES-OID-<kind>-<id>-<first 12 hex of SHA-256 over the identifying content>")}. The same content always yields the same ID, and a change in wording yields a new ID, so a silent edit is detectable. They are not a legal, patent, trademark, or external registry filing. Formal registration in the OORR-P registry is ${originStep ? `${stepLink(originStep.id)} with ETA **${originStep.done ? "done" : originStep.eta}**` : "not yet scheduled"}.`);
  parts.push("");
  parts.push(table(["Kind", "Record", "Origin ID"], [
    ...plan.directives.map((directive) => ["Directive", `${code(directive.id)} ${md(truncate(directive.wording, 70))}`, code(directive.originId)]),
    ...prioritizedInventory(model).map((item) => ["Inventory", `${code(item.id)} ${md(item.item)}`, code(originId("INV", item.id, [item.item]))])
  ]));
  parts.push("");

  parts.push("## 5. Report and business plan on one timeline");
  parts.push("");
  parts.push("### Looking back: how we got here");
  parts.push("");
  parts.push(table(["Phase", "Dates", "Chapter"], config.chronologyPhases.map((phase) => {
    const chapter = config.storySynopsis.find((entry) => entry.phase === phase.id);
    return [`${md(phase.id)} ${md(phase.name)}`, `${phase.start} → ${phase.end}`, chapter ? `Chapter ${chapter.chapter}: ${md(chapter.title)}` : "—"];
  })));
  parts.push("");
  parts.push("### Looking forward: week-by-week roadmap");
  parts.push("");
  parts.push(weekGantt(plan));
  parts.push("");
  parts.push("### Business-plan milestones by month of ETA");
  parts.push("");
  for (const [month, unsortedSteps] of [...months.entries()].sort((a, b) => compareStrings(a[0], b[0]))) {
    const monthSteps = [...unsortedSteps].sort((a, b) => compareStrings(a.eta, b.eta) || a.order - b.order);
    parts.push(`**${month}**`);
    parts.push("");
    for (const step of monthSteps) {
      const value = step.inventoryRefs.map((id) => inventoryById.get(id)).filter(Boolean);
      const score = value.length ? ` — business score ${Math.max(...value.map((item) => item.score))}` : "";
      parts.push(`- ${step.eta} · ${stepLink(step.id)} ${md(step.title)} (${md(step.owner)})${score}`);
    }
    parts.push("");
  }

  parts.push("## 6. Review automation");
  parts.push("");
  parts.push("### Review queue (open PRs in roadmap order)");
  parts.push("");
  parts.push(plan.reviewQueue.length
    ? table(["Position", "PR", "Title", "Roadmap step", "Step ETA", `Days open as of ${plan.asOf}`, "Next action"], plan.reviewQueue.map((entry, index) => [
      String(index + 1),
      `#${entry.pr.number}`,
      md(truncate(entry.pr.title, 90)),
      stepLink(entry.step.id),
      entry.step.eta || "done",
      String(entry.daysOpen),
      index === 0 ? "Founder review now; agent regenerates reports after merge" : `Founder review by ${entry.step.eta || "next refresh"}; agent rebases on the latest base first`
    ]))
    : "No open PRs are scheduled.");
  parts.push("");
  parts.push("### Automated findings");
  parts.push("");
  parts.push(`- Steps with findings as of ${plan.asOf}: ${findings.length ? "" : "none."}`);
  for (const step of findings) parts.push(`  - ${stepLink(step.id)}: ${step.findings.map(md).join("; ")}`);
  parts.push(`- Open PRs not on the roadmap: ${plan.unscheduledOpenPrs.length ? plan.unscheduledOpenPrs.map((pr) => `#${pr.number} ${md(truncate(pr.title, 60))}`).join("; ") : "none"}.`);
  parts.push(`- Inventory items not scheduled (deferred or already done): ${plan.unscheduledInventory.length ? plan.unscheduledInventory.map((item) => `${code(item.id)} (${item.status})`).join(", ") : "none"}.`);
  parts.push("- Every directive has at least one roadmap step; the generator fails if a directive is left unscheduled, a dependency is missing, or the order contains a cycle.");
  parts.push("");
  parts.push("### What runs automatically");
  parts.push("");
  parts.push(table(["Automation", "When", "What it does", "Founder action"], [
    ["`Reconciliation report validation` CI job", "Every push and pull request", "Runs the generator tests and `--check`: fails on invalid inputs, unscheduled directives, dependency cycles, or missing reports; warns when reports are stale.", "Approve held CI runs."],
    ["`Reconciliation refresh` workflow", "Weekly (Monday) and on demand", "Refreshes the PR snapshot read-only from the GitHub API, regenerates every report (including overdue and review findings), runs the tests, and opens a review PR. It never merges, deploys, or edits other files.", "Review and merge the refresh PR."],
    ["Generator review findings", "Every regeneration", "Flags overdue steps, steps whose PRs are all merged, open PRs missing from the roadmap, and unscheduled inventory.", "Confirm or reorder steps in the curated config."]
  ]));
  parts.push("");
  parts.push("To change the order, ETAs, or owners, edit `roadmap` in [sources/reconciliation-config.v1.json](sources/reconciliation-config.v1.json) and regenerate.");
  parts.push("");
  return parts.join("\n");
}

// ---------------------------------------------------------------- orchestration

function buildReports(root) {
  const model = collect(root);
  if (model.errors.length > 0) return { model, outputs: null, errors: model.errors, warnings: model.warnings };
  const outputs = new Map([
    ["RECONCILIATION_INDEX.md", renderIndex(model)],
    ["PR_RECONCILIATION.md", renderPrReconciliation(model)],
    ["ORIGIN_OWNERSHIP_GOVERNANCE_MATRIX.md", renderMatrix(model)],
    ["TIMELINE_AND_BUSINESS_SYNTHESIS.md", renderTimeline(model)],
    ["MISSING_MEANING_AND_GAPS.md", renderGaps(model)],
    ["DIRECTIVES_ROADMAP_AND_ETA.md", renderRoadmap(model)]
  ]);
  return { model, outputs, errors: [], warnings: model.warnings };
}

function parseArgs(argv) {
  const options = { check: false, strict: false, root: process.cwd() };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--check") options.check = true;
    else if (arg === "--strict") options.strict = true;
    else if (arg === "--root") {
      const value = argv[index + 1];
      if (!value) throw new Error("--root requires a directory");
      options.root = path.resolve(value);
      index += 1;
    } else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (options.strict && !options.check) throw new Error("--strict is only valid with --check");
  return options;
}

function main(argv, io = { stdout: process.stdout, stderr: process.stderr, env: process.env }) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    io.stderr.write(`${error.message}\n`);
    return 2;
  }
  if (options.help) {
    io.stdout.write(`Usage: ${REGENERATE_COMMAND} [--check [--strict]] [--root <dir>]\n`);
    return 0;
  }
  let result;
  try {
    result = buildReports(options.root);
  } catch (error) {
    io.stderr.write(`Reconciliation failed: ${error.message}\n`);
    return 1;
  }
  for (const warning of result.warnings) io.stderr.write(`warning: ${warning}\n`);
  if (result.errors.length > 0) {
    io.stderr.write(`Reconciliation inputs are invalid (${result.errors.length}):\n`);
    for (const error of result.errors) io.stderr.write(`  - ${error}\n`);
    return 1;
  }
  const outDir = resolveInside(options.root, OUTPUT_DIR);
  if (!options.check) {
    fs.mkdirSync(outDir, { recursive: true });
    for (const [name, content] of result.outputs) {
      fs.writeFileSync(path.join(outDir, name), content, "utf8");
      io.stdout.write(`wrote ${OUTPUT_DIR}/${name}\n`);
    }
    return 0;
  }
  const missing = [];
  const stale = [];
  for (const [name, content] of result.outputs) {
    const rel = `${OUTPUT_DIR}/${name}`;
    const existing = readText(options.root, rel);
    if (existing === null) missing.push(rel);
    else if (existing !== content) stale.push(rel);
  }
  if (missing.length > 0) {
    io.stderr.write(`Missing generated reports: ${missing.join(", ")}. Run \`${REGENERATE_COMMAND}\`.\n`);
    return 1;
  }
  if (stale.length > 0) {
    const message = `Reconciliation reports are stale (${stale.join(", ")}). Run \`${REGENERATE_COMMAND}\` and commit the result.`;
    if (options.strict) {
      io.stderr.write(`${message}\n`);
      return 1;
    }
    io.stdout.write(io.env && io.env.GITHUB_ACTIONS === "true" ? `::warning::${message}\n` : `warning: ${message}\n`);
    return 0;
  }
  io.stdout.write(`Reconciliation inputs valid; ${result.outputs.size} reports up to date (fingerprint sha256:${result.model.fingerprint.slice(0, 16)}).\n`);
  return 0;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = {
  CONFIG_PATH,
  SNAPSHOT_PATH,
  OUTPUT_DIR,
  OUTPUT_FILES,
  STATUS_LABELS,
  REQUIRED_FOCUS_PRS,
  isSafeRelativePath,
  extractField,
  extractPrRefs,
  classifyDocument,
  classifyDomain,
  prThemes,
  parseTimeline,
  evaluateProbe,
  reconcilePr,
  scheduleRoadmap,
  buildPlan,
  originId,
  addDays,
  validateInputs,
  collect,
  buildReports,
  main
};
