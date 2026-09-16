const assert = require("node:assert/strict");
const test = require("node:test");
const { GithubStatusService } = require("../github-status-service");

function fakeFetch(responses) {
  const calls = [];
  return {
    calls,
    fetchImplementation: async (url, options) => {
      calls.push({ url, options });
      const responder = responses.shift();
      if (!responder) {
        throw new Error(`unexpected fetch call: ${url}`);
      }
      return responder(url, options);
    }
  };
}

test("reports unconfigured status and refuses reads without a token/repo", async () => {
  const service = new GithubStatusService({ token: null, repo: null });
  assert.deepEqual(service.status(), {
    configured: false,
    repo: null,
    scope: "read-only: pull requests, issues, and repository metadata only -- no write, comment, merge, or push capability"
  });
  await assert.rejects(() => service.listPullRequests(), /GitHub read-only access is not configured/);
  await assert.rejects(() => service.listIssues(), /GitHub read-only access is not configured/);
  await assert.rejects(() => service.repository(), /GitHub read-only access is not configured/);
});

test("reports configured status with the repo but never the token", () => {
  const service = new GithubStatusService({ token: "secret-token", repo: "octo/example" });
  const status = service.status();
  assert.equal(status.configured, true);
  assert.equal(status.repo, "octo/example");
  assert.equal(JSON.stringify(status).includes("secret-token"), false);
});

test("lists pull requests read-only, using Bearer auth and GET only", async () => {
  const { calls, fetchImplementation } = fakeFetch([
    async (url, options) => {
      assert.equal(url, "https://api.github.com/repos/octo/example/pulls?state=open&per_page=20");
      assert.equal(options.method, "GET");
      assert.equal(options.headers.Authorization, "Bearer secret-token");
      return {
        ok: true,
        async json() {
          return [{
            number: 5,
            title: "Fix bug",
            state: "open",
            draft: false,
            html_url: "https://github.com/octo/example/pull/5",
            updated_at: "2026-09-15T00:00:00.000Z",
            user: { login: "octocat" }
          }];
        }
      };
    }
  ]);
  const service = new GithubStatusService({ token: "secret-token", repo: "octo/example", fetchImplementation });

  const pullRequests = await service.listPullRequests();
  assert.deepEqual(pullRequests, [{
    number: 5,
    title: "Fix bug",
    state: "open",
    draft: false,
    url: "https://github.com/octo/example/pull/5",
    updatedAt: "2026-09-15T00:00:00.000Z",
    user: "octocat"
  }]);
  assert.equal(calls[0].options.method, "GET");
});

test("lists issues and filters out pull requests returned by the issues endpoint", async () => {
  const { fetchImplementation } = fakeFetch([
    async () => ({
      ok: true,
      async json() {
        return [
          {
            number: 10,
            title: "Real issue",
            state: "open",
            html_url: "https://github.com/octo/example/issues/10",
            updated_at: "2026-09-15T00:00:00.000Z",
            user: { login: "octocat" }
          },
          {
            number: 11,
            title: "A pull request disguised as an issue",
            state: "open",
            pull_request: { url: "https://api.github.com/repos/octo/example/pulls/11" },
            html_url: "https://github.com/octo/example/pull/11",
            updated_at: "2026-09-15T00:00:00.000Z",
            user: { login: "octocat" }
          }
        ];
      }
    })
  ]);
  const service = new GithubStatusService({ token: "secret-token", repo: "octo/example", fetchImplementation });

  const issues = await service.listIssues();
  assert.equal(issues.length, 1);
  assert.equal(issues[0].number, 10);
});

test("rejects invalid state/limit and surfaces upstream API failures as 502", async () => {
  const service = new GithubStatusService({ token: "secret-token", repo: "octo/example" });
  await assert.rejects(() => service.listPullRequests({ state: "bogus" }), /state must be open, closed, or all/);
  await assert.rejects(() => service.listPullRequests({ limit: 0 }), /limit must be an integer between 1 and 100/);
  await assert.rejects(() => service.listPullRequests({ limit: 101 }), /limit must be an integer between 1 and 100/);

  const { fetchImplementation } = fakeFetch([
    async () => ({ ok: false, status: 404 })
  ]);
  const failing = new GithubStatusService({ token: "secret-token", repo: "octo/example", fetchImplementation });
  await assert.rejects(
    () => failing.repository(),
    (error) => error.statusCode === 502 && /GitHub API returned HTTP 404/.test(error.message)
  );
});
