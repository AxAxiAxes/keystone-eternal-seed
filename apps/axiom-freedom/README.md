# AXIOM / KEYSTONE public portal

The public web service for the AXIOM command interface and the AXIOM / KEYSTONE document library.

## Local development

With Docker Desktop running, start the portal and its internal AXIOM engine:

```bash
cp .env.example .env
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

Open <http://localhost:8080>. The engine remains private to the Compose network.

Stop the local services when finished:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

## Activate OpenAI chat

Run the activation script from PowerShell. It prompts for the API key without echoing it, writes it only to the Git-ignored `.env` file, then rebuilds the local services:

```powershell
.\scripts\activate-openai-chat.ps1
```

The key remains local to this computer and is never written to source-controlled files.
