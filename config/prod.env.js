'use strict'

const CONFIG = {
  es_index: '"datashare"',
  es_log: '"error"',
  data_prefix: '"/data/"',
  ds_auth_signin: '"/auth/xemx/signin"',
  ds_cookie_name: '"_ds_session_id"',
  ds_auth_signout: '"/auth/signout"'
}

module.exports = {
  NODE_ENV: '"production"',
  CONFIG
}
