const Handlebars = require('handlebars')
const glob = require('glob')
const { readFileSync, writeFileSync } = require('fs')
const { basename, join, relative } = require('path')
const { findIndex, filter, startsWith, trimStart } = require('lodash')

const RE_HEADER = /^#+(.*)$/
const RE_DESCRIPTION = /^>+(.*)$/
const DOC_PATH = join('dist', 'docs', 'vue')

class ComponentDocumentation {
  constructor() {
    this.widgetsIgnore = ['**/README.md']
    this.filtersIgnore = ['**/README.md']
    this.pagesIgnore = ['**/README.md']
    this.othersIgnore = ['**/README.md']
  }

  /**
   * Build the table of contents (TOC) using the template file
   * @returns {Array} The array of TOC objects containing title, description, and path information.
   */
  buildToc() {
    const templateContent = readFileSync('bin/dmd/vue.hbs', 'UTF-8')
    const compiledTemplate = Handlebars.compile(templateContent)
    return compiledTemplate(this.collectAllTocs())
  }

  /**
   * Collects the table of contents (TOC) for the specified files.
   * @param {Array} files - The files to collect TOC from.
   * @returns {Array} The array of TOC objects containing title, description, and path information.
   */
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
      return { title, description, path }
    })
  }

  /**
   * Collects the table of contents (TOC) for all component collections.
   * @returns {Object} The object containing TOCs for each component collection.
   */
  collectAllTocs() {
    return this.entries.reduce((result, [key, value]) => {
      result[key] = this.collectToc(value)
      return result
    }, {})
  }

  /**
   * Retrieves the component collections as key-value pairs.
   * @returns {Array<Array<string, Array>>} The array of component collections as key-value pairs.
   */
  get entries() {
    return Object.entries({
      widgets: this.widgets,
      filters: this.filters,
      pages: this.pages,
      others: this.others
    })
  }

  /**
   * Retrieves the paths to widget files.
   * @returns {Array} The array of widget file paths.
   */
  get widgets() {
    return glob.sync(join(DOC_PATH, 'components/widget/*.md'), { ignore: this.widgetsIgnore })
  }

  /**
   * Retrieves the paths to filter files.
   * @returns {Array} The array of filter file paths.
   */
  get filters() {
    return glob.sync(join(DOC_PATH, 'components/filter/types/Filter*.md'), { ignore: this.filtersIgnore })
  }

  /**
   * Retrieves the paths to page files.
   * @returns {Array} The array of page file paths.
   */
  get pages() {
    return glob.sync(join(DOC_PATH, 'pages/*.md'), { ignore: this.pagesIgnore })
  }

  /**
   * Retrieves the paths to other component files.
   * @returns {Array} The array of other component file paths.
   */
  get others() {
    const all = glob.sync(join(DOC_PATH, 'components/*.md'), { ignore: this.othersIgnore })
    return filter(all, (f) => {
      const sw = (target) => startsWith(basename(f).split('/').pop(), target)
      return sw('filters') || !(sw('filter') || sw('widget'))
    })
  }
}

// Create an instance of the ComponentDocumentation class
const componentDocs = new ComponentDocumentation()
// Compile templates using component collections and generate the table of contents
const toc = componentDocs.buildToc()

// Write the table of contents for all components!
writeFileSync(join(DOC_PATH, 'README.md'), toc)
