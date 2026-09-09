# AXIOM engine integration

`axiom-freedom` is the public web service. It forwards AXIOM commands to the private `axiom-engine` service; clients do not call the engine container directly.

## Configuration

| Variable | Used by | Default | Purpose |
| --- | --- | --- | --- |
| `AXIOM_ENGINE_URL` | `axiom-freedom` | `http://127.0.0.1:3000` | Base URL for the AXIOM engine. Compose sets it to `http://axiom-engine:3000`. |
| `PORT` | `axiom-engine` | `3000` | Engine listener port. |
| `AXIOM_PORT` | `axiom-freedom` | `8080` | Public web-service listener port. |
| `AXIOM_CHAT_MAX_MESSAGE_CHARACTERS` | `axiom-engine` | `4000` | Maximum characters accepted per OpenAI chat request. |

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
