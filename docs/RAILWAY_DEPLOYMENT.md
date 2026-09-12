# Railway production deployment

Railway hosts the AXIOM runtime because SiteGround GrowBig shared hosting cannot run long-lived Docker services. Railway deploys two services from this repository:

| Service | Exposure | Source | Responsibility |
| --- | --- | --- | --- |
| `axiom-engine` | Private Railway network only | `apps/axiom-engine` | OpenAI requests and durable AXI memory. |
| `axiom-web` | Public | Repository root with Dockerfile `apps/axiom-freedom/Dockerfile` | `xiiom.com` public portal, chat, and document library; `axescontracting.com` private, admin-gated command center root. |

Never create a public domain for `axiom-engine`. Its memory endpoints and OpenAI credential must remain private.

## Legacy root Dockerfile and railway.toml

The repository root also contains a `Dockerfile` and `railway.toml`. These
predate the documented per-service setup below (Dockerfile path explicitly
set to `apps/axiom-freedom/Dockerfile` in the Railway dashboard) and were
found out of sync with the real portal app during a full repository review —
missing several pages added after the initial Railway configuration commit.
They have been re-synced with `apps/axiom-freedom/Dockerfile` as a safety net
in case any Railway service still resolves the Dockerfile at the repository
root by default, but no current documentation or CI job depends on them. An
operator with Railway dashboard access should confirm whether any service
still uses these root-level files; if not, remove both to eliminate the
duplicate-maintenance risk.

## Current deployment state

As of September 9, 2026:

- `axiom-freedom` is public at `https://xiiom.com` and deploys from the
  `axaxiaxes-axiom-monorepo` branch of this repository. Its public `/axiom`
  chat page and its `requireAdmin`-gated `/admin`, `/support`, and
  `/automation` consoles are all live and responding as designed (verified
  2026-09-11: `/axiom` returns 200; the other three correctly return 401
  without credentials, which is the intended protected-console behavior, not
  a fault).
- `axiom-engine` is deployed privately in the same Railway project, has a
  persistent Volume mounted at `/app/data`, and has no public domain.
