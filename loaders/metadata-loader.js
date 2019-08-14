const frontmatter = require('front-matter')
const marked = require('marked')
const find = require('lodash/find')
const get = require('lodash/get')
const startCase = require('lodash/startCase')
const { basename, extname, relative } = require('path')

module.exports = function metadataLoader (source) {
  this && this.cacheable && this.cacheable()

  const metadata = {
    title: startCase(basename(this.resourcePath, '.md')),
    resourcePath: relative('./public/docs/', this.resourcePath)
  }

  if (extname(this.resourcePath) === '.md') {
    const { attributes, body } = frontmatter(source)
    const heading = find(marked.lexer(body), { type: 'heading', depth: 1 })
    const title = get(heading, 'text', metadata.title)
    Object.assign(metadata, { ...attributes, title })
  }

  return JSON.stringify(metadata)
}
