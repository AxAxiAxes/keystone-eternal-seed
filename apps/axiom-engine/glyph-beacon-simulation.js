const SUPPORTED_VERSION = "v1";
const VALID_SIGNAL_ROLES = new Set(["emitter", "receiver"]);
const SUPPORTED_GLYPHS = new Set(["AX", "UX", "UR", "AU", "XAX"]);
const AMBIGUOUS_GLYPHS = new Set(["A", "U", "R", "X", "AX?", "UX?", "UR?", "AU?", "XAX?"]);
const STATE_TRANSITIONS = {
  idle: {
    AX: "observed",
    UX: "observed",
    UR: "observed",
    AU: "observed",
    XAX: "observed"
  },
  observed: {
    AX: "matched",
    UX: "matched",
    UR: "matched",
    AU: "matched",
    XAX: "matched"
  },
  matched: {
    AX: "confirmed",
    UX: "confirmed",
    UR: "confirmed",
    AU: "confirmed",
    XAX: "confirmed"
  },
  confirmed: {
    AX: "archived",
    UX: "archived",
    UR: "archived",
    AU: "archived",
    XAX: "archived"
  },
  archived: {
    AX: "archived",
    UX: "archived",
    UR: "archived",
    AU: "archived",
    XAX: "archived"
  }
};

function createGlyphBeaconSimulation({ now = () => Date.now(), ttlMs = 30_000 } = {}) {
  if (!Number.isInteger(ttlMs) || ttlMs < 1) {
    throw new TypeError("ttlMs must be a positive integer");
  }
  const seenNoncesByDiscoveryId = new Map();
  const stateBySessionKey = new Map();

  function evaluateDiscovery(input) {
    if (!isRecord(input)) {
      return rejected("invalid-input", "Discovery payload must be an object.");
    }

    if (input.consent !== true) {
      return rejected("consent-required", "Consent is required and opt-out is honored.", {
        consent: { required: true, provided: false, optOutHonored: true }
      });
    }

    if (input.version !== SUPPORTED_VERSION) {
      return rejected("unsupported-version", `Only ${SUPPORTED_VERSION} is supported in this simulation.`, {
        version: input.version
      });
    }

    if (!VALID_SIGNAL_ROLES.has(input.signalRole)) {
      return rejected("invalid-signal-role", "signalRole must be emitter or receiver.");
    }

    if (!isOpaqueId(input.discoveryId)) {
      return rejected("invalid-discovery-id", "discoveryId must be a short-lived opaque identifier.");
    }

    if (!isOpaqueId(input.nonce)) {
      return rejected("invalid-nonce", "nonce must be an opaque identifier.");
    }

    if (!Number.isInteger(input.issuedAtMs)) {
      return rejected("invalid-issued-at", "issuedAtMs must be an integer unix timestamp in milliseconds.");
    }

    const nowMs = now();
    if (!Number.isFinite(nowMs)) {
      return rejected("invalid-clock", "Simulation clock returned a non-finite timestamp.");
    }

    if (input.issuedAtMs > nowMs) {
      return rejected("invalid-issued-at", "issuedAtMs cannot be in the future.");
    }

    if (nowMs - input.issuedAtMs > ttlMs) {
      return rejected("expired-discovery", "Discovery payload expired before evaluation.", {
        security: { ttlMs, replayProtected: true }
      });
    }

    const nonceSet = seenNoncesByDiscoveryId.get(input.discoveryId) || new Set();
    if (nonceSet.has(input.nonce)) {
      return rejected("replayed-discovery", "Nonce was already observed for this discovery identifier.", {
        security: { ttlMs, replayProtected: true }
      });
    }

    const glyph = normalizeGlyph(input.glyph);
    if (!glyph) {
      return rejected("invalid-glyph", "glyph must be a non-empty string.");
    }

    if (AMBIGUOUS_GLYPHS.has(glyph)) {
      return rejected("ambiguous-glyph", "Ambiguous glyph values are rejected.");
    }

    if (!SUPPORTED_GLYPHS.has(glyph)) {
      return rejected("unknown-glyph", "Unknown glyph values are rejected.");
    }

    nonceSet.add(input.nonce);
    seenNoncesByDiscoveryId.set(input.discoveryId, nonceSet);

    const sessionKey = `${input.discoveryId}:${input.signalRole}`;
    const previousState = stateBySessionKey.get(sessionKey) || "idle";
    const currentState = transition(previousState, glyph);
    stateBySessionKey.set(sessionKey, currentState);

    return {
      accepted: true,
      reason: "accepted",
      classification: "proposal-only-demo",
      version: SUPPORTED_VERSION,
      state: {
        previous: previousState,
        current: currentState,
        glyph,
        signalRole: input.signalRole
      },
      consent: {
        required: true,
        provided: true,
        optOutHonored: true
      },
      security: {
        ttlMs,
        replayProtected: true
      },
      authority: {
        granted: false,
        reason: "Discovery and glyph processing never grants authority, identity, rights, or ownership."
      }
    };
  }

  function getState({ discoveryId, signalRole }) {
    if (!isOpaqueId(discoveryId) || !VALID_SIGNAL_ROLES.has(signalRole)) {
      return null;
    }
    return stateBySessionKey.get(`${discoveryId}:${signalRole}`) || null;
  }

  return {
    evaluateDiscovery,
    getState,
    supportedVersion: SUPPORTED_VERSION,
    supportedGlyphs: [...SUPPORTED_GLYPHS]
  };
}

function transition(previousState, glyph) {
  const transitions = STATE_TRANSITIONS[previousState];
  if (!transitions) {
    return "rejected";
  }
  return transitions[glyph] || "rejected";
}

function rejected(reason, detail, extra = {}) {
  return {
    accepted: false,
    reason,
    detail,
    classification: "proposal-only-demo",
    authority: {
      granted: false,
      reason: "Discovery and glyph processing never grants authority, identity, rights, or ownership."
    },
    ...extra
  };
}

function normalizeGlyph(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().toUpperCase();
}

function isOpaqueId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{8,64}$/.test(value);
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

module.exports = {
  SUPPORTED_VERSION,
  createGlyphBeaconSimulation
};
