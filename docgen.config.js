const { join, basename, dirname } = require('path')
const { capitalize } = require('lodash')
// This looks like it's a hack but in fact it's the documented way
// to import Webpack configuration:
// https://cli.vuejs.org/guide/webpack.html#using-resolved-config-as-a-file)
const { resolve: apiOptions } = require('@vue/cli-service/webpack.config.js')

module.exports = {
  componentsRoot: 'src/',
  components: '**/[A-Z]*.vue',
  outDir: 'public/docs/client/',
  getDestFile: (file, config) => {
    const outPath = dirname(file).split('/').map(capitalize).join(' | ')
    const outFile = basename(file).replace(/\.vue$/, '.md')
    // Flattn structure to be display correctly by Github Wiki
    return join(config.outDir, `Client | ${outPath} | ${outFile}`)
  },
  // inform vue-docgen-api of Webpack aliases
  apiOptions
}
