const assert = require("node:assert/strict");
const test = require("node:test");
const { WebAccessService } = require("../web-access-service");

function fakeFetch(responder) {
  return async (url, options) => responder(url, options);
}

test("reports disabled status and refuses fetches when not enabled", async () => {
  const service = new WebAccessService({ enabled: false });
  assert.equal(service.status().enabled, false);
  await assert.rejects(() => service.fetchUrl("https://example.com"), /web access is not enabled/);
});

test("reports enabled status without performing any network access", () => {
  const service = new WebAccessService({ enabled: true });
  assert.equal(service.status().enabled, true);
});

test("rejects non-http(s) protocols", async () => {
  const service = new WebAccessService({
    enabled: true,
    resolveHostname: async () => ["93.184.216.34"]
  });
  await assert.rejects(() => service.fetchUrl("file:///etc/passwd"), /must use http or https/);
  await assert.rejects(() => service.fetchUrl("ftp://example.com"), /must use http or https/);
});

test("rejects a malformed url", async () => {
  const service = new WebAccessService({ enabled: true });
  await assert.rejects(() => service.fetchUrl("not a url"), /must be a valid absolute URL/);
  await assert.rejects(() => service.fetchUrl(""), /url must be a non-empty string/);
});

test("blocks private, loopback, and link-local addresses (SSRF guard)", async () => {
  const cases = [
    ["http://10.0.0.5/", ["10.0.0.5"]],
    ["http://127.0.0.1/", ["127.0.0.1"]],
    ["http://169.254.169.254/", ["169.254.169.254"]],
    ["http://172.16.0.1/", ["172.16.0.1"]],
    ["http://192.168.1.1/", ["192.168.1.1"]],
    ["http://internal.example/", ["10.0.0.5"]]
  ];
  for (const [url, addresses] of cases) {
    const service = new WebAccessService({
      enabled: true,
      resolveHostname: async () => addresses
    });
    await assert.rejects(() => service.fetchUrl(url), /refusing to fetch a private\/reserved address/);
  }
});

test("allows a public address to resolve and fetches it, capping and sanitizing the body", async () => {
  const service = new WebAccessService({
    enabled: true,
    resolveHostname: async () => ["93.184.216.34"],
    maxBytes: 1024,
    fetchImplementation: fakeFetch(async (url) => {
      assert.equal(url, "https://example.com/");
      return {
        status: 200,
        headers: { get: () => "text/html" },
        body: null,
        text: async () => "<html><script>alert(1)</script><body>Hello</body></html>"
      };
    })
  });
  const result = await service.fetchUrl("https://example.com/");
  assert.equal(result.status, 200);
  assert.equal(result.truncated, false);
  assert.equal(result.text.includes("<script>"), false);
  assert.match(result.text, /Hello/);
});

test("does not follow redirects", async () => {
  const service = new WebAccessService({
    enabled: true,
    resolveHostname: async () => ["93.184.216.34"],
    fetchImplementation: fakeFetch(async () => ({
      status: 302,
      headers: { get: () => null },
      body: null,
      text: async () => ""
    }))
  });
  await assert.rejects(() => service.fetchUrl("https://example.com/"), /does not follow it automatically/);
});

test("truncates a response body larger than the configured cap", async () => {
  const chunk = new TextEncoder().encode("x".repeat(2000));
  let served = false;
  const service = new WebAccessService({
    enabled: true,
    resolveHostname: async () => ["93.184.216.34"],
    maxBytes: 100,
    fetchImplementation: fakeFetch(async () => ({
      status: 200,
      headers: { get: () => "text/plain" },
      body: {
        getReader() {
          return {
            async read() {
              if (served) return { done: true, value: undefined };
              served = true;
              return { done: false, value: chunk };
            },
            async cancel() {}
          };
        }
      }
    }))
  });
  const result = await service.fetchUrl("https://example.com/");
  assert.equal(result.truncated, true);
  assert.equal(result.text.length, 100);
});

test("rejects an unresolvable hostname", async () => {
  const service = new WebAccessService({
    enabled: true,
    resolveHostname: async () => []
  });
  await assert.rejects(() => service.fetchUrl("https://nowhere.invalid/"), /could not resolve hostname/);
});

test("wraps a network failure as a 502-style error", async () => {
  const service = new WebAccessService({
    enabled: true,
    resolveHostname: async () => ["93.184.216.34"],
    fetchImplementation: async () => {
      throw new Error("connection reset");
    }
  });
  await assert.rejects(() => service.fetchUrl("https://example.com/"), /web fetch failed: connection reset/);
});
