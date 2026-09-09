const express = require("express");
const path = require("path");
const { ENTRY_KINDS, MemoryStore } = require("./memory-store");
const app = express();
const memoryStore = new MemoryStore(
  process.env.AXIOM_MEMORY_DIRECTORY || path.join(__dirname, "data")
);

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "AXIOM engine online" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "AXIOM engine" });
});

app.get("/memory/identity", async (req, res, next) => {
  try {
    const identity = await memoryStore.readIdentity();
    if (!identity) {
      res.status(404).json({ error: "AXIOM identity has not been initialized" });
      return;
    }
    res.json(identity);
  } catch (error) {
    next(error);
  }
});

app.put("/memory/identity", async (req, res, next) => {
  try {
    res.status(201).json(await memoryStore.writeIdentity(req.body));
  } catch (error) {
    next(error);
  }
});

app.get("/memory/:kind", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 50 : Number(req.query.limit);
    res.json(await memoryStore.list(req.params.kind, limit));
  } catch (error) {
    next(error);
  }
});

app.post("/memory/:kind", async (req, res, next) => {
  try {
    res.status(201).json(await memoryStore.record({
      kind: req.params.kind,
      content: req.body.content,
      metadata: req.body.metadata
    }));
  } catch (error) {
    next(error);
  }
});

// Core automation route
app.post("/axiom", (req, res) => {
  const { action, payload } = req.body;

  res.json({
    engine: "AXIOM",
    actionReceived: action,
    payloadReceived: payload,
    status: "processed"
  });
});

app.use((error, req, res, next) => {
  if (error instanceof TypeError || error instanceof RangeError) {
    res.status(400).json({ error: error.message });
    return;
  }
  next(error);
});

if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => {
    console.log("AXIOM engine running");
  });
}

module.exports = app;
