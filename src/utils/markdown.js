import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'

// Tags that can fetch a remote resource (tracking/exfiltration) or embed
// active content. None are emitted by GFM markdown, but we strip them from
// the allowlist so the sanitizer stays safe even if the pipeline changes.
const blockedTags = ['img', 'picture', 'source', 'svg', 'video', 'audio', 'iframe', 'object', 'embed']

// Strict allowlist: a clone of rehype-sanitize's GitHub schema with the
// resource-fetching tags removed and rel/target allowed on anchors so the
// link-hardening plugin's attributes survive sanitization.
const schema = structuredClone(defaultSchema)
schema.tagNames = schema.tagNames.filter(tag => !blockedTags.includes(tag))
for (const tag of blockedTags) {
  delete schema.attributes[tag]
}
schema.attributes.a = [...(schema.attributes.a || []), 'target', 'rel']
// remark-rehype already namespaces footnote ids/hrefs with `user-content-`;
// disable the sanitizer's own clobber prefix so ids are not prefixed twice
// (which would break footnote navigation by desyncing href from id).
schema.clobberPrefix = ''

// http(s) and protocol-relative URLs are the only ones that leave the app.
const externalHref = /^(https?:)?\/\//i

// Harden only external anchors so they cannot reach back into the opener or
// leak the referrer. Same-page (#fragment) and relative links are left intact
// so in-document navigation (e.g. GFM footnotes) keeps working.
function rehypeHardenLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') {
        return
      }
      const href = node.properties?.href
      if (typeof href === 'string' && externalHref.test(href)) {
        node.properties.rel = ['noopener', 'noreferrer', 'nofollow']
        node.properties.target = '_blank'
      }
    })
  }
}

// The rows and cells a header is made of; anything else inside it is content.
const tableStructureTags = ['tr', 'th', 'td']

function isEmptyHeader(node) {
  return (node.children ?? []).every((child) => {
    if (child.type === 'text') {
      return child.value.trim() === ''
    }
    return tableStructureTags.includes(child.tagName) && isEmptyHeader(child)
  })
}

// normalizeHeaderlessTables synthesizes a header row purely so remark-gfm's
// grammar accepts the table; that row carries no real data and must not reach
// the reader. A header row the document does contain but leaves blank (authors
// write those for column alignment) is indistinguishable from it here, and
// renders the same either way: one empty row of cells, so it goes too.
function rehypeDropEmptyTableHeader() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'thead' && isEmptyHeader(node)) {
        parent.children.splice(index, 1)
        return index
      }
    })
  }
}

// Built once and reused. remarkRehype defaults allowDangerousHtml:false, so raw
// HTML embedded in the markdown is dropped before it can reach the output.
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeHardenLinks)
  .use(rehypeDropEmptyTableHeader)
  .use(rehypeSanitize, schema)
  .use(rehypeStringify)

// A GFM delimiter cell: one or more dashes, optionally anchored by alignment
// colons. A bare "---" line has no pipe at all, so it stays a thematic break.
const delimiterCellPattern = /^:?-+:?$/

// A bullet or ordered list marker. "- |" satisfies the delimiter-cell grammar
// but remark parses it as a list, so the marker is ruled out first.
const listItemPattern = /^\s*(?:[-*+]|\d{1,9}[.)])\s/

// The opening (or closing) line of a fenced code block: up to 3 leading
// spaces, then 3+ backticks or 3+ tildes.
const fenceLinePattern = /^\s{0,3}(`{3,}|~{3,})/

// 4+ leading spaces (or a leading tab) make a line part of an indented code
// block, not a table, regardless of what precedes it.
const indentedCodePattern = /^(?: {4}|\t)/

function splitCells(line) {
  const withoutEdgePipes = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return withoutEdgePipes.split('|')
}

function isDelimiterRow(line) {
  if (!line.includes('|') || listItemPattern.test(line)) {
    return false
  }
  return splitCells(line).every(cell => delimiterCellPattern.test(cell.trim()))
}

// GFM needs a row below the delimiter row as well. Without one, synthesizing a
// header builds a table with no body, and the reader loses the line's own text.
function isTableBodyRow(line) {
  return line !== undefined && line.includes('|')
}

// A table block is headerless when its delimiter row is preceded by a blank line
// (or nothing, at the very start of the document): a real header would be the
// non-blank line right above it instead.
function startsHeaderlessTable(lines, index) {
  const line = lines[index]
  const previousLine = lines[index - 1]
  const isAtBlockStart = previousLine === undefined || previousLine.trim() === ''
  return isAtBlockStart
    && !indentedCodePattern.test(line)
    && isDelimiterRow(line)
    && isTableBodyRow(lines[index + 1])
}

// An empty-cell header row with the same cell count as the delimiter row it
// will sit above, so the pair together forms a syntactically valid GFM table.
function buildEmptyHeaderRow(delimiterLine) {
  const cellCount = splitCells(delimiterLine).length
  return `|${new Array(cellCount).fill(' ').join('|')}|`
}

/**
 * Insert a synthesized empty header row above any GFM table delimiter row
 * that starts a table block without one. remark-gfm requires a header row
 * above the delimiter row to recognize a table at all; some real-world
 * documents omit it, so those lines would otherwise render as a plain
 * paragraph instead of a table.
 *
 * @param {string} source - Raw markdown text.
 * @returns {string} The rewritten markdown.
 */
export function normalizeHeaderlessTables(source) {
  const lines = source.split('\n')
  const normalizedLines = []
  // Tracked so a delimiter-looking line inside a fenced code block (a code
  // sample, not a table) is never touched. Non-null means "inside a fence".
  let closeFencePattern = null

  lines.forEach((line, index) => {
    if (closeFencePattern) {
      if (closeFencePattern.test(line)) {
        closeFencePattern = null
      }
      normalizedLines.push(line)
      return
    }

    const fenceOpenMatch = line.match(fenceLinePattern)
    if (fenceOpenMatch) {
      const fence = fenceOpenMatch[1]
      closeFencePattern = new RegExp(`^\\s{0,3}${fence[0]}{${fence.length},}\\s*$`)
      normalizedLines.push(line)
      return
    }

    if (startsHeaderlessTable(lines, index)) {
      normalizedLines.push(buildEmptyHeaderRow(line))
    }
    normalizedLines.push(line)
  })

  return normalizedLines.join('\n')
}

/**
 * Convert Markdown source to sanitized, safe-to-render HTML.
 *
 * Processing is asynchronous so a large document never blocks the main thread.
 *
 * @param {string} source - Raw markdown text.
 * @returns {Promise<string>} Sanitized HTML (empty string for empty input).
 */
export async function renderMarkdown(source) {
  if (!source) {
    return ''
  }
  return String(await processor.process(normalizeHeaderlessTables(source)))
}
