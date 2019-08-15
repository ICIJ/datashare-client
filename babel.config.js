module.exports = {
  presets: [
    '@vue/app'
  ],
  env: {
    test: {
      plugins: [
        // "require.context()" is transformed into a dummy function so the code can
        // run safely outside of the Webpack environment.
        'transform-require-context'
      ]
    }
  }

}
