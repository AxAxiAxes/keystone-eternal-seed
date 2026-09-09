class ChatService {
  constructor({ apiKey, model, memoryStore, fetchImplementation = fetch }) {
    this.apiKey = apiKey;
    this.model = model;
    this.memoryStore = memoryStore;
    this.fetchImplementation = fetchImplementation;
  }

  async reply(message) {
    if (!this.apiKey) {
      const error = new Error("OPENAI_API_KEY is not configured");
      error.statusCode = 503;
      throw error;
    }
    if (typeof message !== "string" || message.trim().length === 0) {
      throw new TypeError("message must be a non-empty string");
    }

    const normalizedMessage = message.trim();
    const recentEntries = await this.memoryStore.list("episodic", 10);
    const response = await this.fetchImplementation("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        instructions: [
          "You are AXIOM, the public AXIOM / KEYSTONE assistant for Axes Contracting.",
          "Be helpful, truthful, concise, and do not claim capabilities you do not have.",
          "Use the supplied recent conversation records only as context."
        ].join(" "),
        input: [
          ...recentEntries.reverse().map((entry) => ({
            role: entry.metadata.role === "assistant" ? "assistant" : "user",
            content: entry.content
          })),
          { role: "user", content: normalizedMessage }
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

    await this.memoryStore.record({
      kind: "episodic",
      content: normalizedMessage,
      metadata: { role: "user", source: "chat" }
    });
    await this.memoryStore.record({
      kind: "episodic",
      content: reply,
      metadata: { role: "assistant", source: "chat", model: this.model }
    });

    return reply;
  }
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
