import github from '@actions/github'
import GithubAutoReleaser from "../src/GithubAutoReleaser.js";


if (process.argv.length < 6) {
    console.error('Please pass: owner repo sha name');
    process.exit(1);
}

const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

const githubAutoReleaser = new GithubAutoReleaser(
  octokit, process.argv[2],
  process.argv[3], false,
  (msg) => console.debug(msg)
  );

await githubAutoReleaser.createRelease(
    process.argv[4],
    process.argv[5]
)

