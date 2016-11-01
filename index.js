#!/usr/bin/env node

var fs = require('fs');
var spawn = require('cross-spawn');
var githubUrlFromGit = require('github-url-from-git');

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

function updateCompareUri(data, versionString) {

  var unreleasedLinkPattern = /\[Unreleased\]: (.*compare\/)(.*)\.\.\.HEAD/g;

  if (unreleasedLinkPattern.test(data)) {

    return data.replace(
      unreleasedLinkPattern,
      '[Unreleased]: $1v' + versionString + '...HEAD\n[' + versionString + ']: $1$2...v' + versionString
    );

  }

  var originUrl = spawn.sync('git', ['config', '--get', 'remote.origin.url']).stdout.toString().trim();

  if (!originUrl) {
    throw new Error('Unable to determine origin URL for adding to changelog - ensure you have initialized a git repository');
  }

  var compareUrl = githubUrlFromGit(originUrl) + '/compare';
  var treeUrl = githubUrlFromGit(originUrl) + '/tree/v' + versionString;

  return data
    + '\n\n[Unreleased]: ' + compareUrl + '/v' + versionString + '...HEAD'
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
