import github from '@actions/github'

const millisInSeconds = 1000;
const millisInMinutes = 60 * millisInSeconds;
const millisInHours = 60 * millisInMinutes;
const millisInDays = 24 * millisInHours;

async function run() {
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    const owner = 'zenengeo';
    const repo = 'test-auto-release';
    const ownerRepo = {
        owner,
        repo
    };

    const repoResp = await octokit.rest.repos.get(ownerRepo);

    const defaultBranch = repoResp.data.default_branch;
    console.log('defaultBranch', defaultBranch);

    const latestRelease = await getLatestRelease(octokit, ownerRepo);

    if (latestRelease) {
        console.log('latestRelease', latestRelease.name);
    }

    const commitsResp = await octokit.rest.repos.listCommits(ownerRepo)
    logCommits('all commits', commitsResp);

    const since = new Date(Date.now() - 10 * millisInDays)
    const recentCommitsResp = await octokit.rest.repos.listCommits({
        ...ownerRepo,
        since: since.toISOString(),

    })
    logCommits('recent commits', recentCommitsResp)

    const tagsResp = await octokit.rest.repos.listTags(ownerRepo)
    console.log('tags',
        JSON.stringify(
            tagsResp.data.map(t => (
                {
                    name: t.name,
                    commit: t.commit
                }
            )), null, 2
        )
    )

    await octokit.rest.repos.listReleases(ownerRepo)
}

function logCommits(message, commitsResp) {
    console.log(message, JSON.stringify(
        commitsResp.data.map(c => (
            {
                message: c.commit.message,
                date: c.commit.committer.date,
                name: c.commit.committer.name,
                sha: c.sha
            }
        )), null, 2
    ));
}

async function getLatestRelease(octokit, ownerRepo) {
    try {
        const latestReleaseResp = await octokit.rest.repos.getLatestRelease(ownerRepo);
        return latestReleaseResp.data;
    } catch (error) {
        if (error.status !== 404) {
            throw error;
        }
        return null
    }
}

await run()