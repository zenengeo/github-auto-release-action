## Requirements

- Assume this is a Github Action running in a scheduled Github workflow, such as daily
- Use `{year}.{month}.{increment}` style versioning
- First `increment` of each month is zero
- The `increment` will be next available value and must do this by looking at previous Github release, if the year-month is the same
- Does nothing if...
    - no commits since last release
    - commits aren't "stable", meaning most recent commit is still within configurable waiting period. Default of 7 days.
        - unless there have been more frequent commits, then use a longer "force release" period, such as 28 days, where a release is created anyway
- Should still allow for manual release/tag creation
- When creating a Github release, use the "generate release notes" option

## Reference material

- https://github.com/features/actions
- https://docs.github.com/en/actions/concepts/workflows-and-actions/about-custom-actions
- https://docs.github.com/en/actions/concepts/workflows-and-actions/about-custom-actions#javascript-actions
- https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action
  - Notes
    - In `package.json`
      - changed `type` to "module"
      - in `scripts` added a `package` with "rollup --config rollup.config.js"
  - Bundles into a NodeJS ES module
    - Refer to https://nodejs.org/api/esm.html#enabling, which is basically setting `type: "module"` in `package.json`
  - Recommends the bundler [Rollup](https://rollupjs.org/introduction/)
    - Use output format "es"
    - Tutorial includes use of https://github.com/rollup/plugins/tree/master/packages/commonjs, but is it really needed?
- https://github.com/actions/javascript-action
- https://github.com/actions/hello-world-javascript-action
  - Uses https://prettier.io/docs/install
  - Uses https://jestjs.io/docs/getting-started
- https://github.com/actions/toolkit
- https://github.com/actions/toolkit/tree/main/packages/github
- https://octokit.github.io/rest.js
- https://github.com/octokit/request-error.js?tab=readme-ov-file#usage-with-octokit