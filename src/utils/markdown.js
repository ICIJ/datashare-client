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
 * Processing is asynchronous so a large document never blocks the main thread.
 *
 * @param {string} source - Raw markdown text.
 * @returns {Promise<string>} Sanitized HTML (empty string for empty input).
 */
export async function renderMarkdown(source) {
  if (!source) {
    return ''
  }
  return String(await processor.process(source))
}
