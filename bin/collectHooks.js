const Handlebars = require('handlebars')
const { execSync } = require('child_process')
const { readFileSync, writeFileSync } = require('fs')
const { kebabCase, compact } = require('lodash')
const { basename, join, relative } = require('path')

const { repository } = require('../package.json')

const DOC_PATH = join('dist', 'docs')
const SRC_PATH = join('src')

const build = Handlebars.compile(readFileSync('bin/DOCS.HOOKS.hbs', 'UTF-8'))
const joinToDoc = (path) => join(DOC_PATH, path)

function srcToDocumentationPath(src) {
  const name = basename(src, '.vue')
  const path = src.split('/').slice(0, -1).map(kebabCase).join('/')
  return `${path}/${name}.md`
}

// Collect hook occurrences with `git grep`
const occurrences = execSync('git grep --line --no-color --extended-regexp \'<hook name="(.*:\\w*)"\'').toString()
// Each line is an occurrence, with 3 columns separated by :
const hooks = compact(occurrences.split('\n')).map((occurrence) => {
  const component = occurrence.split(':')[0].split('/').slice(1).join('/')
  const line = occurrence.split(':')[1]
  const match = occurrence.split(':').slice(2).join(':')
  const hook = (match.match(/\"(.*:\w*)\"/) || [])[1]
  const path = srcToDocumentationPath(component)
  const source = new URL(`blob/master/src/${component}#L${line}`, repository.url)
  return { component, source, line, path, hook }
})

// Build templates using components collections
const content = build({ hooks })
// Write the table of content for all components!
writeFileSync(joinToDoc('hooks.md'), content)
