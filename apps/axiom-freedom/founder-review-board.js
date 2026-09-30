'use strict';

// Founder review board: a repository-maintained, human-edited snapshot of
// what is in review, what needs a founder decision, and the single next step.
// This module only reads and validates that snapshot. It never contacts
// GitHub, never approves or merges anything, and never records founder
// confirmation on the founder's behalf. See docs/FOUNDER_REVIEW_COMMAND_CENTER.md.

const fs = require('fs');
const path = require('path');

const SCHEMA_VERSION = 'founder-review-board-v1';
const REPOSITORY_PR_URL = /^https:\/\/github\.com\/AxAxiAxes\/keystone-eternal-seed\/pull\/(\d+)$/;
const GITHUB_URL = /^https:\/\/github\.com\/AxAxiAxes\/keystone-eternal-seed\//;
const DAY_MS = 24 * 60 * 60 * 1000;
const FRESH_DAYS = 7;
const MAX_TEXT = 400;

const STATES = Object.freeze({
    proposed: 'Proposed',
    implemented_on_branch: 'Implemented on branch',
    verified_on_base: 'Verified on base',
    externally_reported_unverified: 'Externally reported · unverified'
});
const CI_OBSERVATIONS = Object.freeze({
    not_run_action_required: 'CI waiting for approval (action_required) on current commit',
    passed_on_head: 'CI passed on current commit',
    failed_on_head: 'CI failed on current commit',
    unknown: 'CI status not recorded'
});
const CHECKLIST_OWNERS = new Set(['automated_check', 'founder']);
const CHECKLIST_STATUSES = Object.freeze({
    pending: 'to do',
    done_by_check: 'done by automated check',
    founder_confirmed: 'confirmed by founder',
    not_applicable: 'not applicable'
});
const CONFIRMATION_STATES = new Set(['pending', 'confirmed', 'declined']);
const LENSES = ['fundamentals', 'inReview', 'needsFounderDecision', 'later'];

function defaultBoardPath() {
    const bundled = path.join(__dirname, 'docs');
    const documents = fs.existsSync(bundled) ? bundled : path.resolve(__dirname, '..', '..', 'docs');
    return path.join(documents, 'founder-review', 'founder-review-board.v1.json');
}

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isValidTimestamp(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(Date.parse(value));
}

