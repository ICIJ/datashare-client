const frontmatter = require('front-matter')
const marked = require('marked')
const filter = require('lodash/filter')
const find = require('lodash/find')
const get = require('lodash/get')
const startCase = require('lodash/startCase')
const { basename, extname, relative } = require('path')

// Use Marked slugger to build heading's anchors
const slugger = new marked.Slugger()

module.exports = function metadataLoader (source) {
  this && this.cacheable && this.cacheable()

  const metadata = {
    title: startCase(basename(this.resourcePath, '.md')),
    resourcePath: relative('./public/docs/', this.resourcePath)
  }

  if (extname(this.resourcePath) === '.md') {
    const { attributes, body } = frontmatter(source)
    const tokens = marked.lexer(body)
    const headings = filter(tokens, { type: 'heading' })
    const heading = find(headings, { depth: 1 })
    const title = get(heading, 'text', metadata.title)
    Object.assign(metadata, {
      title,
      ...attributes,
      headings: filter(headings, h => h.depth > 1).map(h => {
        return {
          text: h.text,
          id: slugger.slug(h.text)
        }
      })
    })
  }

  return JSON.stringify(metadata)
}
