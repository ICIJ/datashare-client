const path = require('path')
const config = require('../config')
const packageConfig = require('../package.json')

exports.assetsPath = function (_path) {
  var assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  var cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }

  var sassResourcesLoader =  {
    loader: 'sass-resources-loader',
    options: {
      resources: path.join(__dirname, '..', 'src/utils/settings.scss')
    }
  };

  function loaderFor(lang, loaderOptions) {
    var loaders = [cssLoader]

    if (lang) {
      loaders.push({
        loader: lang + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      });
    }

    return {
      lang,
      loaders,
      append() {
        loaders = loaders.concat(...arguments)
        return this;
      },
      prepend() {
        loaders = [...arguments].concat(loaders)
        return this;
      },
      get() {
        // Temporarly disabled
        if (options.extractTextPlugin) {
          return options.extractTextPlugin.extract({
            use: loaders,
            fallback: 'vue-style-loader'
          })
        } else {
          return ['vue-style-loader'].concat(loaders)
        }
      }
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: loaderFor().get(),
    postcss: loaderFor().get(),
    less: loaderFor('less').get(),
    sass: loaderFor('sass', { indentedSyntax: true }).get(),
    scss: loaderFor('sass').append(sassResourcesLoader).get(),
    stylus: loaderFor('stylus').get(),
    styl: loaderFor('stylus').get()
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  var output = []
  var loaders = exports.cssLoaders(options)
  for (var extension in loaders) {
    var loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}
