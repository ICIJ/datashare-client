import { computed } from 'vue'
import { useParentElement } from '@vueuse/core'

/**
 * Recursively finds the scrollable parent of a given node.
 *
 * @param {HTMLElement} node - The element to start searching from.
 * @returns {HTMLElement} - The first scrollable parent element found, or document.body if none is found.
 */
function getScrollParent(node) {
  if (node == null) {
    return document.body
  }

  if (node.scrollHeight > node.clientHeight) {
    return node
  }

  return getScrollParent(node.parentNode)
}

/**
 * Composable to find the scroll parent of an element, optionally looking for the closest modal.
 *
 * @param {Object} options - Options for the composable.
 * @param {boolean} options.closestModal - Whether to look for the closest modal as the scroll parent.
 * @returns {ComputedRef<HTMLElement>} - A computed reference to the scroll parent element.
 */
export function useScrollParent({ closestModal = true } = {}) {
  const parent = useParentElement()
  return computed(() => {
    // In case we are using this composable from a modal, we can use the modal as the scroll parent
    // directly to ensure that the scroll is contained within the modal.
    const modal = closestModal ? parent.value?.closest('.modal') : null

    return getScrollParent(modal || parent.value)
  })
}
