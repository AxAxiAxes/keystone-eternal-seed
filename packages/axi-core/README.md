# AXI.Core

AXI.Core is the .NET 8 domain-contract library for AXIOM services.

## Public API

- `AxiomCommand` represents an action and its JSON payload.
- `AxiomCommandResult` captures the engine name, action, payload, and execution status.
- `IAxiomCommandHandler` is the asynchronous integration seam for hosts and transports.
- `EchoAxiomCommandHandler` is the baseline handler that returns a processed result, mirroring the current AXIOM engine response model.

The library is transport-neutral: web endpoints, deployment infrastructure, and configuration remain in application projects.
