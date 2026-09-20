# Private Copilot Library archive workflow

Raw Copilot Library exports, chats, and unreviewed application artifacts must remain private. They can contain personal information, credentials, client data, or other material that is unsuitable for the public AXIOM / KEYSTONE repository.

## Archive an export

1. In Copilot Library, download or export the selected application, document, or chat material to a local folder.
2. From the repository root, run:

```powershell
.\scripts\import-copilot-library.ps1 -SourcePath "C:\path\to\copilot-library-export"
```

3. The script copies the export to `private-archive/copilot-library/<timestamp>/` and creates `manifest.sha256.json` with an SHA-256 checksum for every archived file.

`private-archive/` is ignored by Git. Do not force-add it.

## Create a public record only when needed

Review each artifact before public publication. Publish only the minimum safe material:

- A concise project decision or milestone summary goes in `docs/memory/`.
- A reviewed technical specification goes in `docs/`.
- A source artifact intended for public release goes in its relevant application, package, patent, or KEYSTONE directory.

Never publish raw chat transcripts, API keys, passwords, account exports, customer details, or unreviewed Copilot Library downloads.
