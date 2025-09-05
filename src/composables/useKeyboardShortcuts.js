import { computed, watch, ref, toRef } from 'vue'
import { useRoute } from 'vue-router'
import { castArray, compact, matches, noop } from 'lodash'
import { useMagicKeys } from '@vueuse/core'

import { getShortkeyOS } from '@/utils/utils'
import allShortcuts from '@/utils/keyboardShortcuts.json'

/**
 * Hook for managing keyboard shortcuts based on the current route.
 *
 * @returns {object} An object containing computed shortcuts and functions to watch for keyboard shortcut events.
 */
export const useKeyboardShortcuts = (magicKeysOptions = {}) => {
  const route = useRoute()
  const keys = useMagicKeys(magicKeysOptions)

  /**
   * Computed property returning an array of matched route names.
   * @type {import('vue').ComputedRef<string[]>}
   */
  const matchedRoutes = computed(() => {
    return compact(route.matched.map(match => match.name))
  })

  /**
   * Computed property filtering all available shortcuts based on the current route.
   * @type {import('vue').ComputedRef<Array>}
   */
  const routeShortcuts = computed(() => {
    return allShortcuts.filter(({ route = null }) => {
      return !route || castArray(route).some(name => matchedRoutes.value.includes(name))
    })
  })

  /**
   * A reactive reference to all available keyboard shortcuts.
   * @type {import('vue').Ref<Array>}
   */
  const shortcuts = toRef(allShortcuts)

  /**
   * Finds a shortcut from the route-specific shortcuts based on the provided action.
   *
   * @param {string} action - The action name to search for.
   * @returns {object|undefined} The shortcut object if found; otherwise, undefined.
   */
  function findRouteActionShortcut(action) {
    return routeShortcuts.value.find(matches({ action }))
  }

  /**
   * Finds a shortcut from all shortcuts based on the provided action.
   *
   * @param {string} action - The action name to search for.
   * @returns {object|undefined} The shortcut object if found; otherwise, undefined.
   */
  function findActionShortcut(action) {
    return shortcuts.value.find(matches({ action }))
  }

  /**
   * Retrieves the key combination for a given action from the route-specific shortcuts.
   *
   * @param {string} action - The action name.
   * @returns {Ref<boolean>} A ref set to true if the key is pressed. Unknown key will stay false.
   */
  function findRouteActionKey(action) {
    const os = getShortkeyOS()
    const shortcut = findRouteActionShortcut(action)
    const key = shortcut?.keys?.[os] ?? shortcut?.keys?.default ?? null
    return key ? keys[key.join('+')] : ref(false)
  }

  /**
   * Retrieves the key combination for a given action from all shortcuts.
   *
   * @param {string} action - The action name.
   * @returns {Ref<boolean>} A ref set to true if the key is pressed. Unknown key will stay false.
   */
  function findActionKey(action) {
    const os = getShortkeyOS()
    const shortcut = findActionShortcut(action)
    const key = shortcut?.keys?.[os] ?? shortcut?.keys?.default ?? null
    return key ? keys[key.join('+')] : ref(false)
  }

  /**
   * Watches the route-specific keyboard shortcut and executes the callback when the shortcut is activated.
   *
   * @param {string} action - The action name.
   * @param {Function} [callback=noop] - The callback to execute when the key combination is pressed.
   * @param {object} [options={}] - Options to pass to the Vue watch function.
   * @returns {Function|undefined} The unwatch function if a key exists; otherwise, undefined.
   */
  function watchRouteActionShortcut(action, callback = noop, options = {}) {
    const key = findRouteActionKey(action)
    // `key` is a ref, set to false if the key is not found.
    return watch(key, callback, options)
  }

  /**
   * Watches the keyboard shortcut (from all shortcuts) and executes the callback when the shortcut is activated.
   *
   * @param {string} action - The action name.
   * @param {Function} [callback=noop] - The callback to execute when the key combination is pressed.
   * @param {object} [options={}] - Options to pass to the Vue watch function.
   * @returns {Function|undefined} The unwatch function if a key exists; otherwise, undefined.
   */
  function watchActionShortcut(action, callback = noop, options = {}) {
    const key = findActionKey(action)
    // `key` is a ref, set to false if the key is not found.
    return watch(key, callback, options)
  }

  /**
   * Watches the route-specific keyboard shortcut and calls the callback when the shortcut is activated.
   *
   * @param {string} action - The action name.
   * @param {Function} [callback=noop] - The callback to execute when the shortcut is activated.
   * @param {object} [options={}] - Options to pass to the Vue watch function.
   * @returns {Function|undefined} The unwatch function if a key exists; otherwise, undefined.
   */
  function wheneverRouteActionShortcut(action, callback = noop, options = {}) {
    return watchRouteActionShortcut(action, pressed => pressed && callback(), options)
  }

  /**
   * Watches the keyboard shortcut (from all shortcuts) and calls the callback when the shortcut is activated.
   *
   * @param {string} action - The action name.
   * @param {Function} [callback=noop] - The callback to execute when the shortcut is activated.
   * @param {object} [options={}] - Options to pass to the Vue watch function.
   * @returns {Function|undefined} The unwatch function if a key exists; otherwise, undefined.
   */
  function wheneverActionShortcut(action, callback = noop, options = {}) {
    return watchActionShortcut(action, pressed => pressed && callback(), options)
  }

  return {
    routeShortcuts,
    shortcuts,
    findRouteActionKey,
    findActionKey,
    watchRouteActionShortcut,
    watchActionShortcut,
    wheneverRouteActionShortcut,
    wheneverActionShortcut
  }
}
