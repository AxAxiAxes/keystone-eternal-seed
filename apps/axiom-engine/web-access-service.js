// Bounded, read-only web-fetch capability for AXI. Off by default: reports
// "not enabled" (and refuses every fetch) unless an authorized operator has
// set AXIOM_WEB_ACCESS_ENABLED=true out-of-band. This is deliberately NOT a
// browser: it fetches exactly one URL server-side and returns sanitized
// text, with no navigation, clicking, JavaScript execution, cookies, or
// stored credentials. Every route that reaches this service is admin-gated
// at the HTTP layer (apps/axiom-engine/index.js). A safe-fetch policy
// (protocol allowlist, private/loopback/link-local address block, no
// redirects, size cap, timeout) guards against the service being used to
// probe or reach internal infrastructure (SSRF).
const dns = require("dns/promises");
const net = require("net");

const DEFAULT_MAX_BYTES = 512 * 1024; // 512 KB is enough for a page summary, not a large download
const DEFAULT_TIMEOUT_MS = 10000;

class WebAccessService {
  constructor({
    enabled,
    fetchImplementation = fetch,
    resolveHostname = defaultResolveHostname,
    maxBytes = DEFAULT_MAX_BYTES,
    timeoutMs = DEFAULT_TIMEOUT_MS
  } = {}) {
    this.enabled = Boolean(enabled);
    this.fetchImplementation = fetchImplementation;
    this.resolveHostname = resolveHostname;
    this.maxBytes = maxBytes;
    this.timeoutMs = timeoutMs;
  }

  status() {
    return {
      enabled: this.enabled,
      scope: "read-only single-URL fetch: no browsing, clicking, JavaScript execution, cookies, or stored credentials; blocks private/loopback/link-local addresses; response capped and truncated"
    };
  }

  async fetchUrl(rawUrl) {
    this.assertEnabled();
    const url = parseFetchableUrl(rawUrl);
    await this.assertPublicAddress(url.hostname);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    let response;
    try {
      response = await this.fetchImplementation(url.toString(), {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "AXI-web-access/1.0 (read-only, admin-gated)" }
      });
    } catch (error) {
      const wrapped = new Error(`web fetch failed: ${error.message}`);
      wrapped.statusCode = 502;
      throw wrapped;
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      // Redirects are not followed automatically: a redirect target could
      // point at an internal address that bypassed the address check above.
      const error = new Error(
        `web fetch received a redirect (HTTP ${response.status}) and does not follow it automatically`
      );
      error.statusCode = 502;
      throw error;
    }

    const contentType = response.headers.get("content-type") || "unknown";
    const buffer = await readCapped(response, this.maxBytes);
    const text = buffer.text.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");

    return {
      url: url.toString(),
      status: response.status,
      contentType,
      truncated: buffer.truncated,
      text
    };
  }

  assertEnabled() {
    if (!this.enabled) {
      const error = new Error("web access is not enabled (set AXIOM_WEB_ACCESS_ENABLED=true)");
      error.statusCode = 503;
      throw error;
    }
  }

  async assertPublicAddress(hostname) {
    const addresses = await this.resolveHostname(hostname);
    if (!addresses.length) {
      const error = new Error(`could not resolve hostname: ${hostname}`);
      error.statusCode = 400;
      throw error;
    }
    for (const address of addresses) {
      if (isPrivateOrReservedAddress(address)) {
        const error = new Error(`refusing to fetch a private/reserved address: ${hostname}`);
        error.statusCode = 400;
        throw error;
      }
    }
  }
}

async function defaultResolveHostname(hostname) {
  if (net.isIP(hostname)) {
    return [hostname];
  }
  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  return records.map((record) => record.address);
}

function parseFetchableUrl(rawUrl) {
  if (typeof rawUrl !== "string" || rawUrl.trim().length === 0) {
    const error = new Error("url must be a non-empty string");
    error.statusCode = 400;
    throw error;
  }
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    const error = new Error("url must be a valid absolute URL");
    error.statusCode = 400;
    throw error;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    const error = new Error("url must use http or https");
    error.statusCode = 400;
    throw error;
  }
  return url;
}

function isPrivateOrReservedAddress(address) {
  const family = net.isIP(address);
  if (family === 4) {
    return isPrivateIpv4(address);
  }
  if (family === 6) {
    return isPrivateIpv6(address);
  }
  return true; // unrecognized: fail closed
}

function isPrivateIpv4(address) {
  const octets = address.split(".").map(Number);
  const [a, b] = octets;
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 0) return true; // "this network"
  if (a >= 224) return true; // multicast/reserved
  return false;
}

function isPrivateIpv6(address) {
  const normalized = address.toLowerCase();
  if (normalized === "::1") return true; // loopback
  if (normalized.startsWith("::ffff:")) {
    // IPv4-mapped address: recheck the embedded IPv4 form
    return isPrivateIpv4(normalized.replace("::ffff:", ""));
  }
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // unique local
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9") ||
      normalized.startsWith("fea") || normalized.startsWith("feb")) return true; // link-local
  return false;
}

async function readCapped(response, maxBytes) {
  if (!response.body) {
    const text = await response.text();
    const truncated = text.length > maxBytes;
    return { text: truncated ? text.slice(0, maxBytes) : text, truncated };
  }
  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;
  let truncated = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.length;
    if (received > maxBytes) {
      const allowed = value.length - (received - maxBytes);
      chunks.push(value.slice(0, Math.max(allowed, 0)));
      truncated = true;
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }
  const text = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("utf8");
  return { text, truncated };
}

module.exports = { WebAccessService };
