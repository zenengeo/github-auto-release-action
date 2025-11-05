import * as core from "@actions/core";
import * as github from "@actions/github";
import parseDuration from "parse-duration";
import GithubAutoReleaser from "./GithubAutoReleaser.js";

async function run() {

    try {
        const token = core.getInput('token');
        const stableDurationMs = parseDuration(core.getInput('stable-duration'));
        const forceDurationMs = parseDuration(core.getInput('force-duration'));
        const dryRun = core.getInput('dry-run').toLowerCase() === "true";
        core.info(`dry-run=${dryRun}, input=${core.getInput('dry-run')}`);

        const octokit = github.getOctokit(token);

        const owner = github.context.repo.owner;
        const repo = github.context.repo.repo;
        core.debug(`Creating auto releaser for ${owner}:${repo}`);
        const githubAutoReleaser = new GithubAutoReleaser(
            octokit,
            owner,
            repo,
            dryRun
        );

        core.debug(`Checking and performing auto release with stable duration: ${stableDurationMs} and force duration: ${forceDurationMs}`);
        const release = await githubAutoReleaser.autoCreateRelease(
            stableDurationMs, forceDurationMs
        );

        if (dryRun) {
            core.info('In dry-run mode');
        }
        else {
            core.debug('In regular mode')
        }

        if (release) {
            core.setOutput("release", release);

            core.info(`${dryRun ? 'Would have created a' : 'Created'} release ${release.name} at sha=${release.sha} date=${release.date}`);
        } else {
            core.setOutput("release", '');
            core.info('Not ready for release')
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

await run();