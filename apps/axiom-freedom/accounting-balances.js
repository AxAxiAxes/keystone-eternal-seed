const fs = require('node:fs');
const path = require('node:path');

const documentsDirectory = fs.existsSync(path.join(__dirname, 'docs'))
    ? path.join(__dirname, 'docs')
    : path.resolve(__dirname, '..', '..', 'docs');
const ledgerFile = path.join(documentsDirectory, 'accounting-balances.json');

function requireValid(condition, message) {
    if (!condition) throw new Error(message);
}

function fields(record, names) {
    requireValid(record && typeof record === 'object' && !Array.isArray(record)
        && Object.keys(record).length === names.length
        && names.every(name => Object.hasOwn(record, name)), 'Invalid ledger fields.');
}

function text(value, maximum) {
    return typeof value === 'string' && value.trim().length > 0
        && value.length <= maximum && !/[\x00-\x1f\x7f]/.test(value);
}

function reference(value) {
    return typeof value === 'string' && value.length <= 240
        && /^docs\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\.md(?:#[A-Za-z0-9_-]+)?$/.test(value);
}

function formatAmount(value) {
    const absolute = value < 0n ? -value : value;
    return `${value < 0n ? '-' : ''}${absolute / 100n}.${String(absolute % 100n).padStart(2, '0')}`;
}

function buildLedger(source) {
    fields(source, ['schemaVersion', 'scope', 'accounts', 'entries']);
    requireValid(source.schemaVersion === 1 && source.scope === 'internal-recordkeeping'
        && Array.isArray(source.accounts) && Array.isArray(source.entries), 'Invalid ledger schema.');
    const accounts = new Map();
    const ids = new Set();
    const validId = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value);
    for (const account of source.accounts) {
        fields(account, ['id', 'label', 'currency']);
        requireValid(validId(account.id) && !accounts.has(account.id)
            && text(account.label, 80) && typeof account.currency === 'string'
            && /^[A-Z]{3}$/.test(account.currency), 'Invalid or duplicate ledger account.');
        accounts.set(account.id, { ...account, approved: 0n, draft: 0n });
    }
    const entries = source.entries.map(entry => {
        fields(entry, ['id', 'date', 'accountId', 'amount', 'description', 'evidenceRef', 'status', 'approvalRef']);
        requireValid(validId(entry.id) && !ids.has(entry.id), 'Invalid or duplicate ledger entry ID.');
        ids.add(entry.id);
        requireValid(typeof entry.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.date)
            && !Number.isNaN(Date.parse(`${entry.date}T00:00:00Z`))
            && new Date(`${entry.date}T00:00:00Z`).toISOString().slice(0, 10) === entry.date,
        'Invalid ledger date.');
        const account = accounts.get(entry.accountId);
        requireValid(account && typeof entry.amount === 'string'
            && /^-?(?:0|[1-9]\d{0,17})\.\d{2}$/.test(entry.amount)
            && entry.amount !== '-0.00', 'Unknown account or invalid ledger amount.');
        requireValid(text(entry.description, 240) && reference(entry.evidenceRef), 'Invalid ledger evidence.');
        requireValid((entry.status === 'draft' && entry.approvalRef === null)
            || (entry.status === 'approved' && reference(entry.approvalRef)), 'Invalid ledger approval.');
        const amount = BigInt(entry.amount.replace('.', ''));
        account[entry.status === 'approved' ? 'approved' : 'draft'] += amount;
        return { ...entry, currency: account.currency };
    });
    return {
        schemaVersion: 1,
        scope: source.scope,
        balances: [...accounts.values()].map(account => ({
            id: account.id,
            label: account.label,
            currency: account.currency,
            approvedBalance: formatAmount(account.approved),
            draftChange: formatAmount(account.draft)
        })),
        entries
    };
}

function readLedger(file = ledgerFile) {
    const ledger = buildLedger(JSON.parse(fs.readFileSync(file, 'utf8')));
    for (const entry of ledger.entries) {
        for (const ref of [entry.evidenceRef, entry.approvalRef].filter(Boolean)) {
            const referenceFile = path.join(documentsDirectory, ref.split('#')[0].slice('docs/'.length));
            requireValid(fs.existsSync(referenceFile) && fs.statSync(referenceFile).isFile(), 'Ledger reference is missing.');
        }
    }
    return ledger;
}

module.exports = { buildLedger, readLedger };

if (require.main === module) {
    try {
        requireValid(process.argv.length === 2 || (process.argv.length === 3
            && process.argv[2] === '--report'), 'Usage: node accounting-balances.js [--report]');
        const ledger = readLedger();
        console.log(process.argv[2] === '--report'
            ? JSON.stringify(ledger, null, 2)
            : 'Accounting-balance ledger valid.');
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
