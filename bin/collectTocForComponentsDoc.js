const Handlebars = require('handlebars')
const glob = require('glob')
const { readFileSync, writeFileSync } = require('fs')
const { basename, join, relative } = require('path')
const { findIndex, filter, isArrayLike, startsWith, trimStart } = require('lodash')

const RE_HEADER = /^#+(.*)$/
const RE_DESCRIPTION = /^>+(.*)$/
const DOC_PATH = join('public', 'docs', 'client')

const buildToc = Handlebars.compile(readFileSync('bin/DOCS.COMPONENTS.hbs', 'UTF-8'))
const joinToDoc = (path) => join(DOC_PATH, path)

const components = {
  collectToc(files) {
    return files.map((filepath) => {
      const content = readFileSync(filepath, 'UTF-8')
      const nonEmptyLines = content.split('\n').filter((l) => l.length > 0)
      const fallbackTitle = basename(filepath, '.md')
      const titleIndex = findIndex(nonEmptyLines, (l) => l.match(RE_HEADER))
      const title = trimStart(nonEmptyLines[titleIndex], '# ') || fallbackTitle
      const nextToTitle = nonEmptyLines[titleIndex + 1] || ''
      const description = nextToTitle.match(RE_DESCRIPTION) ? trimStart(nextToTitle, '> ') : ''
      const path = relative(DOC_PATH, filepath)
      const wikiPath = basename(filepath, '.md')
      return { title, description, path, wikiPath }
    })
  },
  collectAllTocs() {
    return Object.entries(this).reduce((result, [key, value]) => {
      if (isArrayLike(value)) {
        result[key] = this.collectToc(value)
      }
      return result
    }, {})
  },
  get widgets() {
    return glob.sync(joinToDoc('Client-›-Components-›-Widget*.md'))
  },
  get filters() {
    return glob.sync(joinToDoc('Client-›-Components-›-Filter-›-Types-›-Filter*.md'))
  },
  get pages() {
    return glob.sync(joinToDoc('Client-›-Pages-›-*.md'))
  },
  get others() {
    const all = glob.sync(joinToDoc('Client-›-Components-›-*.md'))
    return filter(all, (f) => {
      const sw = (target) => startsWith(basename(f).split('-›-').pop(), target)
      return sw('Filters') || !(sw('Filter') || sw('Widget'))
    })
  }
}

// Compile templates using components collections
const toc = buildToc(components.collectAllTocs())
// Write the table of content for all components!
writeFileSync(joinToDoc('Client-›-Table of Content.md'), toc)
