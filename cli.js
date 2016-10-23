#!/usr/bin/env node

var fs = require('fs');
var upath = require('upath');
var versionChangelog = require('./index');
var packageJson = require(upath.join(process.cwd(), 'package.json'));

var fileName = process.argv[2] || 'CHANGELOG.md';

if (!upath.isAbsolute(fileName)) {
  fileName = upath.normalize(upath.join(process.cwd(), fileName));
}

// Grab the current version of the package.
// When run as part of the `"version"` script
// (for example by `npm release`)
// it will be the _new_ version
var version = packageJson.version;

var data = fs.readFileSync(fileName, 'utf8');

versionChangelog(data, version, function(error, data) {

  if (error) {
    console.error(error.message || error.toString());
    process.exit(1);
  }

  fs.writeFileSync(fileName, data, 'utf8');

  process.exit(0);
});
