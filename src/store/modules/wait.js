import { reactive, toValue } from 'vue'

import { defineSuffixedStore } from '@/store/defineSuffixedStore'

const GLOBAL_SCOPE_KEY = '__global__'

export const useWaitStore = defineSuffixedStore('wait', () => {
  const loaders = reactive({})

  /**
   * Set the value of a loader
   *
   * @param {string|Ref} scopeKeyRef - The scope key
   * @param {string|Ref} idRef - The loader id
   * @param {boolean} value - The value to set
   */
  function set(scopeKeyRef, idRef, value) {
    const scopeKey = toValue(scopeKeyRef) ?? GLOBAL_SCOPE_KEY
    const id = toValue(idRef)
    loaders[scopeKey] ??= {}
    loaders[scopeKey][id] = value
  }

  /**
   * Get the value of a loader
   *
   * @param {string|Ref} scopeKeyRef - The scope key
   * @param {string|Ref} idRef - The loader id
   * @return {boolean|undefined} - The value of the loader
   */
  function get(scopeKeyRef, idRef) {
    const scopeKey = toValue(scopeKeyRef) ?? GLOBAL_SCOPE_KEY
    const id = toValue(idRef)
    return loaders[scopeKey]?.[id]
  }

  return { loaders, set, get }
})
