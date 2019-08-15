module.exports = {
  presets: [
    '@vue/app'
  ],
  plugins: [
    // This is needed so require.context (from Webpack) also works in Jest
    'transform-require-context'
  ]
}
