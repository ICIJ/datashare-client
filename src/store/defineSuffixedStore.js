import { camelCase, uniqueId } from 'lodash'
import { provide, inject, onUnmounted } from 'vue'
import { defineStore } from 'pinia'

/**
 * Generate a store id with a suffix. If no suffix is provided the default
 * store id is used instead.
 *
 * @param {string} id - The store id
 * @param {string} suffix - The suffix to append to the store id
 * @returns {string}
 */
export const storeSuffix = (id, suffix) => camelCase(suffix ? `${id}-${suffix}` : id)

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

  // Create a unique provide key for this store
  const defaultProvideKey = camelCase(`${id}Suffix`)

  /**
   * Add a closure function to create a new store with the same id
   * and the given suffix. This is useful when you want to pass the
   * store as a function.
   *
   * @param {string} suffix - The suffix to append to the store id.
   * @param {string} provideKey - The key to provide the suffix in the component.
   * @returns {function} - A function that creates a new store with the given suffix.
   */
  useSuffixedStore.withSuffix = (suffix, provideKey = defaultProvideKey) => {
    provide(provideKey, suffix)
    const suffixedId = storeSuffix(useSuffixedStore.$id, suffix)
    const useStore = createSuffixedStore(suffix)
    return Object.assign(useStore, { $id: suffixedId })
  }

  /**
   * Create a new store with the given suffix. If no suffix is provided
   * the default store is used instead.
   *
   * @param {string} suffix - The suffix to append to the store id.
   * @param {string} provideKey - The key to provide the suffix in the component.
   * @returns {Store} - The unique store instance.
   */
  useSuffixedStore.create = (suffix, provideKey = defaultProvideKey) => {
    return useSuffixedStore.withSuffix(suffix, provideKey).call()
  }

  /**
   * Create a new store using the given provide key to inject the suffix.
   *
   * @param provideKey - The key to provide the suffix in the component.
   * @returns {Store} - The unique store instance.
   */
  useSuffixedStore.inject = (provideKey = defaultProvideKey) => {
    const suffix = inject(provideKey, null)
    return suffix ? useSuffixedStore.create(suffix) : useSuffixedStore()
  }

  /**
   * Create a new store with a unique suffix. This is useful when you want
   * to create a store that is disposed when the component is unmounted. This
   * function is a composable and can be used outside a setup function.
   *
   * @param {string} provideKey - The optional key to provide the suffix in the component.
   * @returns {Store} - The unique store instance.
   */
  useSuffixedStore.disposable = (provideKey = defaultProvideKey) => {
    const suffix = uniqueId('disposable')
    const store = useSuffixedStore.create(suffix)
    // Dispose the store when the component is unmounted.
    onUnmounted(store.$dispose)
    // Provide the suffix in the component to allow other components
    // to use the same store instance.
    provide(provideKey, suffix)
    return store
  }

  return useSuffixedStore
}