- **`axescontracting.com` is not yet connected to Railway.** Verified
  2026-09-11: both `axescontracting.com` and `www.axescontracting.com`
  resolve via nameserver `ns1.siteground.net` (the legacy SiteGround hosting
  this document's introduction says Railway replaced), not the Railway IP
  serving `xiiom.com`. HTTPS to `axescontracting.com` fails with an expired
  server certificate (`SEC_E_CERT_EXPIRED`); plain HTTP returns `200` from
  whatever content SiteGround still serves there. This confirms Section 4
  below ("Connect `axescontracting.com`") and the "Immediate domain tasks"
  in `DOMAIN_PORTFOLIO.md` were never completed — the domain intended as the
  main AXES control center currently serves stale, insecure legacy content,
  not the `axiom-web` portal. Completing this requires an operator with both
  Railway dashboard access and SiteGround/registrar DNS access; it cannot be
  done from repository access alone.
- **The root of `axescontracting.com` now requires admin authentication.**
  As of this change, `server.js` serves `command-center.html` behind
  `requireAdmin` for that hostname's root instead of a public marketing page.
  This is independent of, and unaffected by, the still-pending DNS/Railway
  connection above — once that connection is completed, the root will
  immediately require the same admin credentials used by `/command-center`,
  `/automation`, and `/support` rather than showing public content.
- The portal successfully forwards `POST /api/axiom` commands to the private
  engine over Railway networking.
- Production OpenAI chat remains disabled until `OPENAI_API_KEY` is added as
  an encrypted variable to `axiom-engine`. Do not add that secret to this
  repository or a public portal variable.

## 1. Create the Railway project

1. In Railway, create a new project and choose **Deploy from GitHub repo**.
2. Select `AxAxiAxes/keystone-eternal-seed` and the `axaxiaxes-axiom-monorepo` branch.
3. Add two services connected to that same repository, named `axiom-engine` and `axiom-web`.

## 2. Configure `axiom-engine`

1. Set the service root directory to `apps/axiom-engine`.
2. Railway detects `railway.json` and builds the supplied Dockerfile.
3. Add a Railway Volume mounted at `/app/data`. This preserves AXI memory across deployments.
4. Configure a separately managed, access-controlled recovery destination
   outside `/app/data`. A second path on the same reset-prone storage does not
   establish independent recovery. Do not activate the scheduler until an
   authorized operator has created and verified a recovery bundle.
5. Add these service variables:

```dotenv
AXIOM_MEMORY_DIRECTORY=/app/data
AXIOM_BACKUP_DIRECTORY=<separate-recovery-location>
AXIOM_RECOVERY_RESTORE_DIRECTORY=<isolated-recovery-staging-location>
OPENAI_API_KEY=<set as a Railway secret>
OPENAI_MODEL=gpt-4.1-mini
AXIOM_MONITORING_ENABLED=true
AXIOM_MONITORING_POLL_INTERVAL_MS=60000
AXIOM_AUTOMATION_ENABLED=true
AXIOM_AUTOMATION_POLL_INTERVAL_MS=60000
AXIOM_AUTOMATION_MAX_TASKS_PER_CYCLE=5
```

6. Do not generate a public domain for this service.

Enable monitoring first and confirm its snapshots appear through the protected
console. Then enable the scheduler. The scheduler can process only the
versioned `memory.record`, `automation.noop`, `monitoring.snapshot`,
`governance.readiness`, `recovery.backup`, `coordinate.record`, and
`continuity.checkpoint`, `continuity.record`, `source.catalog`, and
`business.metric`, and `service.registry` allowlist;
it cannot deploy, access third-party
accounts, send messages, publish, or take other external action.

## 3. Configure `axiom-web`

1. Keep the source root at the repository root because the web image includes `docs/`.
2. In the Railway build settings, select **Dockerfile** and set its path to:

```text
apps/axiom-freedom/Dockerfile
```

3. Add this service variable, replacing the value with the private domain displayed by the `axiom-engine` service:

```dotenv
AXIOM_ENGINE_URL=http://<axiom-engine-private-domain>:3000
```

Railway private domains are available only between services in the same project. Do not use the engine's public domain or expose one.

4. Generate a Railway public domain for `axiom-web` and verify its `/health` endpoint before connecting the custom domain.

## 4. Connect `axescontracting.com`

1. In Railway, open the `axiom-web` service **Networking** settings and add
   both `axescontracting.com` and `www.axescontracting.com` as custom domains.
2. Railway displays a DNS record for each hostname. Record the current values
   before changing them, then use exactly the values Railway provides.
3. In SiteGround Site Tools, open **Domain** → **DNS Zone Editor** and replace
   the legacy web records for both hostnames with the Railway records. Do not
   leave either hostname pointed at a legacy host, and do not change unrelated
   email MX records.
4. Wait for Railway to issue TLS for both hostnames, then verify:

```text
https://axescontracting.com/health
https://www.axescontracting.com/health
```

If a user-facing `www.xiiom.com` URL is required, add it as an `axiom-web`
custom domain in Railway and set the exact matching DNS record. The current
deployment supports the `xiiom.com` apex only; do not point a `www` hostname at
an unrelated legacy host.

## 5. Production validation

After both services are deployed and the domain is active:

1. Open `https://axescontracting.com`. It now requires the same admin
   credentials as `/command-center` (HTTP Basic Auth against `ADMIN_PASSWORD`)
   and serves the private AXES Command Center, not public content.
2. After every engine restart, use the protected `/automation` console to
   confirm each enabled agent has the AXI Genesis checkpoint, creator
   ownership-and-accountability claim, operational origin, and active
   accountability status before processing any task.
3. Confirm the private engine recovery status is `ready`, verify the latest
   bundle, and run an isolated restore drill before treating a changed,
   replaced, or reset data volume as recoverable. Do not restore directly over
   `/app/data`.
4. Send a chat message through `/axiom`. If the response says `AXIOM chat is
   not configured`, add `OPENAI_API_KEY` only to the private `axiom-engine`
   encrypted variables, then redeploy that service.
5. Confirm the response is generated by AXIOM rather than a receipt message.
6. Capture a monitoring snapshot and confirm the scheduler heartbeat has no
   error.
7. Redeploy `axiom-engine`, then confirm its episodic memory and automation
   state survive using the mounted Railway Volume and independently verified
   recovery bundle.

## Credential handling

- Enter `OPENAI_API_KEY` only in Railway's encrypted service variables.
- Do not add it to GitHub Actions secrets, repository files, browser JavaScript, SiteGround files, logs, or chat.
- Rotate the key immediately if it is displayed, copied to a public system, or otherwise exposed.
