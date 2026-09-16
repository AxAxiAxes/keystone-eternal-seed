// Read-only GitHub visibility for AXI: reports pull-request/issue/repository
// status via the GitHub REST API using a founder-supplied token. This
// service never writes, comments, merges, or pushes anything -- only GET
// requests are ever issued. AXI has no ability to generate its own GitHub
// credentials; a token must be supplied out-of-band (an environment
// variable configured by an authorized operator), and the service reports
// itself as unconfigured (and refuses every read call) until one is present.
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
      scope: "read-only: pull requests, issues, and repository metadata only -- no write, comment, merge, or push capability"
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

  assertConfigured() {
    if (!this.token || !this.repo) {
      const error = new Error(
        "GitHub read-only access is not configured (set AXIOM_GITHUB_TOKEN and AXIOM_GITHUB_REPO)"
      );
      error.statusCode = 503;
      throw error;
    }
  }

  async request(path) {
    const response = await this.fetchImplementation(`${this.apiBaseUrl}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });
    if (!response.ok) {
      const error = new Error(`GitHub API returned HTTP ${response.status}`);
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
