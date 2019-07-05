const GitRevisionPlugin = require('git-revision-webpack-plugin')
const { join } = require('path')
const { setCookie } = require('tiny-cookie')

const resolve = filepath => join(__dirname, filepath)
const gitRevisionPlugin = new GitRevisionPlugin()

process.env.VUE_APP_GIT_VERSION = gitRevisionPlugin.version()
process.env.VUE_APP_GIT_HASH = gitRevisionPlugin.commithash()
process.env.VUE_APP_GIT_BRANCH = gitRevisionPlugin.branch()

module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  chainWebpack: config => {
    // Resource loader configuration:
    // 4 named rules must include this loader
    ['vue', 'vue-modules', 'normal', 'normal-modules'].forEach(rule => {
      config.module.rule('scss')
        .oneOf(rule)
        .use('sass-resources-loader')
        .loader('sass-resources-loader')
        .options({
          resources: [
            resolve('src/utils/settings.scss')
          ]
        })
    })

    // Use a specific loader for workers
    config.module.rule('worker')
      .test(/\.worker\.js$/)
      .use('worker-loader')
      .loader('worker-loader')

    // Aliases configuration
    config.resolve.alias
      .set('images', resolve('src/assets/images'))
      .set('node_modules', resolve('node_modules'))
      .set('mixins', resolve('src/mixins'))
      .set('tests', resolve('tests'))

    if (process.env.NODE_ENV === 'test') {
      // Log the user by default
      setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { 'login': 'TOKEN' }, JSON.stringify)
    }
  },
  devServer: {
    port: 9090
  }
}
