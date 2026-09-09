const assert = require("node:assert/strict");
const test = require("node:test");
const { ChatService } = require("../chat-service");

test("generates a reply and records both chat turns", async () => {
  const entries = [];
  const usageEntries = [];
  const memoryStore = {
    async list() {
      return [{ content: "Earlier context", metadata: { role: "user" } }];
    },
    async record(entry) {
      entries.push(entry);
    }
  };
  const usageStore = {
    async record(entry) {
      usageEntries.push(entry);
    }
  };
  const service = new ChatService({
    apiKey: "test-key",
    model: "test-model",
    memoryStore,
    usageStore,
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
            id: "response-test",
            usage: {
              input_tokens: 12,
              output_tokens: 4,
              total_tokens: 16
            },
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
  assert.deepEqual(usageEntries, [{
    model: "test-model",
    usage: {
      input_tokens: 12,
      output_tokens: 4,
      total_tokens: 16
    },
    responseId: "response-test"
  }]);
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

test("rejects oversized chat messages before contacting the provider", async () => {
  const service = new ChatService({
    apiKey: "test-key",
    model: "test-model",
    memoryStore: { async list() { return []; } },
    maxMessageCharacters: 3,
    fetchImplementation: async () => {
      throw new Error("provider should not be called");
    }
  });

  await assert.rejects(
    () => service.reply("four"),
    (error) => error instanceof RangeError &&
      error.message === "message must not exceed 3 characters"
  );
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
