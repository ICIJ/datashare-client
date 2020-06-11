const Handlebars = require('handlebars')
const { execSync } = require('child_process')
const { readFileSync, writeFileSync } = require('fs')
const { capitalize, compact } = require('lodash')
const { basename, join } = require('path')
const { repository } = require('../package.json')

const DOC_PATH = join('public', 'docs', 'client')

const build = Handlebars.compile(readFileSync('bin/DOCS.HOOKS.hbs', 'UTF-8'))
const joinToDoc = path => join(DOC_PATH, path)

function srcToGithubWikiPath(src) {
  const name = basename(src, '.vue')
  const path = src.split('/').slice(1, -1).map(capitalize).join('-›-')
  return `Client-›-${path}-›-${name}`
}

// Collect hook occurences with `git grep`
const occurences = execSync('git grep --line --only-matching --no-color --extended-regexp \'<hook name="(.*:\\w*)"\'').toString()
// Each line is an occurence, with 3 columns separated by :
const hooks = compact(occurences.split('\n')).map(occurence => {
  const path = occurence.split(':')[0]
  const line = occurence.split(':')[1]
  const match = occurence.split(':').slice(2).join(':')
  const hook = (match.match(/\"(.*:\w*)\"/) || [])[1]
  const wikiPath = srcToGithubWikiPath(path)
  const href = new URL(`blob/master/${path}#L${line}`, repository.url)
  return { path, href, line, wikiPath, hook }
})

// Build templates using components collections
const content = build({ hooks })
// Write the table of content for all components!
writeFileSync(joinToDoc('Client-›-Hooks.md'), content)
