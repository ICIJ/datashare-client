'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  CONFIG: {
    es_host: '"elasticsearch:9200"',
    es_index: '"local-datashare"'
  }
})
