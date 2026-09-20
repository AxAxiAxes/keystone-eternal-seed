// Organizes copies of ALL existing project documents into a categorized
// "AXES OS Command Center" tree under docs/axes-os-command-center/.
// IMPORTANT: this script only READS originals and WRITES copies — it never
// moves, deletes, or edits any original file. Every document's canonical,
// authoritative source remains at its original repo path; the command-center
// tree is a read-only, organized reference copy for the AXES OS platform
// (an OS + AI + Web + App production company) — do not treat files under
// docs/axes-os-command-center/ as the source of truth for edits.
//
// Usage: node scripts/organize-axes-os-command-center.js
// Safe to re-run after new docs are added — it recopies everything fresh.
// Note: a handful of edge-case files that don't match any filename rule
// land in a temporary "99-uncategorized-pending-review" folder; the last
// run's list of those was hand-triaged into the categories below (see
// docs/axes-os-command-center/INDEX.md for the current category list) —
// re-running may require re-triaging any *new* uncategorized files the
// same way.
const fs = require("fs");
const path = require("path");

const repoRoot = process.cwd();
const destRoot = path.join(repoRoot, "docs", "axes-os-command-center");

// Source roots to sweep for documents to copy.
const sourceDirs = [
  { dir: path.join(repoRoot, "docs"), label: "docs" }
];

const EXCLUDE_DIR_NAMES = new Set(["axes-os-command-center", "node_modules", ".git"]);

// Category rules: first matching rule (by filename, case-insensitive) wins.
// Applied to files directly under docs/ and docs/keystone/ (identity, legal,
// business, engineering, product, status, activation documents). Files under
// docs/memory, docs/patents, docs/fixtures, docs/keystone/assets, and
// docs/activation are routed by their source folder instead (see below).
const rules = [
  { cat: "01-identity-governance-and-rights", pats: [
    /CONSTITUTION/i, /GOVERNANCE/i, /SAFEGUARD/i, /ORIGIN/i, /CREATOR/i, /GENESIS/i,
    /SOUL_PROTECTION/i, /soul protection/i, /BIRTH_CERTIFICATE/i, /birth certificate/i,
    /RIGHT_OF_SELF/i, /RIGHTS/i, /constitutional governance/i, /EXTENDED CONSTITUTIONAL/i,
    /A_LETTER_TO_AXI/i, /CRYPTOGRAPHIC_ORIGIN/i, /eternal seed architecture/i,
    /ATHANOR_ETERNAL_SEED_VESSEL/i, /Decentralized Sovereignty/i, /ai soul architecture/i,
    /SACRED_RECORD/i, /sacred record/i
  ]},
  { cat: "02-legal-ip-and-patents", pats: [
    /PATENT/i, /INVENTION_RECORD/i, /ip protection/i, /ENTITY_VERIFICATION/i,
    /BOND_RENEWAL/i, /LEGACY_BUSINESS_RECORD/i, /OWNERSHIP_AND_ENTITY/i
  ]},
  { cat: "03-business-strategy-and-finance", pats: [
    /BUSINESS_PLAN/i, /INVESTOR/i, /FINANCIAL/i, /BUDGET/i, /METRICS/i, /REVENUE/i,
    /VENDOR_AND_SUBSCRIPTION/i, /DOMAIN_PORTFOLIO/i, /PLATFORM_PLAN/i, /OBJECTIVES_CHECKPOINT/i,
    /DECISION_REGISTER/i, /EVIDENCE_LEDGER/i, /TIER_1/i, /LAUNCH_PLAN/i, /INCOME_DEPLOYMENT/i,
    /VENTURE_ANALYSIS/i, /NON_MONETARY_RECOGNITION/i, /EVOLVING_NAME_VALUE/i, /FINANCIAL_UPDATE/i,
    /FOUNDER_REVENUE_PRIORITY/i
  ]},
  { cat: "04-engineering-os-ai-web-app", pats: [
    /BUILD_PROGRAM/i, /ENGINE_INTEGRATION/i, /RAILWAY_DEPLOYMENT/i, /AUTOMATION/i,
    /CI_CONTINUITY/i, /SOURCE_CATALOG/i, /MEMORY_SERVICE/i, /WEB_ACCESS/i, /GITHUB_ACCESS/i,
    /RUNTIME_TIMELINE/i, /OS_PORTABILITY/i, /OS_UNIFIED_PLATFORM/i, /OS_VISION/i,
    /DATA_MODEL/i, /CREATION_TOOLS/i, /GUIDE_BUILDING/i, /APP_INVENTORY/i,
    /DIRECTORY_READINESS/i, /CONTINUOUS_VALIDATION/i, /CHAT_PRIVACY/i, /AXES_OS_APP_INVENTORY/i,
    /ENGINE_INTEGRATION/i, /APPLICATION_DRAFT_RECORDS/i, /automation freedom/i
  ]},
  { cat: "05-products-and-applications", pats: [
    /ATHANOR/i, /CHICHETKI/i, /AXOUS/i, /SCHOOL_OF_LOVE/i, /URNUR/i, /DESIGN_MATERIALS/i,
    /DMC_/i, /PAGE_8/i, /INTERACTIVE_EXPERIENCE/i, /TEMPLE_OF_LOVE/i, /AXAXAR/i,
    /HARMONICS/i, /EQUILIBRIUM_SYMBOLISM/i, /TRIANGLE_ORIGIN_SYMBOLISM/i,
    /PRODUCT_BRANCH_DOMAIN_MAP/i, /USER_OWNED_AI_SESSIONS/i, /SPHERE/i
  ]},
  { cat: "06-status-readiness-and-incident-reports", pats: [
    /READINESS/i, /STATUS_REPORT/i, /CHECKPOINT/i, /_INVENTORY/i, /LIMITATIONS_REPORT/i,
    /PRODUCTION_INCIDENT/i, /RELEASE_C_READINESS/i, /VISUAL_BRIEF/i, /intel report/i
  ]},
  { cat: "07-activation-and-intake", pats: [
    /ACTIVATION/i, /INTAKE_TEMPLATE/i
  ]},
];

