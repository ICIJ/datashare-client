import { camelCase } from 'lodash'
import { defineStore } from 'pinia'

/**
 * Generate a store id with a suffix. If no suffix is provided the default
 * store id is used instead.
 *
 * @param {string} id - The store id
 * @param {string} suffix - The suffix to append to the store id
 * @returns {string}
 */
export const storeSuffix = (id, suffix) => (suffix ? camelCase(`${id}-${suffix}`) : id)

/**
 * Creates a `useStore` function that retrieves the store instance with the
 * given id. The store id can be suffixed with the given suffix which
 * allows to create multiple instances of the same store. The prototype
 * of this function is the same as `defineStore` from Pinia.
 *
 * @param id - id of the store (must be unique)
 * @param storeSetup - function that defines the store
 * @param options - extra options
 */
export const defineSuffixedStore = (id, storeSetup, options) => {
  /**
   * Create a new store with the given suffix. If no suffix is provided
   * the default store is used instead.
   *
   * @param {string} suffix - The suffix to append to the store id.
   * @returns {Store} - The unique store instance.
   */
  const createSuffixedStore = (suffix) => {
    const suffixedId = storeSuffix(id, suffix)
    const useStore = defineStore(suffixedId, storeSetup, options)
    // Return the store with an additional property to identify it
    // in the store registry. It is important to assign this property
    // after the store is created so Pinia can properly retreive it
    // when using helpers function such as `mapStores` or `mapGetters`.
    return Object.assign(useStore, { $id: suffixedId })
  }

  // Create the default store with the given id.
  const useSuffixedStore = createSuffixedStore()

  /**
   * Add a closure function to create a new store with the same id
   * and the given suffix. This is useful when you want to pass the
   * store as a function.
   *
   * @param {string} suffix - The suffix to append to the store id.
   * @returns {function} - A function that creates a new store with the given suffix.
   */
  useSuffixedStore.bind = (suffix) => {
    const suffixedId = storeSuffix(useSuffixedStore.$id, suffix)
    const useStore = createSuffixedStore(suffix)
    return Object.assign(useStore, { $id: suffixedId })
  }

  /**
   * Create a new store with the given suffix. If no suffix is provided
   * the default store is used instead.
   *
   * @param {string} suffix - The suffix to append to the store id.
   * @returns {Store} - The unique store instance.
   */
  useSuffixedStore.call = (suffix) => {
    return useSuffixedStore.bind(suffix).call()
  }

  return useSuffixedStore
}
