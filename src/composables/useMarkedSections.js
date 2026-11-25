import { shallowRef } from 'vue'

import { addSearchMarksClassesInHtml, foldWithSourceIndexes } from '@/utils/strings'

const MARK_SELECTOR = 'mark.local-search-term'

function foldText(element) {
  const { folded } = foldWithSourceIndexes(element.textContent)
  return folded
}

/**
 * The page elements a viewer rendered as html, and the search marks written into them.
 * Marking rewrites a page's html, so each page keeps the html it was collected with.
 *
 * @param {import('vue').Ref<HTMLElement>} container - The element holding the pages.
 * @param {string} selector - The selector of a page inside the container.
 * @returns {Object} `{ sections, collectSections, clearSections, findMatches, restoreOriginalHtml }`
 */
export function useMarkedSections(container, selector) {
  const sections = shallowRef([])
  const originalHtml = shallowRef([])
  const foldedText = shallowRef([])
  const markedSections = new Set()

  function collectSections() {
    sections.value = [...container.value.querySelectorAll(selector)]
    originalHtml.value = sections.value.map(({ innerHTML }) => innerHTML)
    foldedText.value = sections.value.map(foldText)
    markedSections.clear()
  }

  function clearSections() {
    sections.value = []
    markedSections.clear()
  }

  // Marking reparses and rebuilds a whole section, so a section that cannot
  // hold the term is only touched to take the previous term's marks back off.
  function isUntouched(index, folded) {
    const canHoldTerm = foldedText.value[index].includes(folded)
    return !canHoldTerm && !markedSections.delete(index)
  }

  function markSection(section, index, marks) {
    section.innerHTML = addSearchMarksClassesInHtml(originalHtml.value[index], marks)
    const count = section.querySelectorAll(MARK_SELECTOR).length
    if (count) {
      markedSections.add(index)
    }
    return count
  }

  // Marking starts from the original html, so the marks of the previous term
  // are not marked again by the next one.
  function findMatches(value) {
    const marks = [{ term: value }]
    const { folded } = foldWithSourceIndexes(value.trim())
    return sections.value.flatMap((section, index) => {
      if (isUntouched(index, folded)) {
        return []
      }
      const count = markSection(section, index, marks)
      return Array.from({ length: count }, () => ({ page: index + 1 }))
    })
  }

  function restoreOriginalHtml() {
    sections.value.forEach((section, index) => {
      section.innerHTML = originalHtml.value[index]
    })
    markedSections.clear()
  }

  return { sections, collectSections, clearSections, findMatches, restoreOriginalHtml }
}
