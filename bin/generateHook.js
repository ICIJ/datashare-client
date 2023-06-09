const Handlebars = require('handlebars')
const { execSync } = require('child_process')
const { readFileSync, writeFileSync } = require('fs')
const { kebabCase, compact } = require('lodash')
const { basename, join } = require('path')

const { repository } = require('../package.json')

const DOC_PATH = join('dist', 'docs')

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
 * Joins a path segment to the documentation path.
 * @param {string} pathSegment - The path segment to be joined.
 * @returns {string} The joined path.
 */
function joinToDoc(pathSegment) {
  return join(DOC_PATH, pathSegment)
}

/**
 * Converts the source file path to the documentation path.
 * @param {string} src - The source file path.
 * @returns {string} The documentation path.
 */
function srcToDocumentationPath(src) {
  const name = basename(src, '.vue')
  const path = src.split('/').slice(0, -1).map(kebabCase).join('/')
  return `vue/${path}/${name}.md`
}

/**
 * Collects hook occurrences using `git grep`.
 * @returns {Array} An array of hook objects containing component, source, line, path, and hook information.
 */
function collectHookOccurrences() {
  const occurrences = execSync('git grep --line --no-color --extended-regexp \'<hook name="(.*:\\w*)"\'').toString()
  return compact(occurrences.split('\n')).map((occurrence) => {
    const component = occurrence.split(':')[0].split('/').slice(1).join('/')
    const line = occurrence.split(':')[1]
    const match = occurrence.split(':').slice(2).join(':')
    const hook = (match.match(/\"(.*:\w*)\"/) || [])[1]
    const path = srcToDocumentationPath(component)
    const source = new URL(`blob/master/src/${component}#L${line}`, repository.url)
    return { component, source, line, path, hook }
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

/**
 * Writes the content to a file.
 * @param {string} filePath - The path to the file.
 * @param {string} content - The content to be written.
 */
function writeContentToFile(filePath, content) {
  writeFileSync(filePath, content)
}

// Compile the Handlebars template
const template = compileTemplate('bin/DOCS.HOOKS.hbs')
// Collect hook occurrences
const hooks = collectHookOccurrences()
// Build content using the template and hook collection
const content = buildContent(template, hooks)
// Write the content to a file
writeContentToFile(joinToDoc('hooks.md'), content)
