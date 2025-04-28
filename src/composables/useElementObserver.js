import { useMutationObserver } from '@vueuse/core'

/**
 * Composable providing functions to await DOM element creation or destruction.
 */
export function useElementObserver(target = window.document) {
  /**
   * Waits until an element matching `selector` is created in the DOM.
   *
   * @param selector - The CSS selector to match.
   * @param timeout - Maximum wait time in milliseconds (default: Infinity).
   * @returns <Promise> Resolves when the element is created or rejects on timeout.
   */
  async function waitForElementCreated(selector, timeout = Infinity) {
    return new Promise((resolve, reject) => {
      const element = target.querySelector(selector)

      if (element) {
        resolve(element)
        return
      }

      function createTimeout() {
        return setTimeout(() => {
          stop()
          reject(new Error(`Element '${selector}' not created within timeout`))
        }, timeout)
      }

      function callback() {
        const el = target.querySelector(selector)
        if (el) {
          stop()
          clearTimeout(timeoutId)
          resolve(el)
        }
      }

      const options = { childList: true, subtree: true }
      const { stop } = useMutationObserver(target, callback, options)
      const timeoutId = timeout === Infinity ? null : createTimeout()
    })
  }

  /**
   * Waits until an element matching `selector` is removed from the DOM.
   *
   * @param selector - The CSS selector to match.
   * @param timeout - Maximum wait time in milliseconds (default: Infinity).
   * @returns <Promise> Resolves when the element is removed or rejects on timeout.
   */
  function waitForElementDestroyed(selector, timeout = Infinity) {
    return new Promise((resolve, reject) => {
      const element = target.querySelector(selector)
      if (!element) {
        resolve()
        return
      }

      function createTimeout() {
        return setTimeout(() => {
          stop()
          reject(new Error(`Element '${selector}' not destroyed within timeout`))
        }, timeout)
      }

      function callback() {
        const el = target.querySelector(selector)
        if (!el) {
          stop()
          clearTimeout(timeoutId)
          resolve()
        }
      }

      const options = { childList: true, subtree: true }
      const { stop } = useMutationObserver(target, callback, options)
      const timeoutId = timeout === Infinity ? null : createTimeout()
    })
  }

  return {
    waitForElementCreated,
    waitForElementDestroyed
  }
}
