const express = require("express");
const path = require("path");
const { ChatService } = require("./chat-service");
const { MemoryStore } = require("./memory-store");
const { UsageStore } = require("./usage-store");
const { CheckpointService } = require("./checkpoint-service");
const { MonitoringService } = require("./monitoring-service");
const {
  AutomationService,
  startAutomationScheduler
} = require("./automation-service");
const app = express();
const memoryStore = new MemoryStore(
  process.env.AXIOM_MEMORY_DIRECTORY || path.join(__dirname, "data")
);
const usageStore = new UsageStore(
  process.env.AXIOM_MEMORY_DIRECTORY || path.join(__dirname, "data")
);
const automationService = new AutomationService({
  directory: process.env.AXIOM_MEMORY_DIRECTORY || path.join(__dirname, "data"),
  memoryStore
});
const checkpointService = new CheckpointService({
  directory: process.env.AXIOM_MEMORY_DIRECTORY || path.join(__dirname, "data"),
  modules: [
    { id: "memory", version: "1" },
    { id: "usage", version: "1" },
    { id: "automation", version: "1" },
    { id: "chat", version: "1" },
    { id: "monitoring", version: "1" },
    { id: "checkpoint", version: "1" }
  ]
});
const scheduler = {
  enabled: process.env.AXIOM_AUTOMATION_ENABLED === "true",
  lastRunAt: null,
  lastError: null
};
const monitoringService = new MonitoringService({
  directory: process.env.AXIOM_MEMORY_DIRECTORY || path.join(__dirname, "data"),
  memoryStore
});
const chatService = new ChatService({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  memoryStore,
  usageStore,
  maxMessageCharacters: Number(
    process.env.AXIOM_CHAT_MAX_MESSAGE_CHARACTERS || 4000
  )
});

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "AXIOM engine online" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "AXIOM engine" });
});

app.get("/usage", async (req, res, next) => {
  try {
    res.json(await usageStore.summary());
  } catch (error) {
    next(error);
  }
});

async function captureMonitoringSnapshot() {
  await memoryStore.list("decision", 1);
  const [automation, usage] = await Promise.all([
    automationService.status(),
    usageStore.summary()
  ]);
  return monitoringService.record({
    memoryAvailable: true,
    scheduler: { ...scheduler },
    automation,
    usage
  });
}

app.get("/monitoring/status", async (req, res, next) => {
  try {
    res.json(await monitoringService.status());
  } catch (error) {
    next(error);
  }
});

app.get("/monitoring/history", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    res.json(await monitoringService.history(limit));
  } catch (error) {
    next(error);
  }
});

app.post("/monitoring/snapshots", async (req, res, next) => {
  try {
    res.status(201).json(await captureMonitoringSnapshot());
  } catch (error) {
    next(error);
  }
});

app.get("/system/checkpoints", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    res.json(await checkpointService.list(limit));
  } catch (error) {
    next(error);
  }
});

app.post("/system/checkpoints", async (req, res, next) => {
  try {
    res.status(201).json(await checkpointService.create());
  } catch (error) {
    next(error);
  }
});

app.get("/automation/status", async (req, res, next) => {
  try {
    res.json(await automationService.status());
  } catch (error) {
    next(error);
  }
});

app.get("/automation/agents", async (req, res, next) => {
  try {
    res.json(await automationService.listAgents());
  } catch (error) {
    next(error);
  }
});

app.post("/automation/agents", async (req, res, next) => {
  try {
    res.status(201).json(await automationService.registerAgent(req.body));
  } catch (error) {
    next(error);
  }
});

app.get("/automation/tasks", async (req, res, next) => {
  try {
    res.json(await automationService.listTasks(req.query.status));
  } catch (error) {
    next(error);
  }
});

app.post("/automation/tasks", async (req, res, next) => {
  try {
    res.status(201).json(await automationService.createTask(req.body));
  } catch (error) {
    next(error);
  }
});

app.post("/automation/tasks/:taskId/approval", async (req, res, next) => {
  try {
    res.json(await automationService.reviewTaskApproval(
      req.params.taskId,
      req.body.approved
    ));
  } catch (error) {
    next(error);
  }
});

app.post("/automation/process", async (req, res, next) => {
  try {
    const maxTasks = req.body.maxTasks === undefined ? 5 : Number(req.body.maxTasks);
    res.json(await automationService.processDueTasks(maxTasks));
  } catch (error) {
    next(error);
  }
});

app.post("/automation/chat", async (req, res, next) => {
  try {
    const agent = await automationService.getAgent(req.body.agentId);
    const reply = await chatService.reply(req.body.message, { agent });
    res.json({ agent: { id: agent.id, name: agent.name }, reply });
  } catch (error) {
    next(error);
  }
});

app.get("/automation/runs", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 50 : Number(req.query.limit);
    res.json(await automationService.listRuns(limit));
  } catch (error) {
    next(error);
  }
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
app.post("/axiom", async (req, res, next) => {
  const { action, payload } = req.body;

  try {
    if (action === "chat") {
      const reply = await chatService.reply(payload?.message);
      res.json({
        engine: "AXIOM",
        actionReceived: action,
        reply,
        status: "processed"
      });
      return;
    }

  res.json({
    engine: "AXIOM",
    actionReceived: action,
    payloadReceived: payload,
    status: "processed"
  });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (
    error instanceof TypeError ||
    error instanceof RangeError ||
    Number.isInteger(error.statusCode)
  ) {
    res.status(error.statusCode || 400).json({ error: error.message });
    return;
  }
  next(error);
});

if (require.main === module) {
  if (process.env.AXIOM_AUTOMATION_ENABLED === "true") {
    startAutomationScheduler(automationService, {
      pollIntervalMs: Number(process.env.AXIOM_AUTOMATION_POLL_INTERVAL_MS || 60_000),
      maxTasks: Number(process.env.AXIOM_AUTOMATION_MAX_TASKS_PER_CYCLE || 5),
      onCycle: ({ error }) => {
        scheduler.lastRunAt = new Date().toISOString();
        scheduler.lastError = error ? error.message : null;
      }
    });
  }
  if (process.env.AXIOM_MONITORING_ENABLED === "true") {
    const intervalMs = Number(process.env.AXIOM_MONITORING_POLL_INTERVAL_MS || 60_000);
    if (!Number.isInteger(intervalMs) || intervalMs < 1_000 || intervalMs > 3_600_000) {
      throw new RangeError("AXIOM_MONITORING_POLL_INTERVAL_MS must be from 1000 to 3600000");
    }
    captureMonitoringSnapshot().catch((error) => console.error("AXIOM monitoring failed:", error));
    setInterval(() => {
      captureMonitoringSnapshot().catch((error) => console.error("AXIOM monitoring failed:", error));
    }, intervalMs);
  }
  app.listen(process.env.PORT || 3000, () => {
    console.log("AXIOM engine running");
  });
}

module.exports = app;
