module.exports = {
  env: {
    jest: true,
    node: true
  },
  extends: ['plugin:vue/strongly-recommended', 'standard', 'plugin:vue/essential', '@vue/standard', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'import/no-webpack-loader-syntax': 'off',
    'no-useless-escape': 'off',
    'lines-between-class-members': 'off',
    'template-curly-spacing': 'off',
    'vue/custom-event-name-casing': 'off',
    'import/no-extraneous-dependencies': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
