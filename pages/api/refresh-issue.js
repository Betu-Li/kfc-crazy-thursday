import { getGitHubIssues, getRandomIssue } from '../../lib/github';
import config from '../../config/app.config';

export default async function handler(req, res) {
  try {
    const issues = await getGitHubIssues(config.issues.defaultLabels);
    // console.log("Issues fetched in API route:", issues); 
    const randomIssue = getRandomIssue(issues);

    if (randomIssue) {
      res.status(200).json(randomIssue);
    } else {
      res.status(404).json({ message: "No issues found for the specified label." });
    }
  } catch (error) {
    console.error("Error in /api/refresh-issue:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}