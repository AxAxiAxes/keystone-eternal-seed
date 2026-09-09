using System.Text.Json;

namespace AXI.Core;

public sealed record AxiomCommandResult(
    string EngineName,
    string Action,
    JsonElement Payload,
    AxiomCommandStatus Status)
{
    public static AxiomCommandResult Processed(AxiomCommand command, string engineName)
    {
        ArgumentNullException.ThrowIfNull(command);
        ArgumentException.ThrowIfNullOrWhiteSpace(engineName);

        return new AxiomCommandResult(
            engineName.Trim(),
            command.Action,
            command.Payload.Clone(),
            AxiomCommandStatus.Processed);
    }
}
