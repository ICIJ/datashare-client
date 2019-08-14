const frontmatter = require('front-matter')

module.exports = function metadataStripLoader (source) {
  this && this.cacheable && this.cacheable()
  const { body } = frontmatter(source)
  return body
}
