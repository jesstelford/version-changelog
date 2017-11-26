# Version Changelog [![CircleCI](https://circleci.com/gh/jesstelford/version-changelog.svg?style=svg)](https://circleci.com/gh/jesstelford/version-changelog)

Add a version & URL to your `CHANGELOG.md`.

Goes great with [`changelog-verify`](https://github.com/jesstelford/changelog-verify).
Add this to your `package.json`:

```json
{
  "scripts": {
    "version": "version-changelog CHANGELOG.md && changelog-verify CHANGELOG.md && git add CHANGELOG.md"
  }
}
```

Now whenever you execute `npm version`
(or [`np`](https://github.com/sindresorhus/np)),
your `CHANGELOG.md` will be given the correct version info,
checked for validity
(did you forget to add changelog notes?)
then added to the release commit.

## Usage

Given the following `./CHANGELOG.md`

```markdown
# Changelog

## [Unreleased][]

- These aren’t the droids you’re looking for

## [1.0.0][] - 2016-10-11

- Reticulated the splines
```

And `package.json`

```json
{
  "version": "2.0.0"
}
```

Executing the versioning script

```bash
version-changelog ./CHANGELOG.md
```

Will return success (`0`),
and update `CHANGELOG.md` to:

```markdown
# Changelog

## [Unreleased][]

## [2.0.0][] - <today's date>

- These aren’t the droids you’re looking for

## [1.0.0][] - 2016-10-11

- Reticulated the splines

[Unreleased]: <GitHub URL>/compare/v2.0.0...HEAD
[2.0.0]: <GitHub URL>/compare/v1.0.0...v2.0.0
[1.0.0]: <GitHub URL>/tree/v1.0.0
```

See the [tests](test/test.js) for more usage examples.

## Changelog format

This tool assumes a particular format for your changelog,
keeping in style with http://keepachangelog.com:

```markdown
<some intro text>
## [Unreleased][]
<optional unreleased notes>
## [<version number>][]
<required release notes>
```

Where `<version number>` is the more recently previous release of this module.

## Options

The cli takes a single optional parameter:
the changelog filename:

```
changelog-verify [filename]
```

`filename` can be a path relative to the current working directory,
or an absolute path.
