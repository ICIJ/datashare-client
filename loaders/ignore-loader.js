module.exports = function ignoreLoader (content) {
  this && this.cacheable && this.cacheable()
  return ''
}
