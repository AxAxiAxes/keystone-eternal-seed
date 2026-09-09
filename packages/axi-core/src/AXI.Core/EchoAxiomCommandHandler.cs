namespace AXI.Core;

public sealed class EchoAxiomCommandHandler : IAxiomCommandHandler
{
    private readonly string _engineName;

    public EchoAxiomCommandHandler(string engineName = "AXIOM")
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(engineName);

        _engineName = engineName.Trim();
    }

    public ValueTask<AxiomCommandResult> HandleAsync(
        AxiomCommand command,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return ValueTask.FromResult(AxiomCommandResult.Processed(command, _engineName));
    }
}
