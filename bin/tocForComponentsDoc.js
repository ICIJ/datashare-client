const Handlebars = require('handlebars')
const glob = require('glob')
const { readFileSync, writeFileSync } = require('fs')
const { basename, join, relative } = require('path')
const { findIndex, filter, startsWith, trimStart } = require('lodash')

const RE_HEADER = /^#+(.*)$/
const RE_DESCRIPTION = /^>+(.*)$/
const DOC_PATH = join('public', 'docs')

const buildToc = Handlebars.compile(readFileSync('bin/DOCS.COMPONENTS.hbs', 'UTF-8'))
const joinToDoc = path => join(DOC_PATH, path)

function collectToc (files) {
  return files.map(filepath => {
    const content = readFileSync(filepath, 'UTF-8')
    const nonEmptyLines = content.split('\n').filter(l => l.length > 0)
    const fallbackTitle = basename(filepath, '.md')
    const titleIndex = findIndex(nonEmptyLines, l => l.match(RE_HEADER))
    const title = trimStart(nonEmptyLines[titleIndex], '# ') || fallbackTitle
    const nextToTitle = nonEmptyLines[titleIndex + 1] || ''
    const description = nextToTitle.match(RE_DESCRIPTION) ? trimStart(nextToTitle, '> ') : ''
    const path = relative(DOC_PATH, filepath)
    return { title, description, path }
  })
}

function widgetComponents () {
  return glob.sync(joinToDoc('/components/**/Widget*.md'))
}

function filterComponents () {
  return glob.sync(joinToDoc('/components/**/Filter!(s)*.md'))
}

function pageComponents () {
  return glob.sync(joinToDoc('/pages/**/*.md'))
}

function otherComponents () {
  const all = glob.sync(joinToDoc('/components/**/*.md'))
  return filter(all, f => {
    const sw = target => startsWith(basename(f), target)
    return sw('Filters') || !(sw('Filter') || sw('Widget'))
  })
}

const widgets = collectToc(widgetComponents())
const filters = collectToc(filterComponents())
const pages = collectToc(pageComponents())
const others = collectToc(otherComponents())
// Compile templates using components collections
const toc = buildToc({ widgets, filters, others, pages })
// Write the table of content for all components!
writeFileSync(joinToDoc('COMPONENTS.md'), toc)
