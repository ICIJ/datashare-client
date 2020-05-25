// This looks like it's a hack but in fact it's the documented way
// to import Webpack configuration:
// https://cli.vuejs.org/guide/webpack.html#using-resolved-config-as-a-file)
const { resolve: apiOptions } = require('@vue/cli-service/webpack.config.js')

module.exports = {
  componentsRoot: 'src/',
  components: '**/[A-Z]*.vue',
  outDir: 'public/docs/',
  // inform vue-docgen-api of Webpack aliases
  apiOptions
}
