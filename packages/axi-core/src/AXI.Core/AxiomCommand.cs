using System.Text.Json;

namespace AXI.Core;

public sealed record AxiomCommand
{
    public AxiomCommand(string action, JsonElement payload)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(action);

        Action = action.Trim();
        Payload = payload.Clone();
    }

    public string Action { get; }

    public JsonElement Payload { get; }
}