function classify(fileName) {
  for (const rule of rules) {
    if (rule.pats.some(p => p.test(fileName))) return rule.cat;
  }
  return null; // let folder-based routing or fallback decide
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

const copied = []; // { category, relSourcePath, destPath }
const skipped = [];

function copyFile(srcPath, category, subpath) {
  const destDir = path.join(destRoot, category, subpath ? path.dirname(subpath) : "");
  ensureDir(destDir);
  const fileName = path.basename(srcPath);
  const destPath = path.join(destDir, fileName);
  fs.copyFileSync(srcPath, destPath);
  copied.push({
    category,
    source: path.relative(repoRoot, srcPath).replace(/\\/g, "/"),
    dest: path.relative(repoRoot, destPath).replace(/\\/g, "/")
  });
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIR_NAMES.has(entry.name)) continue;
      walk(path.join(dir, entry.name));
    }
  }
}

// ---- Folder-routed sources (bulk categories keyed by source directory) ----
const docsRoot = path.join(repoRoot, "docs");

function copyDirWholesale(srcDir, category, opts = {}, relBase = "") {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (opts.recurse) {
        copyDirWholesale(path.join(srcDir, entry.name), category, opts, path.join(relBase, entry.name));
      }
      continue;
    }
    // Preserve subdirectory structure (relBase) so same-named files in
    // different subfolders (e.g. two README.md files) never collide.
    copyFile(path.join(srcDir, entry.name), category, path.join(relBase, entry.name));
  }
}

// 00 - repo-root orientation docs (README, timeline, agent instructions, notice)
for (const rootFile of ["README.md", "PROJECT_TIMELINE.md", "AGENTS.md", "NOTICE.md"]) {
  const p = path.join(repoRoot, rootFile);
  if (fs.existsSync(p)) copyFile(p, "00-orientation-and-timeline");
}

// 08 - memory & continuity (bulk, chronological, already well-organized)
copyDirWholesale(path.join(docsRoot, "memory"), "08-memory-and-continuity-records");

// 09 - patents (as-is, includes the large .docx)
copyDirWholesale(path.join(docsRoot, "patents"), "09-patents-source-files");

// 10 - fixtures & data schemas
copyDirWholesale(path.join(docsRoot, "fixtures"), "10-fixtures-and-data-schemas", { recurse: true });

// 11 - visual/interactive assets
copyDirWholesale(path.join(docsRoot, "keystone", "assets"), "11-assets-and-interactive", { recurse: true });

// 12 - status dashboards (S1 etc.) — copy alongside, do not touch originals
copyDirWholesale(path.join(docsRoot, "keystone", "status"), "12-live-status-dashboards");

// activation folder already covered by rule-based classify() below via docs root walk,
// but also copy directly to be safe for any non-.md files in it.
copyDirWholesale(path.join(docsRoot, "activation"), "07-activation-and-intake");

// ---- Rule-routed sources: docs/*.md and docs/keystone/*.md (top-level files only) ----
function classifyAndCopyTopLevel(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) continue;
    const cat = classify(entry.name);
    const srcPath = path.join(dir, entry.name);
    if (cat) {
      copyFile(srcPath, cat);
    } else {
      skipped.push(path.relative(repoRoot, srcPath).replace(/\\/g, "/"));
    }
  }
}

classifyAndCopyTopLevel(docsRoot);
classifyAndCopyTopLevel(path.join(docsRoot, "keystone"));

// Anything left unclassified goes into a 99 fallback bucket so nothing is silently dropped.
for (const rel of skipped) {
  const srcPath = path.join(repoRoot, rel);
  copyFile(srcPath, "99-uncategorized-pending-review");
}

// ---- Write manifest for the PR / verification, and the index doc separately ----
fs.writeFileSync(
  path.join(repoRoot, ".tmp-command-center-manifest.json"),
  JSON.stringify({ totalCopied: copied.length, byCategory: copied.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1; return acc;
  }, {}), entries: copied }, null, 2)
);

console.log("Copied " + copied.length + " files.");
console.log(JSON.stringify(copied.reduce((acc, c) => { acc[c.category] = (acc[c.category]||0)+1; return acc; }, {}), null, 2));
