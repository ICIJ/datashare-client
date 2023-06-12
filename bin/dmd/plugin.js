const { join } = require('path')

module.exports = function () {
  return {
    partial: join(__dirname, '/partials/**/*.hbs'),
    helper: join(__dirname, '/helpers/**/*.js')
  }
}
