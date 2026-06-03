#!/usr/bin/env node
/**
 * Escape stray curly braces in generated MDX so Storybook's MDX compiler does
 * not try to evaluate them as JavaScript expressions.
 *
 * jsdoc-to-markdown happily emits JSDoc prose like `... to a { a, b } object`.
 * In Markdown that is literal text, but MDX treats `{ a, b }` as an expression
 * and fails to compile with errors such as "a is not defined", taking the whole
 * page out of the Storybook sidebar.
 *
 * Only braces that live in prose are escaped. They are left untouched inside:
 *   - fenced code blocks (``` ... ```), e.g. @example snippets
 *   - inline code spans (`...`)
 *   - HTML/JSX tags (`<img src={imported} />`), which are intentional
 *   - the ESM import/export header MDX hands to acorn
 *
 * Usage: node bin/dmd/escapeMdxBraces.cjs <file.mdx>  (rewrites the file in place)
 */
const { readFileSync, writeFileSync } = require('fs')

// A fence delimiter line opens or closes a code block with three-or-more
// backticks or tildes; the marker char must match to close the block it opened.
const FENCE_DELIMITER = /^\s*(`{3,}|~{3,})/

// A real ESM statement, as MDX emits at the top of a doc: an import with a
// `from '...'` clause, a bare side-effect import, or an export declaration.
// The shape requirement keeps prose that merely starts with the word
// "import"/"export" from being mistaken for code.
const ESM_STATEMENT = /^\s*(import\b[\s\S]*\bfrom\s+['"]|import\s+['"]|export\s+(?:default|const|let|var|function|class|\{|\*))/

// A `<` only opens a tag when the next char could start a tag name (or is a
// closing-tag slash). A bare `<` in prose ("when a < b") is not a tag.
const TAG_NAME_START = /[a-zA-Z/]/

// --- Atomic predicates --------------------------------------------------------

function isBrace(char) {
  return char === '{' || char === '}'
}

function isBackslashEscaped(text, index) {
  return text[index - 1] === '\\'
}

function opensHtmlTag(text, index) {
  return text[index] === '<' && TAG_NAME_START.test(text[index + 1] ?? '')
}

// --- Single-step consumers (each returns `{ output, end }` or null) -----------
//
// A consumer reads one construct starting at `index` and reports the text to
// emit plus the index to resume from. Returning null means "not my construct".

// Inline code is opaque. A span opens with a run of N backticks and closes on
// the next identical run; an unterminated run is a single literal backtick, so
// a stray ` never swallows the rest of the line.
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

// An HTML/JSX tag is copied whole so its attribute expressions (`src={img}`)
// survive. An unclosed tag runs to end-of-line, matching how MDX treats it.
function consumeHtmlTag(text, index) {
  if (!opensHtmlTag(text, index)) {
    return null
  }
  const closingIndex = text.indexOf('>', index)
  const end = closingIndex === -1 ? text.length : closingIndex + 1
  return { output: text.slice(index, end), end }
}

// A single prose char: escape an unescaped brace, otherwise pass it through.
function consumeProseChar(text, index) {
  const char = text[index]
  if (isBrace(char) && !isBackslashEscaped(text, index)) {
    return { output: `\\${char}`, end: index + 1 }
  }
  return { output: char, end: index + 1 }
}

// --- Line and document walks --------------------------------------------------

// Escape stray braces in a single prose line by dispatching each position to
// the first consumer that claims it.
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

// The fence marker char (`` ` `` or `~`) if `line` is a fence delimiter, else null.
function fenceMarkerOf(line) {
  const match = line.match(FENCE_DELIMITER)
  return match ? match[1][0] : null
}

// Next open-fence marker after seeing a fence delimiter line.
function toggleFence(openFenceMarker, marker) {
  // No block open yet: this delimiter opens one.
  if (openFenceMarker === null) {
    return marker
  }
  // Same marker as the open block: it closes.
  if (marker === openFenceMarker) {
    return null
  }
  // A different marker inside a block is just content.
  return openFenceMarker
}

// Escape one line in the context of the currently open fence, reporting the
// line to emit and the fence state to carry forward.
function escapeLine(line, openFenceMarker) {
  // Fence delimiters toggle the block and are themselves never escaped.
  const marker = fenceMarkerOf(line)
  if (marker) {
    return { output: line, openFenceMarker: toggleFence(openFenceMarker, marker) }
  }
  // Inside a fenced block, or on an ESM statement, the line stays verbatim.
  if (openFenceMarker !== null || ESM_STATEMENT.test(line)) {
    return { output: line, openFenceMarker }
  }
  // Everything else is prose.
  return { output: escapeBracesInProse(line), openFenceMarker }
}

// Walk the document line by line; fence state is the only thing carried across.
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

// Rewrite the MDX file named on the command line in place.
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
