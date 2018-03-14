#!/usr/bin/env node

var fs = require('fs');
var spawn = require('cross-spawn');
var githubUrlFromGit = require('github-url-from-git');
var bitbucketUrlFromGit = require('bitbucket-url-from-git');
var gitlabUrlFromGit = require('giturl').parse;
var hasYarn = require('has-yarn');
var gitRemote = require('./util/git-remote');

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

function githubUris(data, newVersion) {
  var remoteUrl;
  var previousVersion;
  var previousLink;
  var prefix = getVersionPrefix();

  // Try get previous version and remote from unreleased tag if it exists
  var match = /\[Unreleased\]: (.*)\/compare\/(.*)\.\.\.HEAD/g.exec(data);

  if (match) {
    remoteUrl = match[1];
    previousVersion = match[2];
  }

  if (!remoteUrl) {
    remoteUrl = githubUrlFromGit(gitRemote());
  }

  if (previousVersion) {
    previousLink = '[' + newVersion + ']: ' + remoteUrl + '/compare/' + previousVersion + '...' + prefix + newVersion;
  } else {
    previousLink = '[' + newVersion + ']: ' + remoteUrl + '/tree/' + prefix + newVersion;
  }

  return {
    unreleased: '[Unreleased]: ' + remoteUrl + '/compare/' + prefix + newVersion + '...HEAD',
    previous: previousLink
  };
}

function bitbucketUris(data, newVersion) {
  var remoteUrl;
  var previousVersion;
  var previousLink;
  var prefix = getVersionPrefix();

  // Try get previous version and remote from unreleased tag if it exists
  var match = /\[Unreleased\]: (.*)\/branches\/compare\/master%0D(.*)/g.exec(data);

  if (match) {
    remoteUrl = match[1];
    previousVersion = match[2];
  }

  if (!remoteUrl) {
    remoteUrl = bitbucketUrlFromGit(gitRemote());
  }

  if (previousVersion) {
    previousLink = '[' + newVersion + ']: ' + remoteUrl + '/branches/compare/' + prefix + newVersion + '%0D' + previousVersion;
  } else {
    previousLink = '[' + newVersion + ']: ' + remoteUrl + '/commits/tag/' + prefix + newVersion;
  }

  return {
    unreleased: '[Unreleased]: ' + remoteUrl + '/branches/compare/master%0D' + prefix + newVersion,
    previous: previousLink
  };
}

function gitlabUris(data, newVersion) {
  var remoteUrl;
  var previousVersion;
  var previousLink;
  var prefix = getVersionPrefix();

  // Try get previous version and remote from unreleased tag if it exists
  var match = /\[Unreleased\]: (.*)\/compare\/master...(.*)/g.exec(data);

  if (match) {
    remoteUrl = match[1];
    previousVersion = match[2];
  }

  if (!remoteUrl) {
    var remote = gitRemote();
    remoteUrl = gitlabUrlFromGit(gitRemote());
  }

  if (previousVersion) {
    previousLink = '[' + newVersion + ']: ' + remoteUrl + '/compare/' + prefix + newVersion + '...' + previousVersion;
  } else {
    previousLink = '[' + newVersion + ']: ' + remoteUrl + '/tags/' + prefix + newVersion;
  }

  return {
    unreleased: '[Unreleased]: ' + remoteUrl + '/compare/master...' + prefix + newVersion,
    previous: previousLink
  };
}

const UriFunctions = {
  'github': githubUris,
  'gitlab': gitlabUris,
  'bitbucket': bitbucketUris,
}


function updateCompareUri(data, versionString, remote) {

  var remoteUrl;
  var uris = UriFunctions[remote](data, versionString);

  if (data.match(/\[Unreleased\]:/)) {
    return data.replace(/\[Unreleased\]:.*/, uris.unreleased + '\n' + uris.previous);
  }

  return data
    + '\n\n' + uris.unreleased 
    + '\n' + uris.previous;
}

module.exports = function versionChangelog(data, { version, remote}, done) {

  try {

    // Add the heading for the new version number
    data = insertHeading(data, version);

    // Update the [Unreleased] URI
    // and add the new version URI
    data = updateCompareUri(data, version, remote ? remote : 'github');

    done(null, data);

  } catch (error) {
    done(error);
  }
}

module.exports.getVersionPrefix = getVersionPrefix;
