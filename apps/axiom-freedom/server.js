const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.AXIOM_PORT || 8080);
const host = '0.0.0.0';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const LEADS_FILE = path.join(__dirname, 'leads.json');
const DOCUMENTS_DIRECTORY = fs.existsSync(path.join(__dirname, 'docs'))
    ? path.resolve(__dirname, 'docs')
    : path.resolve(__dirname, '..', '..', 'docs');
const PROJECT_TIMELINE_FILE = fs.existsSync(path.join(__dirname, 'PROJECT_TIMELINE.md'))
    ? path.resolve(__dirname, 'PROJECT_TIMELINE.md')
    : path.resolve(__dirname, '..', '..', 'PROJECT_TIMELINE.md');
const AXIOM_ENGINE_URL = new URL(process.env.AXIOM_ENGINE_URL || 'http://127.0.0.1:3000');

function isAxesContractingHost(host) {
    const hostname = String(host || '').split(':')[0].toLowerCase();
    return hostname === 'axescontracting.com' || hostname === 'www.axescontracting.com';
}

function getLeads() {
    try {
          if (fs.existsSync(LEADS_FILE)) return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    } catch(e) {}
    return [];
}

function saveLead(lead) {
    const leads = getLeads();
    lead.id = Date.now();
    lead.timestamp = new Date().toISOString();
    leads.unshift(lead);
    try { fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2)); } catch(e) {}
    console.log('NEW LEAD [' + lead.damageType + '] ' + lead.name + ' | ' + lead.phone);
    return lead;
}

function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
          if (err) { res.writeHead(404); res.end('Not Found'); return; }
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
    });
}

function parseBody(req) {
    return new Promise((resolve) => {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => { try { resolve(JSON.parse(body)); } catch(e) { resolve({}); } });
    });
}

function checkAdmin(req) {
    if (!ADMIN_PASSWORD) return false;
    const b64 = ((req.headers['authorization'] || '').split(' ')[1] || '');
    const parts = Buffer.from(b64, 'base64').toString().split(':');
    return parts[1] === ADMIN_PASSWORD;
}

function serveDocument(res, pathname) {
    const relativePath = decodeURIComponent(pathname.substring('/library/'.length));
    const documentPath = path.resolve(DOCUMENTS_DIRECTORY, relativePath);

    if (!documentPath.startsWith(DOCUMENTS_DIRECTORY + path.sep)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const contentType = path.extname(documentPath).toLowerCase() === '.docx'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'text/plain; charset=utf-8';
    serveFile(res, documentPath, contentType);
}

function getCommandCenterCheckpoints() {
    const timeline = fs.readFileSync(PROJECT_TIMELINE_FILE, 'utf8');
    const phase = timeline.match(/^\*\*Current phase:\*\*\s*(.+)$/m);
    const sectionStart = timeline.indexOf('## Current checkpoints');
    const nextSection = timeline.indexOf('\n## ', sectionStart + 1);

    if (!phase || sectionStart === -1 || nextSection === -1) {
        throw new Error('Project timeline checkpoints are unavailable.');
    }

    const checkpoints = [];
    let currentCheckpoint;
    const lines = timeline.slice(sectionStart, nextSection).split(/\r?\n/);
    for (const line of lines) {
        const entry = line.match(/^- \[([ xX])\]\s+(.+)$/);
        if (entry) {
            currentCheckpoint = {
                status: entry[1].toLowerCase() === 'x' ? 'complete' : 'planned',
                title: entry[2].trim()
            };
            checkpoints.push(currentCheckpoint);
        } else if (currentCheckpoint && /^\s{2,}\S/.test(line)) {
            currentCheckpoint.title += ' ' + line.trim();
        }
    }

    return {
        recordedAt: new Date().toISOString(),
        currentPhase: phase[1].trim(),
        checkpoints
    };
}

async function invokeEngine(endpoint, method = 'GET', body) {
    const response = await fetch(new URL(endpoint, AXIOM_ENGINE_URL), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(60000)
    });

    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const error = new Error(payload.error || 'AXIOM engine returned HTTP ' + response.status);
        error.statusCode = response.status;
        throw error;
    }

    return response.json();
}

function invokeAxiomEngine(command) {
    return invokeEngine('/axiom', 'POST', command);
}

