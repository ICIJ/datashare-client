const frontmatter = require('front-matter')
const marked = require('marked')
const filter = require('lodash/filter')
const find = require('lodash/find')
const get = require('lodash/get')
const startCase = require('lodash/startCase')
const xss = require('xss')
const { basename, extname, relative } = require('path')

function slugger (value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
    .replace(/\s/g, '-')
}

module.exports = function metadataLoader (source) {
  this && this.cacheable && this.cacheable()

  const resourcePath = relative('./public/docs/', this.resourcePath)
  const slug = resourcePath.replace(/\.md$/, '').split('/').map(slugger).join('-')
  const metadata = { resourcePath, slug }

  if (extname(this.resourcePath) === '.md') {
    const { attributes, body } = frontmatter(source)
    const tokens = marked.lexer(body)
    const headings = filter(tokens, { type: 'heading' })
    const heading = find(headings, { depth: 1 })
    const title = get(heading, 'text', startCase(basename(resourcePath, '.md')))
    Object.assign(metadata, {
      title,
      ...attributes,
      headings: filter(headings, h => h.depth > 1).map(h => {
        const text = xss(marked(h.text), { stripIgnoreTag: true, whiteList: {} })
        const id = slugger(text)
        return { text, id }
      })
    })
  }

  return JSON.stringify(metadata)
}
