import { computed } from 'vue'
import { useParentElement } from '@vueuse/core'

/**
 * Recursively finds the scrollable parent of a given node.
 *
 * @param {HTMLElement} node - The element to start searching from.
 * @param {HTMLElement} [topLevelParent=document.body] - The top-level parent to stop searching at.
 * @returns {HTMLElement} - The first scrollable parent element found, or document.body if none is found.
 */
function getScrollParent(node, topLevelParent = document.body) {
  if (!node || node === document.documentElement || node === topLevelParent) {
    return topLevelParent
  }

  if (node.scrollHeight > node.clientHeight) {
    return node
  }

  return getScrollParent(node.parentNode, topLevelParent)
}

/**
 * Composable to find the scroll parent of an element, optionally looking for the closest modal.
 *
 * @param {Object} options - Options for the composable.
 * @param {boolean} options.closestModal - Whether to look for the closest modal as the scroll parent.
 * @param {HTMLElement} options.topLevelParent - The top-level parent element to stop searching at. Defaults to `document.body`.
 * @returns {ComputedRef<HTMLElement>} - A computed reference to the scroll parent element.
 */
export function useScrollParent({ closestModal = true, topLevelParent = document.body } = {}) {
  const parent = useParentElement()
  return computed(() => {
    // In case we are using this composable from a modal, we can use the modal as the scroll parent
    // directly to ensure that the scroll is contained within the modal.
    const modal = closestModal ? parent.value?.closest('.modal') : null
    return modal || getScrollParent(parent.value, topLevelParent)
  })
}
