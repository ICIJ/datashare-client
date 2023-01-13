const Handlebars = require('handlebars')
const { execSync } = require('child_process')
const { readFileSync, writeFileSync } = require('fs')
const { capitalize, compact } = require('lodash')
const { basename, join } = require('path')
const { repository } = require('../package.json')

const DOC_PATH = join('dist', 'docs')

const build = Handlebars.compile(readFileSync('bin/DOCS.HOOKS.hbs', 'UTF-8'))
const joinToDoc = (path) => join(DOC_PATH, path)

function srcToGithubWikiPath(src) {
  const name = basename(src, '.vue')
  const path = src.split('/').slice(1, -1).map(capitalize).join('-›-')
  return `Client-›-${path}-›-${name}`
}

// Collect hook occurrences with `git grep`
const occurrences = execSync('git grep --line --no-color --extended-regexp \'<hook name="(.*:\\w*)"\'').toString()
// Each line is an occurrence, with 3 columns separated by :
const hooks = compact(occurrences.split('\n')).map((occurrence) => {
  const path = occurrence.split(':')[0]
  const line = occurrence.split(':')[1]
  const match = occurrence.split(':').slice(2).join(':')
  const hook = (match.match(/\"(.*:\w*)\"/) || [])[1]
  const wikiPath = srcToGithubWikiPath(path)
  const href = new URL(`blob/master/${path}#L${line}`, repository.url)
  return { path, href, line, wikiPath, hook }
})

// Build templates using components collections
const content = build({ hooks })
// Write the table of content for all components!
writeFileSync(joinToDoc('Client-›-Hooks.md'), content)
