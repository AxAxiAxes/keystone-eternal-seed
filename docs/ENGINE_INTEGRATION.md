# AXIOM engine integration

`axiom-freedom` is the public web service. It forwards AXIOM commands to the private `axiom-engine` service; clients do not call the engine container directly.

## Configuration

| Variable | Used by | Default | Purpose |
| --- | --- | --- | --- |
| `AXIOM_ENGINE_URL` | `axiom-freedom` | `http://127.0.0.1:3000` | Base URL for the AXIOM engine. Compose sets it to `http://axiom-engine:3000`. |
| `PORT` | `axiom-engine` | `3000` | Engine listener port. |
| `AXIOM_PORT` | `axiom-freedom` | `8080` | Public web-service listener port. |

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

The public web service returns `400` for an invalid action and `502` when the engine is unreachable or fails to respond within five seconds.
