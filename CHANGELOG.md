# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased][]

### Fixed

- Corrected documentation on usage
- Fixed GitLab compare URLs

## [3.1.1][] - 2018-12-22

### Changed

- Upgrade upath package to 1.1.0
- Upgrade meow to 5.0.0

## [3.1.0][] - 2018-03-14

### Added

- gitlab support

## [3.0.0][] - 2018-03-14

### Added

- Support bitbucket repos

## [2.1.1][] - 2018-03-14

### Fixed

- Handle `null` stdout in `getVersionPrefix()`

### Added

- CircleCI support
- Enforce updates to `CHANGELOG.md` for PRs

## [2.1.0][] - 2017-05-25

### Added

- Add `yarn.lock` file
- Added support for custom git tag prefixes

## [2.0.1][] - 2016-11-02

### Fixed

- Prefix single-digit months + days with a '0'

## [2.0.0][] - 2016-10-25

### Changed

- Throw an error instead of a `console.warn` when no git repo detected. (See #1)

## [1.0.1][] - 2016-10-23

- Better dogfooding
  (add the modified `CHANGELOG.md` to git)
- Instructions on use with
  [`changelog-verify`](https://github.com/jesstelford/changelog-verify)

## [1.0.0][] - 2016-10-23

### Initial release

- Add new version header to changelog
- Add links to github compare URLs
- Dogfood the tool


[Unreleased]: https://github.com/jesstelford/version-changelog/compare/v3.1.1...HEAD
[3.1.1]: https://github.com/jesstelford/version-changelog/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/jesstelford/version-changelog/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/jesstelford/version-changelog/compare/v2.1.1...v3.0.0
[2.1.1]: https://github.com/jesstelford/version-changelog/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/jesstelford/version-changelog/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/jesstelford/version-changelog/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/jesstelford/version-changelog/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/jesstelford/version-changelog/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/jesstelford/version-changelog/tree/v1.0.0
