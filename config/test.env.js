'use strict'
const merge = require('webpack-merge')
const devEnv = require('./dev.env')

const CONFIG = {
  es_index: '"datashare-testjs"',
  es_log: '"debug"',
  ds_host: null,
}

module.exports = merge(devEnv, {
  CONFIG,
  NODE_ENV: '"testing"'
})
