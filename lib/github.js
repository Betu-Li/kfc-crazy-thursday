const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";
import config from '../config/app.config'; // 导入配置文件

export async function getGitHubIssues(labels = null) {
  let queryVariables = `$owner: String!, $repo: String!`;
  let issuesArgs = `first: 100, states: OPEN`;

  let actualLabels = [];
  if (typeof labels === 'string') {
    actualLabels = [labels];
  } else if (Array.isArray(labels)) {
    actualLabels = labels;
  }

  if (actualLabels.length > 0) {
    queryVariables += `, $labels: [String!]`;
    issuesArgs += `, labels: $labels`;
  }

  const query = `
    query GetIssuesByLabel(${queryVariables}) {
      repository(owner: $owner, name: $repo) {
        issues(${issuesArgs}) {
          nodes {
            title
            bodyHTML
            url
            number
          }
        }
      }
    }
  `;

  const variables = {
    owner: config.github.owner,
    repo: config.github.repo,
  };

  if (actualLabels.length > 0) {
    variables.labels = actualLabels;
  }

  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("GitHub API HTTP Error:", errorData);
      throw new Error(`GitHub API responded with status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error("GitHub GraphQL Errors:", data.errors);
      throw new Error(`GitHub GraphQL API returned errors: ${JSON.stringify(data.errors)}`);
    }

    if (!data.data || !data.data.repository || !data.data.repository.issues) {
      console.error("Unexpected GitHub GraphQL response structure:", data);
      throw new Error("Unexpected data structure from GitHub GraphQL API. Check owner/repo/token.");
    }

    return data.data.repository.issues.nodes;
  } catch (error) {
    console.error("Error fetching GitHub issues:", error);
    return [];
  }
}

export function getRandomIssue(issues) {
  if (!issues || issues.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * issues.length);
  return issues[randomIndex];
}