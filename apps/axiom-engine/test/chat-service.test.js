const assert = require("node:assert/strict");
const test = require("node:test");
const { ChatService } = require("../chat-service");

test("generates a reply and records both chat turns", async () => {
  const entries = [];
  const memoryStore = {
    async list() {
      return [{ content: "Earlier context", metadata: { role: "user" } }];
    },
    async record(entry) {
      entries.push(entry);
    }
  };
  const service = new ChatService({
    apiKey: "test-key",
    model: "test-model",
    memoryStore,
    fetchImplementation: async (url, options) => {
      assert.equal(url, "https://api.openai.com/v1/responses");
      assert.equal(options.headers.Authorization, "Bearer test-key");
      const request = JSON.parse(options.body);
      assert.equal(request.model, "test-model");
      assert.deepEqual(request.input, [
        { role: "user", content: "Earlier context" },
        { role: "user", content: "Hello AXIOM" }
      ]);
      return {
        ok: true,
        async json() {
          return {
            output: [{
              type: "message",
              content: [{ type: "output_text", text: "Hello from AXIOM." }]
            }]
          };
        }
      };
    }
  });

  const reply = await service.reply("  Hello AXIOM  ");

  assert.equal(reply, "Hello from AXIOM.");
  assert.deepEqual(entries, [
    {
      kind: "episodic",
      content: "Hello AXIOM",
      metadata: { role: "user", source: "chat" }
    },
    {
      kind: "episodic",
      content: "Hello from AXIOM.",
      metadata: { role: "assistant", source: "chat", model: "test-model" }
    }
  ]);
});

test("rejects chat when no provider key is configured", async () => {
  const service = new ChatService({
    apiKey: "",
    model: "test-model",
    memoryStore: {}
  });

  await assert.rejects(
    () => service.reply("Hello AXIOM"),
    (error) => error.statusCode === 503 && error.message === "OPENAI_API_KEY is not configured"
  );
});
