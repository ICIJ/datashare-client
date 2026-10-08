/**
 * Whether the user's current text selection starts inside the given element.
 *
 * Highlighting text ends with a click, so any click handler sitting on a
 * selectable label must bail out when that click is only the release of a
 * sweep, instead of collapsing a row or opening what it points at.
 *
 * @param {Element} element - element the selection must be anchored in
 * @returns {boolean}
 */
export function hasSelectionWithin(element) {
  const selection = window.getSelection()

  if (!element || !selection || selection.isCollapsed) {
    return false
  }

  return element.contains(selection.anchorNode)
}
