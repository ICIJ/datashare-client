const glob = require('glob');
const { basename } = require('path');
const { lstatSync, readFileSync } = require('fs');
const { startCase, findIndex, trimEnd } = require('lodash');

/**
 * Generates a Markdown list from items.
 * @param {Array} items - The items to generate the list from.
 * @param {number} depth - The depth of the list (optional, default is 0).
 * @returns {string} The generated Markdown list.
 */
function generateMarkdownList(items, depth = 0) {
  const indent = ' '.repeat(depth * 2);
  let markdown = '';
  for (const item of items) {
    if (item.children) {
      markdown += `${indent}* [${item.title}](${item.wikiPath})\n`;
      markdown += generateMarkdownList(item.children, depth + 1);
    } else {
      markdown += `${indent}* [${item.title}](${item.wikiPath})\n`;
    }
  }
  return trimEnd(markdown);
}

/**
 * Generates the Vue summary by retrieving directories and mapping nested directories.
 * @returns {Array} The generated Vue summary.
 */
function generateVueSummary() {
  return getDirectories('dist/docs/vue').map(nestedDirectories.bind(this));
}

/**
 * Recursively maps nested directories.
 * @param {string} path - The path of the directory.
 * @returns {Object} The mapped nested directory.
 */
function nestedDirectories(path) {
  const title = startCase(basename(path, '.md')).split(' ').join('');
  if (lstatSync(path).isDirectory()) {
    const wikiPath = path.replace('dist/docs/', 'developers/client/') + 'README.md';
    const children = getDirectories(path).map(nestedDirectories.bind(this));
    return { path, wikiPath, title, children };
  }
  const wikiPath = path.replace('dist/docs/', 'developers/client/');
  return { path, wikiPath, title };
}

/**
 * Retrieves directories based on the provided path.
 * @param {string} path - The path to search for directories.
 * @returns {Array} The retrieved directories.
 */
function getDirectories(path) {
  const globPath = `${trimEnd(path, '/')}/*{/,.md}`;
  const mark = true;
  const ignore = ['**/README.md'];
  return glob.sync(globPath, { ignore, mark });
}

/**
 * Removes the sublist from the summary.
 * @param {Array} summaryLines - The lines of the summary.
 * @param {number} vueComponentsItemIndex - The index of the "Vue components" line.
 * @param {number} nextItemIndex - The index of the next line at the same level of indentation.
 * @returns {Array} The summary lines without the sublist.
 */
function removeSublistFromSummary(summaryLines, vueComponentsItemIndex, nextItemIndex) {
  const summaryLinesWithoutSublist = [...summaryLines.slice(0, vueComponentsItemIndex + 1), ...summaryLines.slice(nextItemIndex + 1)];
  return summaryLinesWithoutSublist;
}

/**
 * Finds the index of the "Vue components" line in the summary.
 * @param {Array} summaryLines - The lines of the summary.
 * @returns {number} The index of the "Vue components" line.
 */
function findVueComponentsItemIndex(summaryLines) {
  const vueComponentsToken = '* [Vue components](developers/client/vue/README.md)';
  return findIndex(summaryLines, line => line.includes(vueComponentsToken));
}

/**
 * Counts the spaces at the beginning of a line.
 * @param {string} line - The line to count the spaces from.
 * @returns {number} The number of spaces at the beginning of the line.
 */
function countIndents(line) {
  return line?.split('*').shift().length;
}

/**
 * Finds the index of the next line at the same level of indentation.
 * @param {Array} summaryLines - The lines of the summary.
 * @param {number} vueComponentsItemIndex - The index of the "Vue components" line.
 * @param {number} vueComponentsIndents - The number of spaces at the beginning of the "Vue components" line.
 * @returns {number} The index of the next line at the same level of indentation.
 */
function findNextItemIndex(summaryLines, vueComponentsItemIndex, vueComponentsIndents) {
  const relativeNextItemIndex = findIndex(summaryLines.slice(vueComponentsItemIndex + 1), line => {
    return line.length - line.trimStart().length <= vueComponentsIndents;
  });
  return relativeNextItemIndex < -1 ? summaryLines.length : relativeNextItemIndex + vueComponentsItemIndex + 1;
}

/**
 * Updates the summary with a new item list.
 * @param {string} newItemList - The new item list to append.
 * @param {string} summary - The original summary.
 * @returns {string} The updated summary.
 */
function updateSummaryWithNewItemList(newItemList, summary) {
  const lines = summary.split('\n');
  const itemIndex = findVueComponentsItemIndex(lines);
  const indentCount = countIndents(lines[itemIndex]);
  const nextIndex = findNextItemIndex(lines, itemIndex, indentCount);

  const linesWithoutSublist = removeSublistFromSummary(lines, itemIndex, nextIndex);

  linesWithoutSublist.splice(itemIndex + 1, 0, newItemList);

  const updatedSummary = linesWithoutSublist.join('\n');

  return updatedSummary;
}

if (process.stdin.isTTY) {
  console.log("No input available in stdin.");
  process.exit(1);
}

// Build the sublist to append to the summary
const newItemList = generateMarkdownList(generateVueSummary(), 2);
// Read from stdin, STDIN_FILENO = 0
const summary = readFileSync(0).toString();
const updatedSummary = updateSummaryWithNewItemList(newItemList, summary);
// Print out to STDOUT
console.log(updatedSummary);
