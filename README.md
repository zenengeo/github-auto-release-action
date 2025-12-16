# Github Auto Release action

This action automatically performs a release of a Github repository when commit activity has stabilized. 
The stable duration is configurable. 
When there have been more frequent commits, then a longer "force release" duration is used.

## Inputs

### `stable-duration`

**Required** 
(Default 7d) 
A release will be created when no more commits have occurred in this duration since last release.

### `force-duration`

**Required** 
(Default 28d) 
A release will be created after this duration even if commits have occurred within the stable duration. 

### `token`

"Required"
(Default uses the workflow's Github token)
A Github token used to perform query and release operation on the repository. When needing to trigger another workflow that is triggered by a tag push, then specify a personal access token.

### `dry-run`

A boolean that indicates if a release should not be created and say if a release would have been created.

## Outputs

### `release`

The release that was created or blank if not ready for release

## Example usage

```yaml
uses: zenengeo/github-auto-release-action@main
with:
  stable-duration: 3d
  force-duration: 14d
```
