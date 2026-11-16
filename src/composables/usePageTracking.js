import { computed, shallowRef } from 'vue'
import { useDebounceFn, useEventListener } from '@vueuse/core'

const SCROLL_IDLE_DELAY = 200
const SCROLL_KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']
const FORM_CONTROLS = 'input, textarea, select, [contenteditable]'

/**
 * Whether a key press scrolls the document, as opposed to moving a caret inside a form control:
 * a space typed in the search field must not count as the reader scrolling away.
 *
 * @param {KeyboardEvent} event - The key press to test.
 * @returns {boolean}
 */
function scrollsDocument({ key, target }) {
  return SCROLL_KEYS.includes(key) && !target?.closest?.(FORM_CONTROLS)
}

/**
 * Tracks the page a viewer of stacked pages shows under its sticky toolbox, and scrolls to the
 * page picked in that toolbox.
 *
 * @param {object} options
 * @param {Function} options.getPageElement - Returns the element of a page from its 1-based number.
 * @returns {{ page: import('vue').WritableComputedRef<number>, trackPage: Function, holdPageTracking: Function, reset: Function }}
 */
export function usePageTracking({ getPageElement }) {
  const currentPage = shallowRef(1)
  const pendingPage = shallowRef(null)
  const realignPendingPage = shallowRef(false)
  const visiblePages = new Set()

  function topmostVisiblePage() {
    return visiblePages.size ? Math.min(...visiblePages) : currentPage.value
  }

  function followViewport() {
    if (pendingPage.value === null) {
      currentPage.value = topmostVisiblePage()
    }
  }

  function scrollPageIntoView(value, behavior = 'auto') {
    const target = getPageElement(value)
    target?.scrollIntoView({ behavior, block: 'start' })
    return !!target
  }

  /**
   * Gives up on the pending page and hands the tracking straight back to the viewport, so a scroll
   * started by hand is never undone by the pending page settling behind it.
   */
  function releasePendingPage() {
    pendingPage.value = null
    followViewport()
  }

  const settleScroll = useDebounceFn(() => {
    if (pendingPage.value === null) {
      return
    }
    // Pages render lazily while a smooth scroll runs and each resizes by a fraction of a pixel, which
    // is enough for a page pick to land short of its target.
    if (realignPendingPage.value) {
      scrollPageIntoView(pendingPage.value, 'instant')
      currentPage.value = pendingPage.value
      pendingPage.value = null
    }
    else {
      releasePendingPage()
    }
  }, SCROLL_IDLE_DELAY)

  useEventListener(window, 'scroll', settleScroll, { capture: true, passive: true })
  useEventListener(window, ['wheel', 'touchmove', 'pointerdown'], releasePendingPage, { passive: true })
  useEventListener(window, 'keydown', event => scrollsDocument(event) && releasePendingPage())

  /**
   * Holds the page tracking until the scroll we are about to start has settled, so the indicator
   * stays on the page we are heading to instead of counting every page the scroll flies past.
   *
   * @param {number} value - The page that scroll is heading to.
   * @param {object} [options]
   * @param {boolean} [options.realign=false] - Whether that page must be aligned again once the scroll has settled.
   * @param {boolean} [options.jump=false] - Whether the indicator moves to that page before the scroll settles.
   */
  function holdPageTracking(value, { realign = false, jump = false } = {}) {
    if (jump) {
      currentPage.value = value
    }
    pendingPage.value = value
    realignPendingPage.value = realign
    settleScroll()
  }

  /**
   * Records whether a page shows, and follows the topmost one that does unless a scroll of ours
   * is in flight.
   *
   * @param {number} value - The page reporting itself.
   * @param {boolean} visible - Whether that page shows.
   */
  function trackPage(value, visible) {
    if (visible) {
      visiblePages.add(value)
    }
    else {
      visiblePages.delete(value)
    }
    followViewport()
  }

  function scrollToPage(value) {
    if (scrollPageIntoView(value)) {
      holdPageTracking(value, { realign: true, jump: true })
    }
  }

  // Swapped pages never report they stopped showing, and a hold left over would settle against
  // pages that are not there anymore.
  function reset(value = currentPage.value) {
    visiblePages.clear()
    pendingPage.value = null
    realignPendingPage.value = false
    currentPage.value = value
  }

  const page = computed({
    get: () => currentPage.value,
    set: scrollToPage
  })

  return { page, trackPage, holdPageTracking, reset }
}