async function getSupportStatus() {
    const checks = await Promise.allSettled([
        invokeEngine('/health'),
        invokeEngine('/system/readiness'),
        invokeEngine('/automation/status'),
        invokeEngine('/monitoring/status'),
        invokeEngine('/system/checkpoints?limit=1'),
        invokeEngine('/system/continuity-record'),
        invokeEngine('/system/source-catalog'),
        invokeEngine('/system/business-metrics'),
        invokeEngine('/system/service-registry'),
        invokeEngine('/automation/profiles')
    ]);
    const [engine, readiness, automation, monitoring, checkpoints, continuityRecord, sourceCatalog, businessMetrics, serviceRegistry, automationProfiles] = checks;

    return {
        recordedAt: new Date().toISOString(),
        portal: { status: 'ok', service: 'AXES Contracting support desk' },
        engine: engine.status === 'fulfilled'
            ? { status: 'ok', detail: engine.value.status || 'online' }
            : { status: 'unavailable' },
        readiness: readiness.status === 'fulfilled'
            ? readiness.value
            : { status: 'unavailable' },
        automation: automation.status === 'fulfilled'
            ? { status: 'ok', ...automation.value }
            : { status: 'unavailable' },
        monitoring: monitoring.status === 'fulfilled'
            ? { status: 'ok', ...monitoring.value }
            : { status: 'unavailable' },
        checkpoints: checkpoints.status === 'fulfilled'
            ? { status: 'ok', latest: checkpoints.value[0] || null }
            : { status: 'unavailable' },
        continuityRecord: continuityRecord.status === 'fulfilled'
            ? continuityRecord.value
            : { status: 'unavailable' },
        sourceCatalog: sourceCatalog.status === 'fulfilled'
            ? sourceCatalog.value
            : { status: 'unavailable' },
        businessMetrics: businessMetrics.status === 'fulfilled'
            ? businessMetrics.value
            : { status: 'unavailable' },
        serviceRegistry: serviceRegistry.status === 'fulfilled'
            ? serviceRegistry.value
            : { status: 'unavailable' },
        automationProfiles: automationProfiles.status === 'fulfilled'
            ? { status: 'ok', ...automationProfiles.value }
            : { status: 'unavailable' },
        email: {
            status: 'planned',
            mailbox: 'info@axescontracting.com',
            target: 'Microsoft 365',
            detail: 'No DNS or mailbox cutover has been recorded.'
        }
    };
}

function requireAdmin(req, res) {
    if (checkAdmin(req)) return true;
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="AXIOM Admin"' });
    res.end('Unauthorized');
    return false;
}

