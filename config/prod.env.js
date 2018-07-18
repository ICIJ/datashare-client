'use strict'
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const gitRevisionPlugin = new GitRevisionPlugin()

const CONFIG = {
  es_index: '"datashare"',
  es_log: '"error"',
  data_prefix: '"/data/"',
  ds_auth_signin: '"/auth/xemx/signin"',
  ds_cookie_name: '"_ds_session_id"',
  ds_auth_signout: '"/auth/signout"',
  git_version: JSON.stringify(gitRevisionPlugin.version()),
  git_hash: JSON.stringify(gitRevisionPlugin.commithash()),
  git_branch: JSON.stringify(gitRevisionPlugin.branch()),
}

module.exports = {
  NODE_ENV: '"production"',
  CONFIG
}
