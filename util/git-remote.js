var spawn = require('cross-spawn');

function gitRemote() {
  var remoteUrl = spawn.sync('git', ['config', '--get', 'remote.origin.url']).stdout.toString().trim();

  if (!remoteUrl) {
    throw new Error('Unable to determine origin URL for adding to changelog - ensure you have initialized a git repository');
  }

  return remoteUrl;
}

module.exports = gitRemote;
