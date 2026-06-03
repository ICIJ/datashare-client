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
 * We only escape braces that live in prose. Braces are left untouched inside:
 *   - fenced code blocks (``` ... ```), e.g. @example snippets
 *   - inline code spans (`...`)
 *   - HTML/JSX tags (`<img src={imported} />`), which are intentional
 *
 * Usage: node bin/dmd/escapeMdxBraces.cjs <file.mdx>  (rewrites the file in place)
 */
const { readFileSync, writeFileSync } = require('fs')

const FENCE = /^\s*(`{3,}|~{3,})/

function escapeProse(text) {
  let out = ''
  let i = 0
  let inTag = false
  while (i < text.length) {
    const char = text[i]

    // Skip inline code spans: a run of N backticks closes on the next run of N.
    // An unterminated run is treated as a literal backtick, NOT as code running
    // to end-of-line — otherwise a stray backtick would leave later braces raw.
    if (char === '`') {
      let ticks = 0
      while (text[i + ticks] === '`') ticks += 1
      const open = text.slice(i, i + ticks)
      const close = text.indexOf(open, i + ticks)
      if (close === -1) {
        out += open
        i += ticks
        continue
      }
      const end = close + ticks
      out += text.slice(i, end)
      i = end
      continue
    }

    // Track HTML/JSX tags so attribute expressions (src={img}) are preserved.
    // Only a `<` that opens an actual tag (followed by a tag-name char or `/`)
    // counts — a bare `<` in prose (e.g. "when a < b") must not disable escaping.
    if (char === '<' && /[a-zA-Z/]/.test(text[i + 1] ?? '')) inTag = true
    else if (char === '>') inTag = false

    if (!inTag && (char === '{' || char === '}') && text[i - 1] !== '\\') {
      out += '\\' + char
    }
    else {
      out += char
    }
    i += 1
  }
  return out
}

function escapeMdx(source) {
  const lines = source.split('\n')
  let inFence = false
  let fenceMarker = ''
  return lines
    .map((line) => {
      const match = line.match(FENCE)
      if (match) {
        const marker = match[1][0]
        if (!inFence) {
          inFence = true
          fenceMarker = marker
        }
        else if (marker === fenceMarker) {
          inFence = false
        }
        return line
      }
      // Leave MDX's ESM section alone: `import { Meta } from ...` is real
      // JavaScript that acorn must parse, not prose. Match actual statements
      // (an import with a `from '...'` / side-effect import, or an export
      // declaration) so prose that merely starts with "import"/"export" is
      // still escaped.
      if (/^\s*(import\b[\s\S]*\bfrom\s+['"]|import\s+['"]|export\s+(?:default|const|let|var|function|class|\{|\*))/.test(line)) {
        return line
      }
      return inFence ? line : escapeProse(line)
    })
    .join('\n')
}

const file = process.argv[2]
if (!file) {
  process.stderr.write('Usage: escapeMdxBraces.cjs <file.mdx>\n')
  process.exit(1)
}
writeFileSync(file, escapeMdx(readFileSync(file, 'utf8')))
