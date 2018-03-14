var upath = require('upath');
var assert = require('assert');
var hasYarn = require('has-yarn');
var spawn = require('cross-spawn');
var proxyquire = require('proxyquire');
var sinon = require('sinon');

var gitRemote = sinon.stub();

var versionChangelog = proxyquire('../index', {'./util/git-remote': gitRemote});

function padWithZero(num) {
  return num < 10 ? '0' + num : num
}

const date = new Date();
const todayDate = date.getFullYear() + '-' + padWithZero(date.getMonth() + 1) + '-' + padWithZero(date.getDate());
const repoBase = 'https://github.com/jesstelford/';

let versionPrefix = '';
let prefixType = '';
if (hasYarn()) {
  versionPrefix = spawn.sync('yarn', ['config', 'get', 'version-tag-prefix']).stdout.toString().trim();
  prefixSource = 'yarn config get version-tag-prefix';
} else {
  versionPrefix = spawn.sync('npm', ['config', 'get', 'tag-version-prefix']).stdout.toString().trim();
  prefixSource = 'npm config get tag-version-prefix';
}
if (!versionPrefix) {
  versionPrefix = 'v';
  prefixSource = 'default'
}

describe(`Versioning Changelog (prefix source: "${prefixSource}")`, function() {

  beforeEach(() => {
    gitRemote.reset();
    gitRemote.returns('git@github.com:jesstelford/version-changelog.git');
  });

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
      {
        version: '1.0.0',
      },
      function(error, data) {

        assert.ifError(error);
        assert.equal(data, `
# Changelog

## [Unreleased][]

## [1.0.0][] - ${todayDate}
- Foo

[Unreleased]: https://github.com/jesstelford/version-changelog/compare/${versionPrefix}1.0.0...HEAD
[1.0.0]: https://github.com/jesstelford/version-changelog/tree/${versionPrefix}1.0.0
        `.trim());

        done();
      }
    );

  });

  it('Correctly updates old unreleased sections', function(done) {

    versionChangelog(
      `
# Changelog

## [Unreleased][]
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://github.com/jesstelford/version-changelog/compare/${versionPrefix}1.0.0...HEAD
[1.0.0]: https://github.com/jesstelford/version-changelog/tree/${versionPrefix}1.0.0

      `.trim(),
      {
        version: '2.0.0',
      },
      function(error, data) {

        assert.ifError(error);
        assert.equal(data, `
# Changelog

## [Unreleased][]

## [2.0.0][] - ${todayDate}
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://github.com/jesstelford/version-changelog/compare/${versionPrefix}2.0.0...HEAD
[2.0.0]: https://github.com/jesstelford/version-changelog/compare/${versionPrefix}1.0.0...${versionPrefix}2.0.0
[1.0.0]: https://github.com/jesstelford/version-changelog/tree/${versionPrefix}1.0.0
        `.trim());

        done();
      }
    );

  });

  it('Correctly adds a new bitbucket version', function(done) {

    gitRemote.returns('git@bitbucket.org:jesstelford/version-changelog.git');
    versionChangelog(
      `
# Changelog

## [Unreleased][]
- Foo
      `.trim(),
      {
        version: '1.0.0',
        remote: 'bitbucket',
      },
      function(error, data) {

        assert.ifError(error);
        assert.equal(data, `
# Changelog

## [Unreleased][]

## [1.0.0][] - ${todayDate}
- Foo

[Unreleased]: https://bitbucket.org/jesstelford/version-changelog/branches/compare/master%0D${versionPrefix}1.0.0
[1.0.0]: https://bitbucket.org/jesstelford/version-changelog/commits/tag/${versionPrefix}1.0.0
        `.trim());

        done();
      }
    );

  });

  it('Correctly updates old unreleased sections with bitbucket urls', function(done) {

    versionChangelog(
      `
# Changelog

## [Unreleased][]
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://bitbucket.org/jesstelford/version-changelog/branches/compare/master%0D${versionPrefix}1.0.0
[1.0.0]: https://bitbucket.org/jesstelford/version-changelog/commits/tag/${versionPrefix}1.0.0

      `.trim(),
      {
        version: '2.0.0',
        remote: 'bitbucket',
      },
      function(error, data) {

        assert.ifError(error);
        assert.equal(data, `
# Changelog

## [Unreleased][]

## [2.0.0][] - ${todayDate}
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://bitbucket.org/jesstelford/version-changelog/branches/compare/master%0D${versionPrefix}2.0.0
[2.0.0]: https://bitbucket.org/jesstelford/version-changelog/branches/compare/${versionPrefix}2.0.0%0D${versionPrefix}1.0.0
[1.0.0]: https://bitbucket.org/jesstelford/version-changelog/commits/tag/${versionPrefix}1.0.0
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
      {
        version: '1.0.0',
      },
      function(error, data) {

        assert.ifError(error);
        assert.equal(data, `
# Changelog

## [Unreleased][]

## [1.0.0][] - ${todayDate}

[Unreleased]: https://github.com/jesstelford/version-changelog/compare/${versionPrefix}1.0.0...HEAD
[1.0.0]: https://github.com/jesstelford/version-changelog/tree/${versionPrefix}1.0.0
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
      {
        version: '2.0.0',
      },
      function(error, data) {

        assert.ifError(error);
        assert.equal(data, `
# Changelog

## [Unreleased][]

## [2.0.0][] - ${todayDate}
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://github.com/jesstelford/version-changelog/compare/${versionPrefix}2.0.0...HEAD
[2.0.0]: https://github.com/jesstelford/version-changelog/tree/${versionPrefix}2.0.0
        `.trim());

        done();
      }
    );

  });

});
