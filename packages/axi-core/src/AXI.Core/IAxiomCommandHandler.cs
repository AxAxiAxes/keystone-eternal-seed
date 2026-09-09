namespace AXI.Core;

public interface IAxiomCommandHandler
{
    ValueTask<AxiomCommandResult> HandleAsync(
        AxiomCommand command,
        CancellationToken cancellationToken = default);
}
