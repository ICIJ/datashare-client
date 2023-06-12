module.exports = function () {
  return {
    partial: __dirname + "/partials/**/*.hbs",
    helper: __dirname + "/helpers/**/*.js"
  }
}