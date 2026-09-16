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
  assert.equal(service.status().configured, false);
  assert.equal(service.status().repo, null);
  await assert.rejects(() => service.listPullRequests(), /GitHub access is not configured/);
  await assert.rejects(() => service.listIssues(), /GitHub access is not configured/);
  await assert.rejects(() => service.repository(), /GitHub access is not configured/);
  await assert.rejects(() => service.createIssueComment(1, "hi"), /GitHub access is not configured/);
  await assert.rejects(
    () => service.createPullRequest({ title: "t", head: "h", base: "b" }),
    /GitHub access is not configured/
  );
  await assert.rejects(() => service.mergePullRequest(1), /GitHub access is not configured/);
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

test("creates an issue comment via POST with a JSON body", async () => {
  const { calls, fetchImplementation } = fakeFetch([
    async (url, options) => {
      assert.equal(url, "https://api.github.com/repos/octo/example/issues/42/comments");
      assert.equal(options.method, "POST");
      assert.deepEqual(JSON.parse(options.body), { body: "looks good" });
      return {
        ok: true,
        async json() {
          return { id: 999, html_url: "https://github.com/octo/example/issues/42#issuecomment-999", created_at: "2026-09-15T00:00:00.000Z" };
        }
      };
    }
  ]);
  const service = new GithubStatusService({ token: "secret-token", repo: "octo/example", fetchImplementation });
  const comment = await service.createIssueComment(42, "looks good");
  assert.equal(comment.id, 999);
  assert.equal(calls[0].options.headers["Content-Type"], "application/json");
  await assert.rejects(() => service.createIssueComment(0, "x"), /number must be a positive integer/);
  await assert.rejects(() => service.createIssueComment(1, ""), /body must be a non-empty string/);
});

test("opens a pull request via POST and validates required fields", async () => {
  const { fetchImplementation } = fakeFetch([
    async (url, options) => {
      assert.equal(url, "https://api.github.com/repos/octo/example/pulls");
      assert.equal(options.method, "POST");
      assert.deepEqual(JSON.parse(options.body), { title: "Add feature", head: "feature-branch", base: "main", body: "" });
      return {
        ok: true,
        async json() {
          return {
            number: 7,
            title: "Add feature",
            state: "open",
            draft: false,
            html_url: "https://github.com/octo/example/pull/7",
            updated_at: "2026-09-15T00:00:00.000Z",
            user: { login: "octocat" }
          };
        }
      };
    }
  ]);
  const service = new GithubStatusService({ token: "secret-token", repo: "octo/example", fetchImplementation });
  const pr = await service.createPullRequest({ title: "Add feature", head: "feature-branch", base: "main" });
  assert.equal(pr.number, 7);
  await assert.rejects(
    () => service.createPullRequest({ title: "", head: "h", base: "b" }),
    /title must be a non-empty string/
  );
});

test("merges a pull request via PUT and validates the merge method, surfacing GitHub's own rejection message", async () => {
  const { fetchImplementation } = fakeFetch([
    async (url, options) => {
      assert.equal(url, "https://api.github.com/repos/octo/example/pulls/9/merge");
      assert.equal(options.method, "PUT");
      assert.deepEqual(JSON.parse(options.body), { merge_method: "squash" });
      return {
        ok: true,
        async json() {
          return { merged: true, sha: "abc123" };
        }
      };
    }
  ]);
  const service = new GithubStatusService({ token: "secret-token", repo: "octo/example", fetchImplementation });
  const result = await service.mergePullRequest(9);
  assert.deepEqual(result, { merged: true, sha: "abc123", message: null });
  await assert.rejects(
    () => service.mergePullRequest(9, { mergeMethod: "bogus" }),
    /mergeMethod must be merge, squash, or rebase/
  );

  const { fetchImplementation: blockedFetch } = fakeFetch([
    async () => ({
      ok: false,
      status: 405,
      async json() {
        return { message: "Required status check \"Node tests (apps/axiom-engine)\" is expected." };
      }
    })
  ]);
  const blocked = new GithubStatusService({ token: "secret-token", repo: "octo/example", fetchImplementation: blockedFetch });
  await assert.rejects(
    () => blocked.mergePullRequest(9),
    (error) => error.statusCode === 502 && /Required status check/.test(error.message)
  );
});