const server = http.createServer(async (req, res) => {
    const parsed = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
    const pathname = parsed.pathname;

                                   res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

                                   if (pathname === '/health') {
                                         res.writeHead(200, { 'Content-Type': 'application/json' });
                                         res.end(JSON.stringify({ status: 'ok', service: 'AXIOM', version: '2.0.0' }));
                                         return;
                                   }
    if (pathname === '/' || pathname === '/index.html') {
          const page = isAxesContractingHost(req.headers.host)
              ? 'axescontracting.html'
              : 'index.html';
          serveFile(res, path.join(__dirname, page), 'text/html; charset=utf-8');
          return;
    }
    if (pathname === '/axiom' || pathname === '/axiom/') {
          serveFile(res, path.join(__dirname, 'axiom_web_interface.html'), 'text/html; charset=utf-8');
          return;
    }
    if (pathname === '/origin-continuity' || pathname === '/origin-continuity/') {
          serveFile(res, path.join(__dirname, 'origin-continuity.html'), 'text/html; charset=utf-8');
          return;
    }
    if (pathname === '/materials' || pathname === '/materials/') {
          serveFile(res, path.join(__dirname, 'materials.html'), 'text/html; charset=utf-8');
          return;
    }
    if (pathname === '/automation' || pathname === '/automation/') {
          if (!requireAdmin(req, res)) return;
          serveFile(res, path.join(__dirname, 'automation.html'), 'text/html; charset=utf-8');
          return;
    }
    if (pathname === '/command-center' || pathname === '/command-center/') {
          if (!requireAdmin(req, res)) return;
          serveFile(res, path.join(__dirname, 'command-center.html'), 'text/html; charset=utf-8');
          return;
    }
    if (pathname === '/support' || pathname === '/support/') {
          if (!requireAdmin(req, res)) return;
          serveFile(res, path.join(__dirname, 'support.html'), 'text/html; charset=utf-8');
          return;
    }
    if (pathname === '/library/' || pathname === '/library') {
          serveFile(res, path.join(__dirname, 'library.html'), 'text/html; charset=utf-8');
          return;
    }
    if (pathname.startsWith('/library/')) {
          serveDocument(res, pathname);
          return;
    }
    if (pathname === '/embed' || pathname === '/embed/' || pathname === '/axes' || pathname === '/axes/') {
          // No embed page has ever been built (axes_embed.html never existed). Return an
          // honest "not yet available" response instead of a crashed/missing-file 404 so the
          // widget.js chat bubble iframe fails clearly rather than silently.
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<!doctype html><html><body style="font-family:sans-serif;text-align:center;padding:40px;color:#333"><p>This embedded chat widget is not yet available.</p></body></html>');
          return;
    }
    if (pathname === '/widget.js') {
          serveFile(res, path.join(__dirname, 'widget.js'), 'application/javascript; charset=utf-8');
          return;
    }
    if (pathname === '/api/intake' && req.method === 'POST') {
          const body = await parseBody(req);
          const lead = saveLead(body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, id: lead.id, message: 'Team alerted. We respond within 60 minutes.' }));
          return;
    }
    if (pathname === '/api/axiom' && req.method === 'POST') {
          const command = await parseBody(req);
          if (typeof command.action !== 'string' || command.action.trim().length === 0) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'action must be a non-empty string' }));
                  return;
          }

          try {
                  const result = await invokeAxiomEngine(command);
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(result));
          } catch (error) {
                  console.error('AXIOM engine request failed:', error.message);
                  if (command.action === 'chat' && error.statusCode === 503) {
                          res.writeHead(503, { 'Content-Type': 'application/json' });
                          res.end(JSON.stringify({ error: 'AXIOM chat is not configured' }));
                          return;
                  }
                  res.writeHead(502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    error: command.action === 'chat'
                      ? 'AXIOM chat is temporarily unavailable'
                      : 'AXIOM engine is unavailable'
                  }));
          }
          return;
    }
    if (pathname === '/api/automation/status' && req.method === 'GET') {
          if (!requireAdmin(req, res)) return;
          try {
                  const result = await invokeEngine('/automation/status');
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(result));
          } catch (error) {
                  console.error('AXIOM automation status request failed:', error.message);
                  res.writeHead(502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'AXIOM automation service is unavailable' }));
          }
          return;
    }
    if (pathname === '/api/automation/readiness' && req.method === 'GET') {
          if (!requireAdmin(req, res)) return;
          try {
                  const result = await invokeEngine('/automation/readiness');
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(result));
          } catch (error) {
                  console.error('AXIOM automation readiness request failed:', error.message);
                  res.writeHead(502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'AXIOM automation service is unavailable' }));
          }
          return;
    }
    if (pathname === '/api/automation/agents' && req.method === 'GET') {
          if (!requireAdmin(req, res)) return;
          try {
                  const result = await invokeEngine('/automation/agents');
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(result));
          } catch (error) {
                  console.error('AXIOM automation agent request failed:', error.message);
                  res.writeHead(502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'AXIOM automation service is unavailable' }));
          }
          return;
    }
    const agentReportRoute = pathname.match(/^\/api\/automation\/agents\/([^/]+)\/report$/);
    if (agentReportRoute && req.method === 'GET') {
          if (!requireAdmin(req, res)) return;
          try {
                  const result = await invokeEngine(
                    '/automation/agents/' + encodeURIComponent(agentReportRoute[1]) + '/report'
                  );
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(result));
          } catch (error) {
                  console.error('AXIOM agent timeline request failed:', error.message);
                  res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: error.message }));
          }
          return;
    }
    const agentAccountabilityRoute = pathname.match(
      /^\/api\/automation\/agents\/([^/]+)\/accountability$/
    );
    if (agentAccountabilityRoute && req.method === 'POST') {
          if (!requireAdmin(req, res)) return;
          try {
                  const result = await invokeEngine(
                    '/automation/agents/' +
                      encodeURIComponent(agentAccountabilityRoute[1]) +
                      '/accountability',
                    'POST',
                    await parseBody(req)
                  );
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(result));
          } catch (error) {
                  console.error('AXIOM agent accountability review failed:', error.message);
                  res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: error.message }));
          }
          return;
    }
    if (pathname === '/api/automation/tasks' && req.method === 'GET') {
          if (!requireAdmin(req, res)) return;
          try {
                  const result = await invokeEngine('/automation/tasks' + parsed.search);
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(result));
          } catch (error) {
                  console.error('AXIOM automation task request failed:', error.message);
                  res.writeHead(502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'AXIOM automation service is unavailable' }));
          }
          return;
    }
    if (pathname === '/api/automation/tasks' && req.method === 'POST') {
          if (!requireAdmin(req, res)) return;
          try {
                  const task = await invokeEngine('/automation/tasks', 'POST', await parseBody(req));
                  res.writeHead(201, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(task));
          } catch (error) {
                  console.error('AXIOM automation task creation failed:', error.message);
                  res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    error: error.statusCode ? error.message : 'AXIOM automation service is unavailable'
                  }));
          }
          return;
    }
    const approvalRoute = pathname.match(/^\/api\/automation\/tasks\/([^/]+)\/approval$/);
    if (approvalRoute && req.method === 'POST') {
              if (!requireAdmin(req, res)) return;
              try {
                      const task = await invokeEngine(
                        '/automation/tasks/' + encodeURIComponent(approvalRoute[1]) + '/approval',
                        'POST',
                        await parseBody(req)
                      );
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(task));
              } catch (error) {
                      console.error('AXIOM automation task approval failed:', error.message);
                      res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: error.message }));
              }
              return;
    }
    if (pathname === '/api/automation/process' && req.method === 'POST') {
          if (!requireAdmin(req, res)) return;
          try {
                  const result = await invokeEngine('/automation/process', 'POST', await parseBody(req));
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(result));
          } catch (error) {
                  console.error('AXIOM automation processing failed:', error.message);
                  res.writeHead(502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'AXIOM automation service is unavailable' }));
          }
          return;
    }
    if (pathname === '/api/automation/runs' && req.method === 'GET') {
              if (!requireAdmin(req, res)) return;
              try {
                      const result = await invokeEngine('/automation/runs' + parsed.search);
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(result));
              } catch (error) {
                      console.error('AXIOM automation run-history request failed:', error.message);
                      res.writeHead(502, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: 'AXIOM automation service is unavailable' }));
              }
              return;
    }
    if (pathname === '/api/command-center/checkpoints' && req.method === 'GET') {
          if (!requireAdmin(req, res)) return;
          try {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(getCommandCenterCheckpoints()));
          } catch (error) {
                  console.error('AXES Command Center checkpoint request failed:', error.message);
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'AXES Command Center checkpoints are unavailable' }));
          }
          return;
    }
    if (pathname === '/api/automation/chat' && req.method === 'POST') {
          if (!requireAdmin(req, res)) return;
          try {
                  const result = await invokeEngine('/automation/chat', 'POST', await parseBody(req));
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(result));
          } catch (error) {
                  console.error('AXIOM agent chat failed:', error.message);
                  res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: error.message }));
          }
          return;
    }
    if (pathname === '/api/automation/monitoring/status' && req.method === 'GET') {
              if (!requireAdmin(req, res)) return;
              try {
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(await invokeEngine('/monitoring/status')));
              } catch (error) {
                      console.error('AXIOM monitoring status request failed:', error.message);
                      res.writeHead(502, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: 'AXIOM monitoring service is unavailable' }));
              }
              return;
    }
    if (pathname === '/api/automation/monitoring/history' && req.method === 'GET') {
              if (!requireAdmin(req, res)) return;
              try {
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(await invokeEngine('/monitoring/history' + parsed.search)));
              } catch (error) {
                      console.error('AXIOM monitoring history request failed:', error.message);
                      res.writeHead(502, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: 'AXIOM monitoring service is unavailable' }));
              }
              return;
    }
    if (pathname === '/api/automation/monitoring/snapshots' && req.method === 'POST') {
              if (!requireAdmin(req, res)) return;
              try {
                      const snapshot = await invokeEngine('/monitoring/snapshots', 'POST', {});
                      res.writeHead(201, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(snapshot));
              } catch (error) {
                      console.error('AXIOM monitoring snapshot failed:', error.message);
                      res.writeHead(502, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: 'AXIOM monitoring service is unavailable' }));
              }
              return;
    }
    if (pathname === '/api/automation/continuity-record' && req.method === 'GET') {
              if (!requireAdmin(req, res)) return;
              try {
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(await invokeEngine('/system/continuity-record')));
              } catch (error) {
                      console.error('AXIOM continuity record status request failed:', error.message);
                      res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: error.message }));
              }
              return;
    }
    if (pathname === '/api/automation/continuity-record/events' && req.method === 'GET') {
              if (!requireAdmin(req, res)) return;
              try {
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(await invokeEngine(
                        '/system/continuity-record/events' + parsed.search
                      )));
              } catch (error) {
                      console.error('AXIOM continuity record history request failed:', error.message);
                      res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: error.message }));
              }
              return;
    }
    if (pathname === '/api/automation/source-catalog' && req.method === 'GET') {
              if (!requireAdmin(req, res)) return;
              try {
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(await invokeEngine('/system/source-catalog')));
              } catch (error) {
                      console.error('AXIOM source catalog status request failed:', error.message);
                      res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: error.message }));
              }
              return;
    }
    if (pathname === '/api/automation/source-catalog/entries' && req.method === 'GET') {
              if (!requireAdmin(req, res)) return;
              try {
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(await invokeEngine(
                        '/system/source-catalog/entries' + parsed.search
                      )));
              } catch (error) {
                      console.error('AXIOM source catalog entry request failed:', error.message);
                      res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: error.message }));
              }
              return;
    }
    if (pathname === '/api/automation/business-metrics' && req.method === 'GET') {
              if (!requireAdmin(req, res)) return;
              try {
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(await invokeEngine('/system/business-metrics')));
              } catch (error) {
                      console.error('AXIOM business metrics status request failed:', error.message);
                      res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: error.message }));
              }
              return;
    }
    if (pathname === '/api/automation/business-metrics/entries' && req.method === 'GET') {
              if (!requireAdmin(req, res)) return;
              try {
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(await invokeEngine(
                        '/system/business-metrics/entries' + parsed.search
                      )));
              } catch (error) {
                      console.error('AXIOM business metrics entry request failed:', error.message);
                      res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: error.message }));
              }
              return;
    }
    if (pathname === '/api/automation/business-metrics/summary' && req.method === 'GET') {
              if (!requireAdmin(req, res)) return;
              try {
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(await invokeEngine('/system/business-metrics/summary')));
              } catch (error) {
                      console.error('AXIOM business metrics summary request failed:', error.message);
                      res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: error.message }));
              }
              return;
    }
    if (pathname === '/api/automation/service-registry' && req.method === 'GET') {
                  if (!requireAdmin(req, res)) return;
                  try {
                          res.writeHead(200, { 'Content-Type': 'application/json' });
                          res.end(JSON.stringify(await invokeEngine('/system/service-registry')));
                  } catch (error) {
                          console.error('AXIOM service registry status request failed:', error.message);
                          res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                          res.end(JSON.stringify({ error: error.message }));
                  }
                  return;
    }
    if (pathname === '/api/automation/service-registry/entries' && req.method === 'GET') {
                  if (!requireAdmin(req, res)) return;
                  try {
                          res.writeHead(200, { 'Content-Type': 'application/json' });
                          res.end(JSON.stringify(await invokeEngine(
                            '/system/service-registry/entries' + parsed.search
                          )));
                  } catch (error) {
                          console.error('AXIOM service registry history request failed:', error.message);
                          res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                          res.end(JSON.stringify({ error: error.message }));
                  }
                  return;
    }
    if (pathname === '/api/automation/service-registry/projection' && req.method === 'GET') {
                  if (!requireAdmin(req, res)) return;
                  try {
                          res.writeHead(200, { 'Content-Type': 'application/json' });
                          res.end(JSON.stringify(await invokeEngine('/system/service-registry/projection')));
                  } catch (error) {
                          console.error('AXIOM service registry projection request failed:', error.message);
                          res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                          res.end(JSON.stringify({ error: error.message }));
                  }
                  return;
    }
    if (pathname === '/api/automation/profiles' && req.method === 'GET') {
          if (!requireAdmin(req, res)) return;
          try {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(await invokeEngine('/automation/profiles')));
          } catch (error) {
                  console.error('AXIOM automation profile status request failed:', error.message);
                  res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: error.message }));
          }
          return;
    }
    if (pathname === '/api/automation/storage' && req.method === 'GET') {
          if (!requireAdmin(req, res)) return;
          try {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(await invokeEngine('/system/storage')));
          } catch (error) {
                  console.error('AXIOM storage status request failed:', error.message);
                  res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: error.message }));
          }
          return;
    }
    if (pathname === '/api/automation/profiles' && req.method === 'POST') {
          if (!requireAdmin(req, res)) return;
          try {
                  const profile = await invokeEngine('/automation/profiles', 'POST', await parseBody(req));
                  res.writeHead(201, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(profile));
          } catch (error) {
                  console.error('AXIOM automation profile creation failed:', error.message);
                  res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: error.message }));
          }
          return;
    }
    if (pathname === '/api/automation/profiles/preview' && req.method === 'POST') {
          if (!requireAdmin(req, res)) return;
          try {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(await invokeEngine(
                    '/automation/profiles/preview', 'POST', await parseBody(req)
                  )));
          } catch (error) {
                  console.error('AXIOM automation profile preview failed:', error.message);
                  res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: error.message }));
          }
          return;
    }
    if (pathname === '/api/automation/profiles/history' && req.method === 'GET') {
          if (!requireAdmin(req, res)) return;
          try {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(await invokeEngine('/automation/profiles/history' + parsed.search)));
          } catch (error) {
                  console.error('AXIOM automation profile history request failed:', error.message);
                  res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: error.message }));
          }
          return;
    }
    if (pathname === '/api/automation/profiles/health' && req.method === 'GET') {
          if (!requireAdmin(req, res)) return;
          try {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(await invokeEngine('/automation/profiles/health')));
          } catch (error) {
                  console.error('AXIOM automation profile health request failed:', error.message);
                  res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: error.message }));
          }
          return;
    }
    const profileLifecycleRoute = pathname.match(/^\/api\/automation\/profiles\/([^/]+)\/(activate|pause|resume)$/);
    if (profileLifecycleRoute && req.method === 'POST') {
          if (!requireAdmin(req, res)) return;
          try {
                  const profile = await invokeEngine(
                    '/automation/profiles/' + encodeURIComponent(profileLifecycleRoute[1]) + '/' + profileLifecycleRoute[2],
                    'POST', await parseBody(req)
                  );
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(profile));
          } catch (error) {
                  console.error('AXIOM automation profile lifecycle request failed:', error.message);
                  res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: error.message }));
          }
          return;
    }
    if (pathname === '/api/automation/gravity-center' && req.method === 'GET') {
              if (!requireAdmin(req, res)) return;
              try {
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(await invokeEngine('/system/gravity-center')));
              } catch (error) {
                      console.error('AXIOM gravity center request failed:', error.message);
                      res.writeHead(502, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: 'AXIOM coordinate service is unavailable' }));
              }
              return;
    }
    if (pathname === '/api/automation/bead-passports' && req.method === 'GET') {
              if (!requireAdmin(req, res)) return;
              try {
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(await invokeEngine('/system/bead-passports' + parsed.search)));
              } catch (error) {
                      console.error('AXIOM bead passport request failed:', error.message);
                      res.writeHead(502, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: 'AXIOM coordinate service is unavailable' }));
              }
              return;
    }
    if (pathname === '/api/automation/bead-passports' && req.method === 'POST') {
              if (!requireAdmin(req, res)) return;
              try {
                      const passport = await invokeEngine(
                        '/system/bead-passports',
                        'POST',
                        await parseBody(req)
                      );
                      res.writeHead(201, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(passport));
              } catch (error) {
                      console.error('AXIOM bead passport registration failed:', error.message);
                      res.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: error.message }));
              }
              return;
    }
    if (pathname === '/api/support/status' && req.method === 'GET') {
              if (!requireAdmin(req, res)) return;
              try {
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(await getSupportStatus()));
              } catch (error) {
                      console.error('AXES support status request failed:', error.message);
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: 'AXES support status is unavailable' }));
              }
              return;
    }
    if (pathname === '/admin') {
          if (!requireAdmin(req, res)) return;
          res.writeHead(302, { Location: '/support' });
          res.end();
          return;
    }
    if (pathname === '/api/leads' && req.method === 'GET') {
          if (!requireAdmin(req, res)) return;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(getLeads()));
          return;
    }
    res.writeHead(404); res.end('Not Found');
});

if (require.main === module) {
    server.listen(port, host, () => {
        console.log('AXIOM v2.0 listening on ' + host + ':' + port);
        console.log('  Embed:  https://xiiom.com/embed');
        console.log('  Widget: https://xiiom.com/widget.js');
        console.log('  Admin:  https://xiiom.com/admin');
    });
}

module.exports = server;
