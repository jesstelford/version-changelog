#!/usr/bin/env node

var fs = require('fs');
var upath = require('upath');
var versionChangelog = require('./index');
var packageJson = require(upath.join(process.cwd(), 'package.json'));
var minimist = require('minimist');

var argv = minimist(process.argv.slice(2));

var validRemotes = ['bitbucket', 'github', 'gitlab'];

var fileName = argv._[0] || 'CHANGELOG.md';
var remote = validRemotes.indexOf(argv.remote) !== -1 ? argv.remote : 'github';

if (!upath.isAbsolute(fileName)) {
  fileName = upath.normalize(upath.join(process.cwd(), fileName));
}

// Grab the current version of the package.
// When run as part of the `"version"` script
// (for example by `npm release`)
// it will be the _new_ version
var version = packageJson.version;

var data = fs.readFileSync(fileName, 'utf8');

versionChangelog(data, { version: version, remote: remote }, function(error, data) {

  if (error) {
    console.error(error.message || error.toString());
    process.exit(1);
  }

  fs.writeFileSync(fileName, data, 'utf8');

  process.exit(0);
});
