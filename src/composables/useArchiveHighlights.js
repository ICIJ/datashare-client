import { onBeforeUnmount, toValue, watch } from 'vue'

import { findFoldedMatches, foldForFilter } from '@/utils/strings'

const TERM_HIGHLIGHT = 'archive-search-term'
const ACTIVE_TERM_HIGHLIGHT = 'archive-search-term-active'

function isSupported() {
  return !!globalThis.CSS?.highlights
}

// Highlights live in a registry shared by the whole page, so each viewer adds
// and removes only its own ranges to leave those of another viewer intact.
function findOrCreateHighlight(name) {
  const { highlights } = globalThis.CSS
  if (!highlights.has(name)) {
    highlights.set(name, new Highlight())
  }
  return highlights.get(name)
}

function rangesOf(label, foldedTerm) {
  const text = label.firstChild
  if (!text) {
    return []
  }
  return findFoldedMatches(text.data, foldedTerm).map(({ start, end }) => {
    const range = new Range()
    range.setStart(text, start)
    range.setEnd(text, end)
    return range
  })
}

/**
 * Paints the search term in the entry names of an archive tree with the CSS
 * Custom Highlight API, the entry holding the active match in its own color.
 *
 * @param {Object} options
 * @param {MaybeRefOrGetter<HTMLElement>} options.root - The element holding the tree
 * @param {Ref<string>} options.term - The term the matches were found for
 * @param {Ref<string|null>} options.activeKey - The key of the entry holding the active match
 * @param {Array<WatchSource>} options.repaintOn - Changes adding or removing entries on screen
 */
export function useArchiveHighlights({ root, term, activeKey, repaintOn }) {
  let paintedRanges = new Map()

  function highlightNameOf(key) {
    return key === activeKey.value ? ACTIVE_TERM_HIGHLIGHT : TERM_HIGHLIGHT
  }

  function moveRanges(key, from, to) {
    for (const range of paintedRanges.get(key) ?? []) {
      findOrCreateHighlight(from).delete(range)
      findOrCreateHighlight(to).add(range)
    }
  }

  function paintLabel(label, foldedTerm) {
    const key = label.closest('[data-archive-entry]')?.dataset.archiveEntry
    const ranges = rangesOf(label, foldedTerm)
    const highlight = findOrCreateHighlight(highlightNameOf(key))
    ranges.forEach(range => highlight.add(range))
    paintedRanges.set(key, [...(paintedRanges.get(key) ?? []), ...ranges])
  }

  function paintTerms() {
    if (!isSupported()) {
      return
    }
    clearTerms()
    const foldedTerm = foldForFilter(term.value)
    const labels = foldedTerm ? toValue(root)?.querySelectorAll('[data-entry-name]') ?? [] : []
    labels.forEach(label => paintLabel(label, foldedTerm))
  }

  function moveActiveTerms(key, previousKey) {
    if (!isSupported()) {
      return
    }
    moveRanges(previousKey, ACTIVE_TERM_HIGHLIGHT, TERM_HIGHLIGHT)
    moveRanges(key, TERM_HIGHLIGHT, ACTIVE_TERM_HIGHLIGHT)
  }

  function clearTerms() {
    for (const range of [...paintedRanges.values()].flat()) {
      globalThis.CSS.highlights.get(TERM_HIGHLIGHT)?.delete(range)
      globalThis.CSS.highlights.get(ACTIVE_TERM_HIGHLIGHT)?.delete(range)
    }
    paintedRanges = new Map()
  }

  watch(activeKey, moveActiveTerms, { flush: 'post' })
  watch([term, ...repaintOn], paintTerms, { flush: 'post' })
  onBeforeUnmount(clearTerms)
}
