import github from '@actions/github'
import parseDuration from 'parse-duration'
import GithubAutoReleaser from "../src/GithubAutoReleaser.js";

if (process.argv.length < 6) {
    console.error('Please pass: owner repo stableDurationMs forceDurationMs');
    process.exit(1);
}

const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

let owner = process.argv[2];
let repo = process.argv[3];
let stableDurationMs = parseDuration(process.argv[4]);
let forceDurationMs = parseDuration(process.argv[5]);

if (stableDurationMs > forceDurationMs) {
    console.warn("stable duration should be less than force duration usually")
}

const githubAutoReleaser = new GithubAutoReleaser(
  octokit, owner, repo, false,
  (msg) => console.debug(msg)
);
const release = await githubAutoReleaser.autoCreateRelease(stableDurationMs, forceDurationMs);

if (release) {
    console.log(`Created release ${release.name} at sha=${release.sha} date=${release.date}`);
}
else {
    console.log('Not ready for release')
}

