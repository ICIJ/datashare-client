import { watch } from 'vue'

import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'

const MARK_SELECTOR = 'mark.local-search-term'
const ACTIVE_CLASS = 'local-search-term--active'

/**
 * The in-document search of a viewer whose pages hold search marks: highlights
 * and scrolls to the active occurrence, and holds the page it sits on.
 *
 * @param {object} options
 * @param {import('vue').Ref<HTMLElement>} options.container - The element holding the marks.
 * @param {Function} options.findMatches - Marks a term and returns its occurrences as `{ page }`.
 * @param {Function} options.restoreOriginalHtml - Takes every mark back off.
 * @param {Function} options.holdPageTracking - Holds the page indicator on a page.
 * @returns {Object} `{ term, activeIndex, occurrences, isLoading, refresh, reactivateMark }`
 */
export function useSectionLocalSearch({ container, findMatches, restoreOriginalHtml, holdPageTracking }) {
  const localSearch = useDocumentLocalSearch({ findMatches })
  const { term, activeIndex, matches, activePage } = localSearch

  function activateMark() {
    const marks = [...container.value.querySelectorAll(MARK_SELECTOR)]
    const active = marks[activeIndex.value - 1]
    marks.forEach(mark => mark.classList.toggle(ACTIVE_CLASS, mark === active))
    active?.scrollIntoView({ block: 'center' })
  }

  // Picking an occurrence scrolls its mark into view, so the page it sits on has
  // to be held the same way a page pick is.
  function holdActivePage() {
    if (activePage.value) {
      holdPageTracking(activePage.value, { jump: true })
    }
  }

  function reactivateMark() {
    holdActivePage()
    activateMark()
  }

  // A new term replaces the marks of the previous one without moving `activeIndex`, so the active
  // occurrence has to be picked again whenever either the match list or the index changes.
  watch([matches, activeIndex], activateMark)
  // The composable does not search an empty term, so nothing else would take the marks down.
  watch(term, (value) => {
    if (!value.trim()) {
      restoreOriginalHtml()
    }
  })
  watch(activePage, holdActivePage)

  const { occurrences, isLoading, refresh } = localSearch
  return { term, activeIndex, occurrences, isLoading, refresh, reactivateMark }
}
