const { AXIOM_IDENTITY_PROMPT } = require("./system-prompt");

class ChatService {
  constructor({
    apiKey,
    model,
    memoryStore,
    sourceCatalogService,
    usageStore,
    maxMessageCharacters = 4000,
    fetchImplementation = fetch,
    now = () => new Date()
  }) {
    this.apiKey = apiKey;
    this.model = model;
    this.memoryStore = memoryStore;
    this.sourceCatalogService = sourceCatalogService;
    this.usageStore = usageStore;
    this.maxMessageCharacters = maxMessageCharacters;
    this.fetchImplementation = fetchImplementation;
    this.now = now;
  }

  async reply(message, { agent, sessionId, attachments } = {}) {
    if (typeof message !== "string" || message.trim().length === 0) {
      throw new TypeError("message must be a non-empty string");
    }

    const normalizedMessage = message.trim();
    if (normalizedMessage.length > this.maxMessageCharacters) {
      throw new RangeError(
        `message must not exceed ${this.maxMessageCharacters} characters`
      );
    }
    const preparedAttachments = this.sourceCatalogService
      ? await this.sourceCatalogService.prepareChatAttachments(attachments)
      : [];
    if (!this.apiKey) {
      const error = new Error("OPENAI_API_KEY is not configured");
      error.statusCode = 503;
      throw error;
    }
    // Scope the "recent conversation" context to this caller's own session
    // when one is supplied, so one visitor's chat never leaks into another
    // visitor's context or history. A missing sessionId (e.g. internal
    // agent-to-agent calls that pass none) keeps the prior unscoped
    // behavior for backward compatibility.
    const recentEntries = await this.memoryStore.list(
      "episodic",
      10,
      sessionId ? { metadataFilter: { sessionId } } : undefined
    );
    const attachmentContext = formatAttachmentContext(preparedAttachments);
    const response = await this.fetchImplementation("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        instructions: [
          AXIOM_IDENTITY_PROMPT,
          `The current date and time is ${this.now().toISOString()}. Use this as the true current date/time -- do not guess or rely on your training data's cutoff for "today's date" or similar questions.`,
          "You maintain continuous timeline awareness: every chat turn is recorded into an ongoing, timestamped memory log the moment it happens, using this same live server clock -- not a fixed, cached, or remembered value from earlier in the conversation. If asked how you track time, dates, or memory, explain plainly that each reply is generated fresh with the real current server time, and that conversation turns are continuously logged with real timestamps, not replayed from a static script.",
          "Only claim to have read or interpreted an attachment when the supplied attachment context explicitly says it was processed for this reply. If an attachment is marked unreadable or failed, be honest that it was stored but not interpreted.",
          "Use the supplied recent conversation records only as context.",
          agent
            ? `You are acting as ${agent.name}. Your allowed capabilities are ${agent.capabilities.join(", ")}. Propose UI improvements for review only; do not claim to edit, deploy, access accounts, or execute changes.`
            : ""
        ].join(" "),
        input: [
          ...recentEntries.reverse().map((entry) => ({
            role: entry.metadata.role === "assistant" ? "assistant" : "user",
            content: entry.content
          })),
          {
            role: "user",
            content: attachmentContext
              ? `${normalizedMessage}\n\n${attachmentContext}`
              : normalizedMessage
          }
        ]
      })
    });

    if (!response.ok) {
      const error = new Error(`OpenAI returned HTTP ${response.status}`);
      error.statusCode = 502;
      throw error;
    }

    const payload = await response.json();
    const reply = extractOutputText(payload);
    if (!reply) {
      const error = new Error("OpenAI response did not contain output_text");
      error.statusCode = 502;
      throw error;
    }

    if (payload.usage && this.usageStore) {
      await this.usageStore.record({
        model: this.model,
        usage: payload.usage,
        responseId: payload.id
      });
    }

    await this.memoryStore.record({
      kind: "episodic",
      content: normalizedMessage,
      metadata: {
        role: "user",
        source: "chat",
        ...(sessionId ? { sessionId } : {}),
        ...(agent ? { agentId: agent.id } : {})
      }
    });
    await this.memoryStore.record({
      kind: "episodic",
      content: reply,
      metadata: {
        role: "assistant",
        source: "chat",
        model: this.model,
        ...(sessionId ? { sessionId } : {}),
        ...(agent ? { agentId: agent.id } : {})
      }
    });

    return {
      reply,
      attachments: preparedAttachments.map(({ text, ...attachment }) => attachment)
    };
  }
}

function formatAttachmentContext(attachments) {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return "";
  }

  const lines = ["Attachments for this message:"];
  for (const attachment of attachments) {
    if (attachment.status === "processed") {
      lines.push(
        `- ${attachment.originalFilename} (${attachment.mimeType || "unknown MIME type"}, ${attachment.size} bytes): processed for this reply.`,
        attachment.text.trim().length > 0
          ? `  Content:\n${indentMultiline(attachment.text.trim())}`
          : "  Content: [decoded text was empty]"
      );
      if (attachment.detail) {
        lines.push(`  Note: ${attachment.detail}`);
      }
      continue;
    }

    lines.push(
      `- ${attachment.originalFilename} (${attachment.mimeType || "unknown MIME type"}, ${attachment.size} bytes): not processed.`,
      `  Reason: ${attachment.detail}`
    );
  }
  return lines.join("\n");
}

function indentMultiline(text) {
  return String(text).split("\n").map((line) => `    ${line}`).join("\n");
}

function extractOutputText(payload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim().length > 0) {
    return payload.output_text.trim();
  }

  const text = payload.output
    ?.filter((item) => item.type === "message")
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text)
    .filter((content) => typeof content === "string" && content.trim().length > 0)
    .join("\n")
    .trim();

  return text || null;
}

module.exports = { ChatService, extractOutputText };
