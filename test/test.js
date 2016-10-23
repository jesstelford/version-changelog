var upath = require('upath');
var assert = require('assert');
var versionChangelog = require('../index');

const date = new Date();
const todayDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
const repoBase = 'https://github.com/jesstelford/';

describe('Versioning Changelog', function() {

  it.skip('Handles a non-git repo correctly', function(done) {
    // TODO: Test when the `.git` folder doesn't exist
  });

  it('Correctly adds a new version', function(done) {

    versionChangelog(
      `
# Changelog

## [Unreleased][]
- Foo
      `.trim(),
      '1.0.0',
      function(error, data) {

        assert.ifError(error);
        assert.equal(data, `
# Changelog

## [Unreleased][]

## [1.0.0][] - ${todayDate}
- Foo

[Unreleased]: https://github.com/jesstelford/version-changelog/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/jesstelford/version-changelog/tree/v1.0.0
        `.trim());

        done();
      }
    );

  });

  it('Correctly handles empty Unreleased section', function(done) {

    versionChangelog(
      `
# Changelog

## [Unreleased][]
      `.trim(),
      '1.0.0',
      function(error, data) {

        assert.ifError(error);
        assert.equal(data, `
# Changelog

## [Unreleased][]

## [1.0.0][] - ${todayDate}

[Unreleased]: https://github.com/jesstelford/version-changelog/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/jesstelford/version-changelog/tree/v1.0.0
        `.trim());

        done();
      }
    );

  });

  it('Correctly skips old versions for links', function(done) {

    versionChangelog(
      `
# Changelog

## [Unreleased][]
- Foo

## [1.0.0][] - 2016-10-10
- Bar
      `.trim(),
      '2.0.0',
      function(error, data) {

        assert.ifError(error);
        assert.equal(data, `
# Changelog

## [Unreleased][]

## [2.0.0][] - ${todayDate}
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://github.com/jesstelford/version-changelog/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/jesstelford/version-changelog/tree/v2.0.0
        `.trim());

        done();
      }
    );

  });

});
