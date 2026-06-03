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
// The shape requirement is what keeps prose that merely starts with the word
// "import"/"export" from being mistaken for code.
const ESM_STATEMENT = /^\s*(import\b[\s\S]*\bfrom\s+['"]|import\s+['"]|export\s+(?:default|const|let|var|function|class|\{|\*))/

// A `<` only opens a tag when the next char could start a tag name (or is a
// closing-tag slash). A bare `<` in prose ("when a < b") must not be read as a
// tag, or it would disable brace escaping for the rest of the line.
const TAG_NAME_START = /[a-zA-Z/]/

// Read the inline code span beginning at `start` (a backtick). A span opens
// with a run of N backticks and closes on the next identical run. An
// unterminated run is treated as a single literal backtick rather than code
// running to end-of-line, so a stray backtick never swallows later braces.
function readInlineCodeSpan(text, start) {
  let runLength = 0
  while (text[start + runLength] === '`') {
    runLength += 1
  }
  const openingRun = text.slice(start, start + runLength)
  const closingIndex = text.indexOf(openingRun, start + runLength)
  if (closingIndex === -1) {
    return { span: openingRun, end: start + runLength }
  }
  const end = closingIndex + runLength
  return { span: text.slice(start, end), end }
}

// Whether the char at `index` opens an HTML/JSX tag (vs. a bare prose `<`).
function opensHtmlTag(text, index) {
  return text[index] === '<' && TAG_NAME_START.test(text[index + 1] ?? '')
}

// A brace that MDX would evaluate: not already backslash-escaped at the source.
function isUnescapedBrace(text, index) {
  const char = text[index]
  return (char === '{' || char === '}') && text[index - 1] !== '\\'
}

// Escape stray braces in a single line of prose, stepping over inline code
// spans and the contents of HTML/JSX tags (e.g. `src={img}`) so their braces
// stay verbatim.
function escapeBracesInProse(line) {
  let result = ''
  let index = 0
  let insideTag = false
  while (index < line.length) {
    const char = line[index]

    // Inline code is opaque: copy the whole span and resume after it.
    if (char === '`') {
      const { span, end } = readInlineCodeSpan(line, index)
      result += span
      index = end
      continue
    }

    // Track tag boundaries so attribute expressions are preserved.
    if (opensHtmlTag(line, index)) {
      insideTag = true
    }
    else if (char === '>') {
      insideTag = false
    }

    if (!insideTag && isUnescapedBrace(line, index)) {
      result += `\\${char}`
    }
    else {
      result += char
    }
    index += 1
  }
  return result
}

// The fence marker char (`` ` `` or `~`) if `line` is a fence delimiter, else null.
function fenceMarkerOf(line) {
  const match = line.match(FENCE_DELIMITER)
  return match ? match[1][0] : null
}

// Walk the document line by line, escaping prose braces while leaving fenced
// code blocks and the ESM header untouched. Fence state is the only thing that
// must carry across lines, so the walk is an explicit fold over that marker.
function escapeMdx(source) {
  const escapedLines = []
  let openFenceMarker = null

  for (const line of source.split('\n')) {
    const marker = fenceMarkerOf(line)

    // Fence delimiters toggle the code block and are themselves never escaped.
    if (marker) {
      if (openFenceMarker === null) {
        openFenceMarker = marker
      }
      else if (marker === openFenceMarker) {
        openFenceMarker = null
      }
      escapedLines.push(line)
    }
    // Inside a fenced block, or on an ESM statement, the line stays verbatim.
    else if (openFenceMarker !== null || ESM_STATEMENT.test(line)) {
      escapedLines.push(line)
    }
    // Everything else is prose.
    else {
      escapedLines.push(escapeBracesInProse(line))
    }
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
