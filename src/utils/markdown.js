import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'

// Strict allowlist: clone of rehype-sanitize's GitHub schema with images
// removed (no remote-image tracking/exfiltration) and rel/target allowed on
// anchors so the link-hardening plugin's attributes survive sanitization.
const schema = structuredClone(defaultSchema)
schema.tagNames = schema.tagNames.filter((tag) => tag !== 'img')
delete schema.attributes.img
schema.attributes.a = [...(schema.attributes.a || []), 'target', 'rel']

// Force every surviving anchor to open safely.
function rehypeHardenLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a') {
        node.properties = node.properties || {}
        node.properties.rel = ['noopener', 'noreferrer', 'nofollow']
        node.properties.target = '_blank'
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
  .use(rehypeSanitize, schema)
  .use(rehypeStringify)

/**
 * Convert Markdown source to sanitized, safe-to-render HTML.
 *
 * @param {string} source - Raw markdown text.
 * @returns {string} Sanitized HTML (empty string for empty input).
 */
export function renderMarkdown(source) {
  if (!source) {
    return ''
  }
  return String(processor.processSync(source))
}

export default renderMarkdown
