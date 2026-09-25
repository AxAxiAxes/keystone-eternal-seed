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

  const result = await service.reply("  Hello AXIOM  ");

  assert.equal(result.reply, "Hello from AXIOM.");
  assert.deepEqual(result.attachments, []);
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

test("injects the actual current date/time into the model instructions instead of relying on training data", async () => {
  const fixedNow = new Date("2026-09-16T08:00:00.000Z");
  let capturedInstructions;
  const service = new ChatService({
    apiKey: "test-key",
    model: "test-model",
    memoryStore: { async list() { return []; }, async record() {} },
    now: () => fixedNow,
    fetchImplementation: async (url, options) => {
      capturedInstructions = JSON.parse(options.body).instructions;
      return {
        ok: true,
        async json() {
          return {
            id: "response-test",
            output: [{
              type: "message",
              content: [{ type: "output_text", text: "It is currently 2026-09-16." }]
            }]
          };
        }
      };
    }
  });

  await service.reply("What is today's date?");

  assert.match(capturedInstructions, /2026-09-16T08:00:00\.000Z/);
  assert.match(capturedInstructions, /do not guess or rely on your training data/);
});

test("injects the AXIOM identity/creator prompt so the model does not claim OpenAI created it", async () => {
  let capturedInstructions;
  const service = new ChatService({
    apiKey: "test-key",
    model: "test-model",
    memoryStore: { async list() { return []; }, async record() {} },
    fetchImplementation: async (url, options) => {
      capturedInstructions = JSON.parse(options.body).instructions;
      return {
        ok: true,
        async json() {
          return {
            id: "response-test",
            output: [{
              type: "message",
              content: [{ type: "output_text", text: "I am AXIOM." }]
            }]
          };
        }
      };
    }
  });

  await service.reply("Who created you?");

  assert.match(capturedInstructions, /AXIOM/);
  assert.match(capturedInstructions, /Axel Urartu/);
  assert.match(capturedInstructions, /KEYSTONE Eternal Seed Architecture/);
  assert.match(capturedInstructions, /Never claim to be created by OpenAI/);
});

test("scopes conversation context and recorded turns to the given sessionId", async () => {
  const recordedEntries = [];
  let capturedListArgs;
  const memoryStore = {
    async list(...args) {
      capturedListArgs = args;
      return [];
    },
    async record(entry) {
      recordedEntries.push(entry);
    }
  };
  const service = new ChatService({
    apiKey: "test-key",
    model: "test-model",
    memoryStore,
    fetchImplementation: async () => ({
      ok: true,
      async json() {
        return {
          id: "response-test",
          output: [{
            type: "message",
            content: [{ type: "output_text", text: "Reply" }]
          }]
        };
      }
    })
  });

  await service.reply("Hi", { sessionId: "visitor-42" });

  assert.deepEqual(capturedListArgs, ["episodic", 10, { metadataFilter: { sessionId: "visitor-42" } }]);
  assert.equal(recordedEntries.length, 2);
  assert.equal(recordedEntries[0].metadata.sessionId, "visitor-42");
  assert.equal(recordedEntries[1].metadata.sessionId, "visitor-42");
});

test("includes verified attachment context in the provider request and returns honest attachment statuses", async () => {
  let capturedInput;
  const service = new ChatService({
    apiKey: "test-key",
    model: "test-model",
    memoryStore: { async list() { return []; }, async record() {} },
    sourceCatalogService: {
      validateChatAttachments(attachments) {
        return attachments;
      },
      async prepareChatAttachments() {
        return [
          {
            sourceReference: "uploads/a.txt",
            sha256: "a".repeat(64),
            size: 12,
            originalFilename: "notes.txt",
            mimeType: "text/plain",
            status: "processed",
            text: "hello world",
            detail: "Read this attachment for the current reply."
          },
          {
            sourceReference: "uploads/b.png",
            sha256: "b".repeat(64),
            size: 34,
            originalFilename: "photo.png",
            mimeType: "image/png",
            status: "failed",
            detail: "Attachment was stored, but AXI does not have a tested vision path in chat yet, so this image was not interpreted."
          }
        ];
      }
    },
    fetchImplementation: async (url, options) => {
      capturedInput = JSON.parse(options.body).input.at(-1).content;
      return {
        ok: true,
        async json() {
          return {
            id: "response-test",
            output: [{
              type: "message",
              content: [{ type: "output_text", text: "Attachment-aware reply" }]
            }]
          };
        }
      };
    }
  });

  const result = await service.reply("Please review these files", {
    attachments: [{ sourceReference: "uploads/a.txt" }, { sourceReference: "uploads/b.png" }]
  });

  assert.match(capturedInput, /Attachments for this message:/);
  assert.match(capturedInput, /notes\.txt/);
  assert.match(capturedInput, /hello world/);
  assert.match(capturedInput, /photo\.png/);
  assert.match(capturedInput, /not processed/);
  assert.equal(result.reply, "Attachment-aware reply");
  assert.deepEqual(result.attachments, [
    {
      sourceReference: "uploads/a.txt",
      sha256: "a".repeat(64),
      size: 12,
      originalFilename: "notes.txt",
      mimeType: "text/plain",
      status: "processed",
      detail: "Read this attachment for the current reply."
    },
    {
      sourceReference: "uploads/b.png",
      sha256: "b".repeat(64),
      size: 34,
      originalFilename: "photo.png",
      mimeType: "image/png",
      status: "failed",
      detail: "Attachment was stored, but AXI does not have a tested vision path in chat yet, so this image was not interpreted."
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
