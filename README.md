[![Status][ico-github-actions]][link-github]
[![Latest Version][ico-version]][link-github]
[![License][ico-license]][link-license]

[ico-github-actions]: https://github.com/2e3s/extract-status-links-action/workflows/build-test/badge.svg
[ico-version]: https://img.shields.io/github/tag/2e3s/extract-status-links-action.svg?label=latest
[ico-license]: https://img.shields.io/badge/License-MIT-blue.svg

[link-github]: https://github.com/2e3s/extract-status-links-action
[link-license]: LICENSE

# Extract status links

Many workflows use Github's [statuses](https://developer.github.com/v3/repos/statuses/)
to make builds of any sort for a given commit.
It may be inconvenient to go every time to Pull Request's "Checks" section
in order to find among all checks and statuses the needed link.
This Github Action automatically posts 1 or more links from statuses on top of a PR.

## Configuration

- *token*: a secret for the action.
- *template*: the comment's body where the template parts between "<!---" and "--->"
  should have a format regexp=markdown. Only the first occurence will be replaced by the regexp. 

## Workflow example

```yaml
name: "post-links"
on:
  status

jobs:
  post_links:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: ./
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          template: |
            ## Links

            <!---jenkins\.server/build=- [The build](%)--->
            <!---jenkins\.server/test=- [Tests](%)--->
```
