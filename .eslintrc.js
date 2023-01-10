module.exports = {
  env: {
    jest: true,
    node: true
  },
  extends: ['standard', 'plugin:vue/recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'import/no-webpack-loader-syntax': 'off',
    'no-useless-escape': 'off',
    'lines-between-class-members': 'off',
    'template-curly-spacing': 'off',
    'vue/custom-event-name-casing': 'off',
    'import/no-extraneous-dependencies': 'off',
    'vue/require-default-prop': 'off',
    'vue/no-v-html': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