function validateFounderReviewBoard(board) {
    const errors = [];
    const text = (value, where, max = MAX_TEXT) => {
        if (typeof value !== 'string' || !value.trim()) {
            errors.push(`${where} must be a non-empty string`);
        } else if (value.length > max) {
            errors.push(`${where} must be at most ${max} characters to stay easy to scan`);
        }
    };
    const url = (value, where) => {
        if (typeof value !== 'string' || !GITHUB_URL.test(value)) {
            errors.push(`${where} must be a https://github.com/AxAxiAxes/keystone-eternal-seed/ link`);
        }
    };
    const item = (entry, where) => {
        if (!isObject(entry)) {
            errors.push(`${where} must be an object`);
            return false;
        }
        text(entry.id, `${where}.id`, 80);
        text(entry.title, `${where}.title`, 160);
        text(entry.provenance, `${where}.provenance`);
        text(entry.nextStep, `${where}.nextStep`, 240);
        if (!Object.hasOwn(STATES, entry.state)) {
            errors.push(`${where}.state must be one of ${Object.keys(STATES).join(', ')}`);
        } else if (entry.state === 'verified_on_base' && !/^[0-9a-f]{7,40}$/.test(entry.baseCommit || '')) {
            errors.push(`${where}.state verified_on_base requires a baseCommit SHA`);
        }
        return true;
    };

    if (!isObject(board)) return ['board must be a JSON object'];
    if (board.schemaVersion !== SCHEMA_VERSION) errors.push(`schemaVersion must be ${SCHEMA_VERSION}`);
    if (!isValidTimestamp(board.recordedAt)) errors.push('recordedAt must be an ISO-8601 timestamp');
    if (!isObject(board.source)) {
        errors.push('source must describe how this snapshot was recorded');
    } else {
        text(board.source.method, 'source.method');
        text(board.source.refreshHow, 'source.refreshHow');
        text(board.source.baseBranch, 'source.baseBranch', 120);
    }

    // Automation boundaries are explicit data, not implied behavior, and must stay false.
    if (!isObject(board.automation)) {
        errors.push('automation boundaries must be declared');
    } else {
        for (const key of ['mayApprove', 'mayMerge', 'mayPostReviewComments', 'mayRecordFounderConfirmation']) {
            if (board.automation[key] !== false) errors.push(`automation.${key} must be false`);
        }
    }

    if (!isObject(board.lenses)) {
        errors.push('lenses must be an object');
        return errors;
    }
    const unknownLenses = Object.keys(board.lenses).filter(key => !LENSES.includes(key));
    if (unknownLenses.length) errors.push(`unknown lenses: ${unknownLenses.join(', ')}`);

    const fundamentals = board.lenses.fundamentals;
    if (!isObject(fundamentals) || !isObject(fundamentals.nextStep)) {
        errors.push('lenses.fundamentals.nextStep must hold exactly one next step');
    } else {
        text(fundamentals.nextStep.title, 'lenses.fundamentals.nextStep.title', 160);
        text(fundamentals.nextStep.why, 'lenses.fundamentals.nextStep.why');
        text(fundamentals.nextStep.how, 'lenses.fundamentals.nextStep.how');
        if (fundamentals.nextStep.link !== undefined) url(fundamentals.nextStep.link, 'lenses.fundamentals.nextStep.link');
        const basics = fundamentals.basics === undefined ? [] : fundamentals.basics;
        if (!Array.isArray(basics) || basics.length > 3) {
            errors.push('lenses.fundamentals.basics must be a list of at most 3 short reminders');
        } else {
            basics.forEach((basic, index) => text(basic, `lenses.fundamentals.basics[${index}]`, 240));
        }
    }

    const ids = new Set();
    const trackId = (entry, where) => {
        if (entry && typeof entry.id === 'string') {
            if (ids.has(entry.id)) errors.push(`${where}.id duplicates ${entry.id}`);
            ids.add(entry.id);
        }
    };

    const inReview = board.lenses.inReview;
    if (!Array.isArray(inReview)) {
        errors.push('lenses.inReview must be a list');
    } else {
        inReview.forEach((pr, index) => {
            const where = `lenses.inReview[${index}]`;
            if (!item(pr, where)) return;
            trackId(pr, where);
            if (!Number.isInteger(pr.pr) || pr.pr < 1) errors.push(`${where}.pr must be a pull request number`);
            const match = typeof pr.url === 'string' && pr.url.match(REPOSITORY_PR_URL);
            if (!match || Number(match[1]) !== pr.pr) errors.push(`${where}.url must link to pull request #${pr.pr}`);
            if (pr.state === 'verified_on_base') errors.push(`${where}.state cannot be verified_on_base while the pull request is in review`);
            text(pr.headBranch, `${where}.headBranch`, 160);
            text(pr.observedMergeState, `${where}.observedMergeState`, 80);
            if (typeof pr.draft !== 'boolean') errors.push(`${where}.draft must be true or false`);
            if (!isValidTimestamp(pr.observedAt)) errors.push(`${where}.observedAt must be an ISO-8601 timestamp`);
            if (!Object.hasOwn(CI_OBSERVATIONS, pr.ciObservation)) {
                errors.push(`${where}.ciObservation must be one of ${Object.keys(CI_OBSERVATIONS).join(', ')}`);
            } else if (pr.ciObservation !== 'unknown') {
                url(pr.ciEvidence, `${where}.ciEvidence`);
            }
            if (!Array.isArray(pr.dependencies)) {
                errors.push(`${where}.dependencies must be a list (use [] when none)`);
            } else {
                pr.dependencies.forEach((dependency, dependencyIndex) => text(dependency, `${where}.dependencies[${dependencyIndex}]`, 240));
            }
            if (!Array.isArray(pr.checklist) || pr.checklist.length === 0) {
                errors.push(`${where}.checklist must list at least one review step`);
            } else {
                if (!pr.checklist.some(step => step && step.owner === 'founder')) {
                    errors.push(`${where}.checklist must include at least one founder review step`);
                }
                pr.checklist.forEach((step, stepIndex) => {
                    const stepWhere = `${where}.checklist[${stepIndex}]`;
                    if (!isObject(step)) {
                        errors.push(`${stepWhere} must be an object`);
                        return;
                    }
                    text(step.item, `${stepWhere}.item`, 240);
                    if (!CHECKLIST_OWNERS.has(step.owner)) errors.push(`${stepWhere}.owner must be automated_check or founder`);
                    if (!Object.hasOwn(CHECKLIST_STATUSES, step.status)) {
                        errors.push(`${stepWhere}.status must be one of ${Object.keys(CHECKLIST_STATUSES).join(', ')}`);
                    }
                    // A passing check is never a founder decision, and a founder step is never satisfied by CI.
                    if (step.owner === 'founder' && step.status === 'done_by_check') {
                        errors.push(`${stepWhere} is a founder step and cannot be completed by an automated check`);
                    }
                    if (step.owner === 'automated_check' && step.status === 'founder_confirmed') {
                        errors.push(`${stepWhere} is an automated check and cannot be founder_confirmed`);
                    }
                    if (step.status === 'founder_confirmed' || step.status === 'done_by_check') {
                        url(step.evidence, `${stepWhere}.evidence`);
                    }
                });
            }
            const confirmation = pr.founderConfirmation;
            if (!isObject(confirmation) || !CONFIRMATION_STATES.has(confirmation.state)) {
                errors.push(`${where}.founderConfirmation.state must be pending, confirmed, or declined`);
            } else if (confirmation.state !== 'pending') {
                url(confirmation.evidence, `${where}.founderConfirmation.evidence`);
                if (confirmation.recordedBy !== 'founder') {
                    errors.push(`${where}.founderConfirmation must be recordedBy the founder, never by automation`);
                }
            }
        });
    }

    const decisions = board.lenses.needsFounderDecision;
    if (!Array.isArray(decisions)) {
        errors.push('lenses.needsFounderDecision must be a list');
    } else {
        decisions.forEach((decision, index) => {
            const where = `lenses.needsFounderDecision[${index}]`;
            if (!item(decision, where)) return;
            trackId(decision, where);
            text(decision.question, `${where}.question`);
            text(decision.ifNoDecision, `${where}.ifNoDecision`);
            if (!Array.isArray(decision.options) || decision.options.length < 2) {
                errors.push(`${where}.options must offer at least two choices`);
            } else {
                decision.options.forEach((option, optionIndex) => text(option, `${where}.options[${optionIndex}]`, 240));
            }
        });
    }

    const later = board.lenses.later;
    if (!Array.isArray(later)) {
        errors.push('lenses.later must be a list');
    } else {
        later.forEach((possibility, index) => {
            const where = `lenses.later[${index}]`;
            if (!item(possibility, where)) return;
            trackId(possibility, where);
            if (possibility.parked !== true) errors.push(`${where}.parked must be true; later possibilities stay parked until chosen`);
            if (possibility.state === 'verified_on_base') errors.push(`${where}.state cannot be verified_on_base while parked`);
        });
    }

    return errors;
}

