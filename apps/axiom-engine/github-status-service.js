// GitHub visibility and write actions for AXI, founder-approved 2026-09-15.
// Uses the GitHub REST API with a founder-supplied token. AXI has no ability
// to generate its own GitHub credentials; a token must be supplied
// out-of-band (an environment variable configured by an authorized
// operator), and the service reports itself as unconfigured (and refuses
// every call) until one is present. Every route that reaches this service
// is admin-gated at the HTTP layer (apps/axiom-engine/index.js). Write
// actions (comment, open PR, merge PR) rely on GitHub's own server-side
// branch protection and required status checks as the real safety
// backstop: a merge request GitHub itself rejects (e.g. failing/pending
// required checks) fails here exactly the same way it would for a human.
class GithubStatusService {
  constructor({ token, repo, fetchImplementation = fetch, apiBaseUrl = "https://api.github.com" }) {
    this.token = token;
    this.repo = repo;
    this.fetchImplementation = fetchImplementation;
    this.apiBaseUrl = apiBaseUrl;
  }

  status() {
    return {
      configured: Boolean(this.token && this.repo),
      repo: this.repo || null,
      scope: "founder-approved: read pull requests/issues/repository metadata, comment on issues/PRs, open pull requests, and merge pull requests (subject to GitHub's own branch protection and required status checks)"
    };
  }

  async repository() {
    this.assertConfigured();
    const data = await this.request(`/repos/${this.repo}`);
    return {
      fullName: data.full_name,
      defaultBranch: data.default_branch,
      private: data.private,
      openIssuesCount: data.open_issues_count,
      pushedAt: data.pushed_at
    };
  }

  async listPullRequests({ state = "open", limit = 20 } = {}) {
    this.assertConfigured();
    assertState(state);
    assertLimit(limit);
    const data = await this.request(`/repos/${this.repo}/pulls?state=${state}&per_page=${limit}`);
    return data.map(summarizePullRequest);
  }

  async listIssues({ state = "open", limit = 20 } = {}) {
    this.assertConfigured();
    assertState(state);
    assertLimit(limit);
    const data = await this.request(`/repos/${this.repo}/issues?state=${state}&per_page=${limit}`);
    return data.filter((issue) => !issue.pull_request).map(summarizeIssue);
  }

  async createIssueComment(number, body) {
    this.assertConfigured();
    assertIssueNumber(number);
    assertCommentBody(body);
    const data = await this.request(`/repos/${this.repo}/issues/${number}/comments`, {
      method: "POST",
      body: { body }
    });
    return { id: data.id, url: data.html_url, createdAt: data.created_at };
  }

  async createPullRequest({ title, head, base, body = "" }) {
    this.assertConfigured();
    assertNonEmptyString(title, "title");
    assertNonEmptyString(head, "head");
    assertNonEmptyString(base, "base");
    const data = await this.request(`/repos/${this.repo}/pulls`, {
      method: "POST",
      body: { title, head, base, body }
    });
    return summarizePullRequest(data);
  }

  async mergePullRequest(number, { mergeMethod = "squash", commitTitle } = {}) {
    this.assertConfigured();
    assertIssueNumber(number);
    assertMergeMethod(mergeMethod);
    const payload = { merge_method: mergeMethod };
    if (commitTitle) {
      payload.commit_title = commitTitle;
    }
    const data = await this.request(`/repos/${this.repo}/pulls/${number}/merge`, {
      method: "PUT",
      body: payload
    });
    return { merged: Boolean(data.merged), sha: data.sha || null, message: data.message || null };
  }

  assertConfigured() {
    if (!this.token || !this.repo) {
      const error = new Error(
        "GitHub access is not configured (set AXIOM_GITHUB_TOKEN and AXIOM_GITHUB_REPO)"
      );
      error.statusCode = 503;
      throw error;
    }
  }

  async request(path, { method = "GET", body } = {}) {
    const response = await this.fetchImplementation(`${this.apiBaseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(body ? { "Content-Type": "application/json" } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    if (!response.ok) {
      let detail = "";
      try {
        const errorBody = await response.json();
        detail = errorBody && errorBody.message ? `: ${errorBody.message}` : "";
      } catch {
        // ignore unparsable error bodies
      }
      const error = new Error(`GitHub API returned HTTP ${response.status}${detail}`);
      error.statusCode = 502;
      throw error;
    }
    return response.json();
  }
}

function assertState(state) {
  if (!["open", "closed", "all"].includes(state)) {
    throw new RangeError("state must be open, closed, or all");
  }
}

function assertLimit(limit) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError("limit must be an integer between 1 and 100");
  }
}

function assertIssueNumber(number) {
  if (!Number.isInteger(number) || number < 1) {
    throw new RangeError("number must be a positive integer");
  }
}

function assertCommentBody(body) {
  if (typeof body !== "string" || body.trim().length === 0) {
    throw new RangeError("body must be a non-empty string");
  }
}

function assertNonEmptyString(value, field) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new RangeError(`${field} must be a non-empty string`);
  }
}

function assertMergeMethod(mergeMethod) {
  if (!["merge", "squash", "rebase"].includes(mergeMethod)) {
    throw new RangeError("mergeMethod must be merge, squash, or rebase");
  }
}

function summarizePullRequest(pr) {
  return {
    number: pr.number,
    title: pr.title,
    state: pr.state,
    draft: pr.draft,
    url: pr.html_url,
    updatedAt: pr.updated_at,
    user: pr.user ? pr.user.login : null
  };
}

function summarizeIssue(issue) {
  return {
    number: issue.number,
    title: issue.title,
    state: issue.state,
    url: issue.html_url,
    updatedAt: issue.updated_at,
    user: issue.user ? issue.user.login : null
  };
}

module.exports = { GithubStatusService };
