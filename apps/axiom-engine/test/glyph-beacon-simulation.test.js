const assert = require("node:assert/strict");
const test = require("node:test");

const { createGlyphBeaconSimulation } = require("../glyph-beacon-simulation");

const NOW = 1_800_000_000_000;

function basePayload(overrides = {}) {
  return {
    version: "v1",
    consent: true,
    discoveryId: "disc_12345678",
    nonce: "nonce_12345678",
    issuedAtMs: NOW,
    glyph: "AX",
    signalRole: "receiver",
    ...overrides
  };
}

test("rejects ambiguous and unknown glyph values", () => {
  const simulation = createGlyphBeaconSimulation({ now: () => NOW });

  const ambiguous = simulation.evaluateDiscovery(basePayload({ glyph: "AX?" }));
  assert.equal(ambiguous.accepted, false);
  assert.equal(ambiguous.reason, "ambiguous-glyph");

  const unknown = simulation.evaluateDiscovery(basePayload({ nonce: "nonce_87654321", glyph: "ZZ" }));
  assert.equal(unknown.accepted, false);
  assert.equal(unknown.reason, "unknown-glyph");
});

test("handles deterministic state transitions and never grants authority", () => {
  const simulation = createGlyphBeaconSimulation({ now: () => NOW });

  const first = simulation.evaluateDiscovery(basePayload());
  const second = simulation.evaluateDiscovery(basePayload({ nonce: "nonce_87654321" }));

  assert.equal(first.accepted, true);
  assert.equal(first.state.previous, "idle");
  assert.equal(first.state.current, "observed");
  assert.equal(first.authority.granted, false);

  assert.equal(second.accepted, true);
  assert.equal(second.state.previous, "observed");
  assert.equal(second.state.current, "matched");
  assert.equal(simulation.getState({ discoveryId: "disc_12345678", signalRole: "receiver" }), "matched");
});

test("rejects invalid, replayed, and expired discovery payloads", () => {
  const simulation = createGlyphBeaconSimulation({ now: () => NOW, ttlMs: 5_000 });

  const invalidId = simulation.evaluateDiscovery(basePayload({ discoveryId: "short" }));
  assert.equal(invalidId.reason, "invalid-discovery-id");

  const accepted = simulation.evaluateDiscovery(basePayload());
  assert.equal(accepted.accepted, true);

  const replay = simulation.evaluateDiscovery(basePayload());
  assert.equal(replay.reason, "replayed-discovery");

  const expired = simulation.evaluateDiscovery(
    basePayload({ nonce: "nonce_87654321", issuedAtMs: NOW - 10_000 })
  );
  assert.equal(expired.reason, "expired-discovery");
});

test("rejects unsupported versions", () => {
  const simulation = createGlyphBeaconSimulation({ now: () => NOW });
  const result = simulation.evaluateDiscovery(basePayload({ version: "v2" }));
  assert.equal(result.accepted, false);
  assert.equal(result.reason, "unsupported-version");
});

test("requires explicit consent and honors opt-out", () => {
  const simulation = createGlyphBeaconSimulation({ now: () => NOW });
  const result = simulation.evaluateDiscovery(basePayload({ consent: false }));

  assert.equal(result.accepted, false);
  assert.equal(result.reason, "consent-required");
  assert.equal(result.consent.required, true);
  assert.equal(result.consent.provided, false);
  assert.equal(result.consent.optOutHonored, true);
  assert.equal(result.authority.granted, false);
});
