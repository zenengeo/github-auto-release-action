export default class GithubAutoReleaser {
    octokit;
    owner;
    repo;
    dryRun;

    constructor (octokit, owner, repo, dryRun = false, logDebug) {
        this.octokit = octokit;
        this.owner = owner;
        this.repo = repo;
        this.dryRun = dryRun;
        this.logDebug = logDebug;
    }

    async autoCreateRelease(stableDurationMs, forceDurationMs) {
        if (!await this.anyCommitsDuring(stableDurationMs)) {
            return await this.handleStableRelease();
        }
        else {
            return await this.handleForceRelease(forceDurationMs);
        }
    }

    async handleStableRelease() {
        // get most recent commit
        const mostRecentCommit = await this.getMostRecentCommit();

        // get most recent tag
        const mostRecentTag = await this.getMostRecentTag();

        // if recent commit sha != recent tag sha
        if (mostRecentCommit.sha !== mostRecentTag.commit.sha) {
            return await this.createReleaseWithAutoTagName(mostRecentTag, mostRecentCommit);
        } else {
            return null
        }
    }

    async handleForceRelease(forceDurationMs) {
        const mostRecentTag = await this.getMostRecentTag();
        // get most recent release/tag
        this.logDebug(`Looking up release for most recent tag: ${mostRecentTag.name}`);
        const mostRecentRelease = await this.getReleaseByTag(mostRecentTag)

        const cutoff = Date.now() - forceDurationMs;
        // Using published_at to reflect most recent instance of a release, whereas
        // created_at was the date of first time release was created
        const releaseDate = new Date(mostRecentRelease.published_at);
        // if that release is older than force duration?
        if (releaseDate.getTime() < cutoff) {
            // get most recent commit
            const mostRecentCommit = await this.getMostRecentCommit();

            // if most recent commit newer/different than most recent release?
            if (mostRecentCommit.sha !== mostRecentTag.commit.sha) {
                // create release
                return await this.createReleaseWithAutoTagName(mostRecentTag, mostRecentCommit);
            }

        }

        return null
    }

    async createRelease(sha, name) {
        if (this.dryRun) {
            return;
        }

        const shaCheckPattern = /^[a-f0-9]{40}$/;
        if (!shaCheckPattern.test(sha)) {
            throw new Error(`Invalid sha: ${sha}`);
        }

        try {
            await this.octokit.rest.repos.createRelease({
                owner: this.owner,
                repo: this.repo,
                tag_name: name,
                target_commitish: sha,
                name,
                generate_release_notes: true
            });
        } catch (e) {
            console.error('Failed to create release', e);
            throw e;
        }
    }

    async anyCommitsDuring(stableDurationMs) {
        const commitsResp = await this.octokit.rest.repos.listCommits({
            owner: this.owner, repo: this.repo,
            since: new Date(Date.now() - stableDurationMs).toISOString(),
        })

        return commitsResp.data.length !== 0;
    }

    async getMostRecentCommit() {
        const commitsResp = await this.octokit.rest.repos.listCommits({
            owner: this.owner, repo: this.repo,
            per_page: 1
        })

        return commitsResp.data[0]
    }

    async getMostRecentTag() {
        const tagsResp = await this.octokit.rest.repos.listTags({
            owner: this.owner, repo: this.repo,
            per_page: 1
        })

        return tagsResp.data[0]
    }

    calculateNewTagName(mostRecentTag) {
        // calculate new tag {yyyy}.{m} prefix
        const now = new Date();
        const prefix = `${now.getFullYear()}.${now.getMonth() + 1}.`;

        // if recent tag has same {yyyy}.{m} prefix
        if (mostRecentTag.name.startsWith(prefix)) {
            const mostRecentIncrement = Number(mostRecentTag.name.split('.')[2]);
            // determine next available increment
            return prefix + (mostRecentIncrement+1);
        }
        else {
            // else use .0 as increment
            return prefix + '0'
        }
    }

    async getReleaseByTag(tag) {
        const releaseResp = await this.octokit.rest.repos.getReleaseByTag({
            owner: this.owner,
            repo: this.repo,
            tag: tag.name
        });

        return releaseResp.data
    }

    async createReleaseWithAutoTagName(mostRecentTag, mostRecentCommit) {
        const tagName = this.calculateNewTagName(mostRecentTag);

        // create release with new tag name, recent commit sha
        // TODO also check release named with tag name doesn't exist
        await this.createRelease(mostRecentCommit.sha, tagName);

        return {
            name: tagName,
            date: new Date(mostRecentCommit.commit.committer.date),
            sha: mostRecentCommit.sha,
        }
    }
}