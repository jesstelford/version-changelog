#!/usr/bin/env node

var fs = require('fs');
var spawn = require('cross-spawn');
var githubUrlFromGit = require('github-url-from-git');
var hasYarn = require('has-yarn');

function dateWithLeadingZero(date) {
  return ('0' + date).slice(-2);
}

function insertHeading(data, versionString) {

  var date = new Date();

  return data.replace(
    /(## \[Unreleased\].*)/g,
    '$1\n\n## [' + versionString + '][] - ' + date.getFullYear() + '-' + dateWithLeadingZero(date.getMonth() + 1) + '-' + dateWithLeadingZero(date.getDate())
  );

}

function getVersionPrefix() {
  var output = null;
  var versionPrefix = 'v';
  if (hasYarn()) {
    output = spawn.sync('yarn', ['config', 'get', 'version-tag-prefix']);
  } else {
    output = spawn.sync('npm', ['config', 'get', 'tag-version-prefix']);
  }
  if (output.stdout && !output.error) {
    versionPrefix = output.stdout.toString().trim();
  }
  return versionPrefix;
}

function updateCompareUri(data, versionString) {
  
  var versionWithPrefix = getVersionPrefix() + versionString;

  var unreleasedLinkPattern = /\[Unreleased\]: (.*compare\/)(.*)\.\.\.HEAD/g;

  if (unreleasedLinkPattern.test(data)) {

    return data.replace(
      unreleasedLinkPattern,
      '[Unreleased]: $1' + versionWithPrefix + '...HEAD\n[' + versionString + ']: $1$2...' + versionWithPrefix
    );

  }

  var originUrl = spawn.sync('git', ['config', '--get', 'remote.origin.url']).stdout.toString().trim();

  if (!originUrl) {
    throw new Error('Unable to determine origin URL for adding to changelog - ensure you have initialized a git repository');
  }

  var compareUrl = githubUrlFromGit(originUrl) + '/compare';
  var treeUrl = githubUrlFromGit(originUrl) + '/tree/' + versionWithPrefix;

  return data
    + '\n\n[Unreleased]: ' + compareUrl + '/' + versionWithPrefix + '...HEAD'
    + '\n[' + versionString + ']: ' + treeUrl;

}

module.exports = function versionChangelog(data, version, done) {

  try {

    // Add the heading for the new version number
    data = insertHeading(data, version);

    // Update the [Unreleased] URI
    // and add the new version URI
    data = updateCompareUri(data, version);

    done(null, data);

  } catch (error) {
    done(error);
  }
}

module.exports.getVersionPrefix = getVersionPrefix;
