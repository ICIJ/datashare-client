#!/usr/bin/env node
/**
 * Escape stray curly braces in generated MDX so the MDX compiler does not read
 * them as JavaScript expressions (e.g. JSDoc prose `{ a, b }` would otherwise
 * fail to compile and drop the page from the Storybook sidebar).
 *
 * Braces are escaped only in prose — left untouched inside fenced code blocks,
 * inline code spans, HTML/JSX tags, and the ESM import/export header.
 *
 * Usage: node bin/dmd/escapeMdxBraces.cjs <file.mdx>  (rewrites in place)
 */
const { readFileSync, writeFileSync } = require('fs')

/**
 * Text a consumer emits, plus the index to resume from.
 * @typedef {{ output: string, end: number }} ConsumerStep
 */

// Three-or-more backticks/tildes; the captured marker must match to close.
const FENCE_DELIMITER = /^\s*(`{3,}|~{3,})/

// A real ESM statement (import-with-from, side-effect import, or export
// declaration), not prose that merely starts with "import"/"export".
const ESM_STATEMENT = /^\s*(import\b[\s\S]*\bfrom\s+['"]|import\s+['"]|export\s+(?:default|const|let|var|function|class|\{|\*))/

// Char that can follow `<` to make it a tag rather than a bare prose `<`.
const TAG_NAME_START = /[a-zA-Z/]/

// --- Atomic predicates --------------------------------------------------------

/**
 * @param {string} char
 * @returns {boolean}
 */
function isBrace(char) {
  return char === '{' || char === '}'
}

/**
 * Whether the char at `index` is already backslash-escaped in the source.
 * @param {string} text
 * @param {number} index
 * @returns {boolean}
 */
function isBackslashEscaped(text, index) {
  return text[index - 1] === '\\'
}

/**
 * Whether the `<` at `index` opens a tag (vs. a bare prose `<`).
 * @param {string} text
 * @param {number} index
 * @returns {boolean}
 */
function opensHtmlTag(text, index) {
  return text[index] === '<' && TAG_NAME_START.test(text[index + 1] ?? '')
}

// --- Single-step consumers ----------------------------------------------------
// Each reads one construct at `index`; null means "not my construct".

/**
 * Read an inline code span. A run of N backticks closes on the next N; an
 * unterminated run is a single literal backtick.
 * @param {string} text
 * @param {number} index
 * @returns {ConsumerStep|null}
 */
function consumeInlineCode(text, index) {
  if (text[index] !== '`') {
    return null
  }
  let runLength = 0
  while (text[index + runLength] === '`') {
    runLength += 1
  }
  const openingRun = text.slice(index, index + runLength)
  const closingIndex = text.indexOf(openingRun, index + runLength)
  if (closingIndex === -1) {
    return { output: openingRun, end: index + runLength }
  }
  const end = closingIndex + runLength
  return { output: text.slice(index, end), end }
}

/**
 * Read an HTML/JSX tag whole so its attribute expressions survive. An unclosed
 * tag runs to end-of-line.
 * @param {string} text
 * @param {number} index
 * @returns {ConsumerStep|null}
 */
function consumeHtmlTag(text, index) {
  if (!opensHtmlTag(text, index)) {
    return null
  }
  const closingIndex = text.indexOf('>', index)
  const end = closingIndex === -1 ? text.length : closingIndex + 1
  return { output: text.slice(index, end), end }
}

/**
 * Read one prose char, escaping an unescaped brace.
 * @param {string} text
 * @param {number} index
 * @returns {ConsumerStep}
 */
function consumeProseChar(text, index) {
  const char = text[index]
  if (isBrace(char) && !isBackslashEscaped(text, index)) {
    return { output: `\\${char}`, end: index + 1 }
  }
  return { output: char, end: index + 1 }
}

// --- Line and document walks --------------------------------------------------

/**
 * Escape stray braces in a prose line, dispatching each position to the first
 * consumer that claims it.
 * @param {string} line
 * @returns {string}
 */
function escapeBracesInProse(line) {
  let result = ''
  let index = 0
  while (index < line.length) {
    const step = consumeInlineCode(line, index)
      ?? consumeHtmlTag(line, index)
      ?? consumeProseChar(line, index)
    result += step.output
    index = step.end
  }
  return result
}

/**
 * The fence marker char if `line` is a fence delimiter, else null.
 * @param {string} line
 * @returns {string|null}
 */
function fenceMarkerOf(line) {
  const match = line.match(FENCE_DELIMITER)
  return match ? match[1][0] : null
}

/**
 * Next open-fence marker after seeing a fence delimiter line.
 * @param {string|null} openFenceMarker - currently open marker, or null
 * @param {string} marker - marker on the delimiter line
 * @returns {string|null}
 */
function toggleFence(openFenceMarker, marker) {
  if (openFenceMarker === null) {
    return marker
  }
  if (marker === openFenceMarker) {
    return null
  }
  return openFenceMarker
}

/**
 * Escape one line in the context of the open fence.
 * @param {string} line
 * @param {string|null} openFenceMarker
 * @returns {{ output: string, openFenceMarker: string|null }}
 */
function escapeLine(line, openFenceMarker) {
  // Fence delimiters toggle the block and are never escaped.
  const marker = fenceMarkerOf(line)
  if (marker) {
    return { output: line, openFenceMarker: toggleFence(openFenceMarker, marker) }
  }
  // Fenced-block content and ESM statements stay verbatim.
  if (openFenceMarker !== null || ESM_STATEMENT.test(line)) {
    return { output: line, openFenceMarker }
  }
  return { output: escapeBracesInProse(line), openFenceMarker }
}

/**
 * Escape a whole MDX document; fence state is the only thing carried across lines.
 * @param {string} source
 * @returns {string}
 */
function escapeMdx(source) {
  const escapedLines = []
  let openFenceMarker = null
  for (const line of source.split('\n')) {
    const step = escapeLine(line, openFenceMarker)
    escapedLines.push(step.output)
    openFenceMarker = step.openFenceMarker
  }
  return escapedLines.join('\n')
}

/**
 * CLI: rewrite the MDX file named on the command line in place.
 * @returns {void}
 */
function main() {
  const file = process.argv[2]
  if (!file) {
    process.stderr.write('Usage: escapeMdxBraces.cjs <file.mdx>\n')
    process.exit(1)
  }
  writeFileSync(file, escapeMdx(readFileSync(file, 'utf8')))
}

// Run as a CLI, but stay importable (no side effects) for tests.
if (require.main === module) {
  main()
}

module.exports = { escapeMdx }
