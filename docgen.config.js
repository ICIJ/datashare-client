const { join, basename, dirname } = require('path')
const { kebabCase } = require('lodash')
// This looks like it's a hack but in fact it's the documented way
// to import Webpack configuration:
// https://cli.vuejs.org/guide/webpack.html#using-resolved-config-as-a-file)
const { resolve: apiOptions } = require('@vue/cli-service/webpack.config.js')

module.exports = {
  componentsRoot: 'src/',
  components: '**/[A-Z]*.vue',
  outDir: 'dist/docs/vue/',
  getDestFile: (file, config) => {
    const outPath = dirname(file).split('/').map(kebabCase).join('/')
    const outFile = basename(file).replace(/\.vue$/, '.md')
    return join(config.outDir, `${outPath}/${outFile}`)
  },
  // inform vue-docgen-api of Webpack aliases
  apiOptions
}
