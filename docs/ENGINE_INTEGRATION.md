# AXIOM engine integration

`axiom-freedom` is the public web service. It forwards AXIOM commands to the private `axiom-engine` service; clients do not call the engine container directly.

## Configuration

| Variable | Used by | Default | Purpose |
| --- | --- | --- | --- |
| `AXIOM_ENGINE_URL` | `axiom-freedom` | `http://127.0.0.1:3000` | Base URL for the AXIOM engine. Compose sets it to `http://axiom-engine:3000`. |
| `PORT` | `axiom-engine` | `3000` | Engine listener port. |
| `AXIOM_PORT` | `axiom-freedom` | `8080` | Public web-service listener port. |
| `AXIOM_CHAT_MAX_MESSAGE_CHARACTERS` | `axiom-engine` | `4000` | Maximum characters accepted per OpenAI chat request. |
| `AXIOM_AUTOMATION_ENABLED` | `axiom-engine` | `false` | Enables the private, allowlisted task scheduler. |
| `AXIOM_AUTOMATION_POLL_INTERVAL_MS` | `axiom-engine` | `60000` | Scheduler interval, from 1,000 to 3,600,000 milliseconds. |
| `AXIOM_AUTOMATION_MAX_TASKS_PER_CYCLE` | `axiom-engine` | `5` | Maximum due tasks processed each scheduler cycle, from 1 to 20. |
| `AXIOM_MONITORING_ENABLED` | `axiom-engine` | `false` | Enables private operational monitoring snapshots. |
| `AXIOM_MONITORING_POLL_INTERVAL_MS` | `axiom-engine` | `60000` | Monitoring interval, from 1,000 to 3,600,000 milliseconds. |

## Command contract

Send a `POST` request to `axiom-freedom` at `/api/axiom`.

```json
{
  "action": "analyze",
  "payload": {
    "requestId": "example-123"
  }
}
```

`action` must be a non-empty string. `payload` is optional JSON supplied unchanged to the engine. On success, the web service returns the engine's response:

```json
{
  "engine": "AXIOM",
  "actionReceived": "analyze",
  "payloadReceived": {
    "requestId": "example-123"
  },
  "status": "processed"
}
```

The public web service returns `400` for an invalid action and `502` when the engine is unreachable or fails to respond within 60 seconds.

## OpenAI chat provider

Set these values only in the local `apps/axiom-freedom/.env` file or a deployment secret store:

```dotenv
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4.1-mini
```

The browser chat uses `action: "chat"` with `payload.message`. The engine sends the message and up to ten recent episodic records to OpenAI's Responses API, then appends the user message and provider reply to its private episodic memory store. Without `OPENAI_API_KEY`, chat returns `503` and no provider request is made.

## Provider usage monitoring

After each successful OpenAI response, the engine appends the provider-reported
input, output, and total token counts to its private persistent storage. It does
not persist API keys or prompt text in this usage record.

Use the private engine endpoint `GET /usage` from the Docker network or trusted
administrative environment to read cumulative counts:

```json
{
  "requests": 12,
  "inputTokens": 3456,
  "outputTokens": 789,
  "totalTokens": 4245
}
```

The public portal does not proxy this endpoint. Token counts are not a billing
statement; review the OpenAI billing dashboard for current prices, invoices,
credits, or recharge settings.

## Private runtime readiness

Use the private engine endpoint `GET /system/readiness` to distinguish engine
storage readiness from the deliberate status of the chat provider, scheduler,
and monitoring. It returns no API key, prompt, memory content, or account
information. The authenticated AXES Support Desk includes the same result in
its read-only status response.

```json
{
  "status": "ready",
  "storage": { "status": "ok" },
  "provider": { "status": "configured", "model": "gpt-4.1-mini" },
  "automation": { "status": "enabled", "lastRunAt": "2026-09-10T00:00:00.000Z", "lastError": null },
  "monitoring": { "status": "enabled" },
  "governance": {
    "status": "ready",
    "genesisCheckpoint": {
      "id": "axi-genesis-creator-ownership",
      "sourceRecord": "KEYSTONE-ORIGIN-000001"
    },
    "enabledAgents": 4,
    "activeAgents": 4,
    "issues": []
  }
}
```

`governance` is a secret-safe internal readiness result. It reports whether
enabled agents have the canonical Genesis registration and active
accountability, whether their capabilities remain allowlisted, and whether any
tasks are blocked or failed. It does not determine external ownership, legal
rights, value, or recovery.
