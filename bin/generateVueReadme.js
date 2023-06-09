const glob = require('glob');
const { writeFileSync } = require('fs');
const { capitalize } = require('lodash');

/**
 * Generates README files for each directory.
 */
function generateReadme() {
  const directories = getDirectories();
  directories.forEach((filepath) => {
    const title = generateTitle(filepath);
    const readmepath = `${filepath}README.md`;
    writeReadmeFile(readmepath, title);
  });
}

/**
 * Retrieves the directories using glob.
 * @returns {string[]} An array of directory paths.
 */
function getDirectories() {
  const mark = true;
  return glob.sync('dist/docs/vue/**/*/', { mark });
}

/**
 * Generates the title for a directory based on the filepath.
 * @param {string} filepath - The directory filepath.
 * @returns {string} The generated title.
 */
function generateTitle(filepath) {
  const pathSegments = filepath.split('/').slice(3, -1);
  const capitalizedSegments = pathSegments.map(capitalize);
  return capitalizedSegments.join(' - ');
}

/**
 * Writes the README file with the given title.
 * @param {string} readmepath - The path to the README file.
 * @param {string} title - The title to be included in the README.
 */
function writeReadmeFile(readmepath, title) {
  const content = `# ${title}`;
  writeFileSync(readmepath, content);
}

generateReadme();
