import { toValue } from 'vue'

// A fragment can carry percent escapes its author never completed (`#%C3`),
// which `decodeURIComponent` rejects outright. The raw text is then the only
// candidate id left to look for.
function decodeFragment(fragment) {
  try {
    return decodeURIComponent(fragment)
  }
  catch {
    return fragment
  }
}

/**
 * Scroll to the in-document target of a rendered markdown fragment link.
 *
 * The router keeps its state in the URL hash, so letting the browser follow
 * such a link would replace the route and drop the reader out of the document
 * they were reading. Clicks on anything else are left alone.
 *
 * @param {import('vue').MaybeRefOrGetter<HTMLElement>} container - The element holding the rendered markdown.
 * @returns {{ scrollToAnchor: (event: MouseEvent) => void }} Click handler for that element.
 */
export function useMarkdownAnchors(container) {
  const scrollToAnchor = (event) => {
    const anchor = event.target.closest('a[href^="#"]')
    if (!anchor) {
      return
    }
    event.preventDefault()
    const id = decodeFragment(anchor.hash.slice(1))
    const candidates = toValue(container)?.querySelectorAll('[id]') ?? []
    // Matched on the id property rather than through a `#id` selector: ids come
    // from the document's own headings, so they can hold characters a selector
    // would have to escape.
    const target = [...candidates].find(element => element.id === id)
    target?.scrollIntoView()
  }

  return { scrollToAnchor }
}
