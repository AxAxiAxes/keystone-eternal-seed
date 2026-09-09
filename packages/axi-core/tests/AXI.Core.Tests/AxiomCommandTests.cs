using System.Text.Json;

namespace AXI.Core.Tests;

public sealed class AxiomCommandTests
{
    [Fact]
    public void Constructor_TrimsActionAndClonesPayload()
    {
        using var document = JsonDocument.Parse("""{"value":"test"}""");

        var command = new AxiomCommand("  summarize  ", document.RootElement);

        Assert.Equal("summarize", command.Action);
        Assert.Equal("test", command.Payload.GetProperty("value").GetString());
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    public void Constructor_RejectsBlankActions(string action)
    {
        using var document = JsonDocument.Parse("{}");

        Assert.Throws<ArgumentException>(() => new AxiomCommand(action, document.RootElement));
    }
}
