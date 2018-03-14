# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased][]

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


[Unreleased]: https://github.com/jesstelford/version-changelog/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/jesstelford/version-changelog/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/jesstelford/version-changelog/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/jesstelford/version-changelog/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/jesstelford/version-changelog/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/jesstelford/version-changelog/tree/v1.0.0
