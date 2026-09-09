using System.Text.Json;

namespace AXI.Core.Tests;

public sealed class EchoAxiomCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_ReturnsProcessedResultForCommand()
    {
        using var document = JsonDocument.Parse("""{"requestId":"123"}""");
        var handler = new EchoAxiomCommandHandler();
        var command = new AxiomCommand("analyze", document.RootElement);

        var result = await handler.HandleAsync(command);

        Assert.Equal("AXIOM", result.EngineName);
        Assert.Equal("analyze", result.Action);
        Assert.Equal(AxiomCommandStatus.Processed, result.Status);
        Assert.Equal("123", result.Payload.GetProperty("requestId").GetString());
    }

    [Fact]
    public async Task HandleAsync_HonorsCancellation()
    {
        using var document = JsonDocument.Parse("{}");
        using var cancellationSource = new CancellationTokenSource();
        cancellationSource.Cancel();

        var handler = new EchoAxiomCommandHandler();
        var command = new AxiomCommand("analyze", document.RootElement);

        await Assert.ThrowsAsync<OperationCanceledException>(
            async () => await handler.HandleAsync(command, cancellationSource.Token));
    }
}
