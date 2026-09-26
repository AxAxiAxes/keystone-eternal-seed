const fs = require("node:fs");

const TASK_ID_PATTERN = /^TASK-\d{8}-\d{4}$/;
const REQUIRED_HEADINGS = [
  "## Task accountability",
  "## What founder instruction does this PR deliver?",
  "## Scope-match check (protocol step 5a)",
  "## Cost / time estimate vs. actual (protocol steps 5, 5b)",
  "## At least one suggested improvement beyond the literal ask (protocol step 4)",
  "## Self-rating (protocol step 7)",
  "## Verification performed"
];
const REQUIRED_ACCOUNTABILITY_FIELDS = [
  "Task-ID",
  "Exception path",
  "Exception reason",
  "Directive author",
  "Task owner",
  "Implementer(s)",
  "Reviewer",
  "Merger / acceptor",
  "AI / tool attribution",
  "Continuity / memory record",
  "Next review date",
  "Repository artifact status",
  "Real-world / production outcome status",
  "Founder confirmation state"
];

function stripComments(value) {
  const input = String(value || "");
  let output = "";
  let cursor = 0;
  while (cursor < input.length) {
    const commentStart = input.indexOf("<!--", cursor);
    if (commentStart === -1) {
      output += input.slice(cursor);
      break;
    }
    output += input.slice(cursor, commentStart);
    const commentEnd = input.indexOf("-->", commentStart + 4);
    if (commentEnd === -1) break;
    cursor = commentEnd + 3;
  }
  return output.trim();
}

function isPlaceholder(value) {
  const normalized = stripComments(value).trim();
  return !normalized ||
    /^(tbd|todo|placeholder|fill me|replace me|same as template)$/i.test(normalized) ||
    /^<.*>$/.test(normalized);
}

function getSection(body, heading) {
  const start = body.indexOf(heading);
  if (start === -1) return null;
  const afterHeading = body.slice(start + heading.length);
  const nextHeading = afterHeading.search(/\n##\s/);
  return (nextHeading === -1 ? afterHeading : afterHeading.slice(0, nextHeading)).trim();
}

function parseBullets(section) {
  const values = new Map();
  for (const line of stripComments(section).split(/\r?\n/)) {
    const match = /^\s*-\s*([^:]+):\s*(.*?)\s*$/.exec(line);
    if (match) values.set(match[1].trim(), match[2].trim());
  }
  return values;
}

function validatePullRequestBody(body) {
  const failures = [];
  const normalizedBody = String(body || "");
  for (const heading of REQUIRED_HEADINGS) {
    const section = getSection(normalizedBody, heading);
    if (section === null) {
      failures.push(`Missing required section: ${heading}`);
      continue;
    }
    if (isPlaceholder(section)) {
      failures.push(`Required section is empty or placeholder-only: ${heading}`);
    }
  }

  const accountabilitySection = getSection(normalizedBody, "## Task accountability");
  if (accountabilitySection !== null) {
    const bullets = parseBullets(accountabilitySection);
    const exceptionPath = (bullets.get("Exception path") || "").toLowerCase();
    const taskId = bullets.get("Task-ID") || "";
    const exceptionReason = bullets.get("Exception reason") || "";

    for (const field of REQUIRED_ACCOUNTABILITY_FIELDS) {
      if (field === "Task-ID" && exceptionPath !== "none") continue;
      if (!bullets.has(field)) {
        failures.push(`Missing required accountability field: ${field}`);
      }
    }

    if (!["none", "historical", "administrative"].includes(exceptionPath)) {
      failures.push("Exception path must be one of: none, historical, administrative");
    }
    if (exceptionPath === "none") {
      if (!TASK_ID_PATTERN.test(taskId)) {
        failures.push("Task-ID is required and must match TASK-YYYYMMDD-0001 when no exception path is used");
      }
      if (stripComments(exceptionReason).toLowerCase() !== "none") {
        failures.push('Exception reason must be "none" when no exception path is used');
      }
    } else if (exceptionPath === "historical" || exceptionPath === "administrative") {
      if (isPlaceholder(exceptionReason) || stripComments(exceptionReason).toLowerCase() === "none") {
        failures.push("Historical/administrative PRs require a specific exception reason");
      }
    }

    for (const field of REQUIRED_ACCOUNTABILITY_FIELDS) {
      const value = bullets.get(field);
      if (value === undefined) continue;
      if (field === "Task-ID" && exceptionPath !== "none") continue;
      if (isPlaceholder(value)) {
        failures.push(`Accountability field cannot be left blank or placeholder-only: ${field}`);
      }
    }
  }

  return failures;
}

function validateEventFile(eventPath) {
  const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
  const body = event.pull_request?.body || "";
  return validatePullRequestBody(body);
}

if (require.main === module) {
  const eventPath = process.argv[2] || process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error("Usage: node .github/scripts/validate-pr-body.js <github-event-json>");
    process.exit(2);
  }
  const failures = validateEventFile(eventPath);
  if (failures.length) {
    console.error("PR body validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log("PR body validation passed.");
}

module.exports = {
  TASK_ID_PATTERN,
  validateEventFile,
  validatePullRequestBody
};
