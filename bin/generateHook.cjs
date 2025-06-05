const Handlebars = require('handlebars')
const { execSync } = require('child_process')
const { readFileSync } = require('fs')
const { compact } = require('lodash')

const { repository } = require('../package.json')

/**
 * Compiles the Handlebars template.
 * @param {string} templatePath - The path to the Handlebars template file.
 * @returns {Function} The compiled Handlebars template function.
 */
function compileTemplate(templatePath) {
  const templateContent = readFileSync(templatePath, 'UTF-8')
  return Handlebars.compile(templateContent)
}

/**
 * Collects hook occurrences using `git grep`.
 * @returns {Array} An array of hook objects containing component, source, line, and hook information.
 */
function collectHookOccurrences() {
  const occurrences = execSync('git grep --line --no-color --extended-regexp \'<hook name="(.*:\\w*)"\'').toString()
  return compact(occurrences.split('\n')).map((occurrence) => {
    const component = occurrence.split(':')[0].split('/').slice(1).join('/')
    const line = occurrence.split(':')[1]
    const match = occurrence.split(':').slice(2).join(':')
    const hook = (match.match(/\"(.*:\w*)\"/) || [])[1]
    const source = new URL(`blob/master/src/${component}#L${line}`, repository.url)
    return { component, source, line, hook }
  })
}

/**
 * Builds the content using the Handlebars template and the hook collection.
 * @param {Function} template - The compiled Handlebars template function.
 * @param {Array} hooks - The collection of hook objects.
 * @returns {string} The built content.
 */
function buildContent(template, hooks) {
  return template({ hooks })
}

// Compile the Handlebars template
const template = compileTemplate('bin/dmd/hooks.hbs')
// Collect hook occurrences
const hooks = collectHookOccurrences()
// Build content using the template and hook collection
const content = buildContent(template, hooks)
// Output hooks document to stdout

console.log(content)
