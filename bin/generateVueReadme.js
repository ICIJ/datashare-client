const glob = require('glob')
const { writeFileSync } = require('fs')
const { capitalize } = require('lodash')

const components = {
  generateReadme() {
    this.directories.forEach((filepath) => {
      const title = filepath.split('/').slice(3, -1).map(capitalize).join(' - ')
      const readmepath = `${filepath}README.md`
      writeFileSync(readmepath, `# ${title}`)
    })
  },
  get directories() {
    const mark = true
    return glob.sync('dist/docs/vue/**/*/', { mark })
  }
}

components.generateReadme()