function describeFreshness(recordedAt, now = new Date()) {
    const ageDays = Math.max(0, Math.floor((now.getTime() - Date.parse(recordedAt)) / DAY_MS));
    const fresh = ageDays <= FRESH_DAYS;
    return {
        recordedAt,
        ageDays,
        status: fresh ? 'recent' : 'stale',
        label: fresh
            ? `Snapshot recorded ${ageDays} day(s) ago. Not live: confirm on GitHub before acting.`
            : `Snapshot is ${ageDays} days old and may be out of date. Refresh it from GitHub before relying on it.`
    };
}

function loadFounderReviewBoard(boardPath = defaultBoardPath(), now = new Date()) {
    const board = JSON.parse(fs.readFileSync(boardPath, 'utf8'));
    const errors = validateFounderReviewBoard(board);
    if (errors.length) {
        const error = new Error(`Founder review board is invalid: ${errors.join('; ')}`);
        error.validationErrors = errors;
        throw error;
    }
    return {
        ...board,
        freshness: describeFreshness(board.recordedAt, now),
        labels: { states: STATES, ciObservations: CI_OBSERVATIONS, checklistStatuses: CHECKLIST_STATUSES }
    };
}

function renderAdvisorySummary(board) {
    const cell = value => String(value).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
    const next = board.lenses.fundamentals.nextStep;
    const lines = [
        '## Founder review board — advisory summary',
        '',
        '> Advisory only. This check validates repository data; it does not approve, merge, post review comments, or stand in for founder review. A passing check is not founder acceptance, and a pull request is not production.',
        '',
        `**Freshness:** ${board.freshness.label}`,
        '',
        `**One next step:** ${next.title}`,
        '',
        '| PR | State | CI observation | Founder confirmation | Open founder steps |',
        '| --- | --- | --- | --- | --- |'
    ];
    for (const pr of board.lenses.inReview) {
        const openFounderSteps = pr.checklist.filter(step => step.owner === 'founder' && step.status === 'pending').length;
        lines.push(`| #${pr.pr} | ${cell(STATES[pr.state])} | ${cell(CI_OBSERVATIONS[pr.ciObservation])} | ${cell(pr.founderConfirmation.state)} | ${openFounderSteps} |`);
    }
    lines.push(
        '',
        `Needs founder decision: ${board.lenses.needsFounderDecision.length} · Later / parked possibilities: ${board.lenses.later.length}`,
        ''
    );
    return lines.join('\n');
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const boardPath = args.find(arg => !arg.startsWith('--')) || defaultBoardPath();
    try {
        const board = loadFounderReviewBoard(boardPath);
        process.stdout.write(args.includes('--summary')
            ? renderAdvisorySummary(board)
            : `Founder review board is valid (${board.lenses.inReview.length} pull requests in review).\n`);
    } catch (error) {
        for (const message of error.validationErrors || [error.message]) console.error(`::error::${message}`);
        process.exitCode = 1;
    }
}

module.exports = {
    SCHEMA_VERSION,
    STATES,
    CI_OBSERVATIONS,
    CHECKLIST_STATUSES,
    defaultBoardPath,
    describeFreshness,
    loadFounderReviewBoard,
    renderAdvisorySummary,
    validateFounderReviewBoard
};
