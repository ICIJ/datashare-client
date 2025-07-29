import { computed, useId, toRef, getCurrentInstance } from 'vue'
import { debounce, noop } from 'lodash'

import { useWaitStore } from '@/store/modules/wait'

export function useWait({ throttle = 0, scoped = false } = {}) {
  const waitStore = useWaitStore()
  const loaderId = useId()
  const isLoading = computed(() => waiting(loaderId))
  const isReady = computed(() => !isLoading.value)
  const { uid } = getCurrentInstance()

  /**
   * If the composable is scoped, we use the uid of the component
   * to ensure the loaders are unique to the component.
   *
   * @private
   * @type {string}
   */
  const scopeKey = computed(() => (scoped ? uid : null))

  /**
   * Get the value of a loader
   *
   * @private
   * @param {string|Ref}
   * @return {boolean|undefined} - The value of the loader
   */
  const get = id => waitStore.get(scopeKey, id)

  /**
   * Set the value of a loader
   * @param {string|Ref} id - The loader id
   * @param {boolean} value - The value to set
   * @return {boolean} - The value of the loader
   */
  const set = (id, value) => waitStore.set(scopeKey, id, value)

  /**
   * Set the value of a loader with a debounce
   *
   * @private
   * @param {string|Ref}
   * @param {boolean} value - The value to set
   * @return {boolean} - The value of the loader
   */
  const debouncedSet = throttle ? debounce(set, throttle) : set

  /**
   * Start a loader
   *
   * @public
   * @param {string|Ref} id - The loader id
   */
  function start(id) {
    debouncedSet(id, true)
  }

  /**
   * End a loader
   *
   * @public
   * @param {string|Ref} id - The loader id
   */
  function end(id) {
    debouncedSet(id, false)
  }

  /**
   * Check if a loader is active
   *
   * @public
   * @param {string|Ref} id - The loader id
   * @return {boolean} - True if the loader is active=
   */
  function waiting(id) {
    return !!get(id)
  }

  /**
   * Wait for a function to finish and start a loader
   *
   * @private
   * @param {string|Ref} id - The loader id
   * @param {function} fn - The function to wait for
   * @return {function} - A function that starts the loader and waits for the function to finish
   */
  function waitForLoader(id, fn) {
    const idRef = toRef(id)

    return async (...args) => {
      start(idRef)
      // We need to wrap the function in a promise to it can be used as a promise
      return Promise.resolve(fn(...args)).finally(() => end(idRef))
    }
  }

  /**
   * Wait for a function to finish and start a loader
   *
   * @public
   * @param {function|string} fnOrId - The loader id or function to wait for
   * @param {function} fn - The function to wait for
   *
   * @return {function} - A function that starts the loader and waits for the function to finish
   */
  function waitFor(fnOrId, fn = noop) {
    if (typeof fnOrId === 'function') {
      return waitForLoader(loaderId, fnOrId)
    }

    if (typeof fnOrId === 'string' && typeof fn === 'function') {
      return waitForLoader(fnOrId, fn)
    }

    throw new Error('The first argument must be a function or a string')
  }

  return { waitFor, isLoading, isReady, loaderId, start, end, waiting }
}
