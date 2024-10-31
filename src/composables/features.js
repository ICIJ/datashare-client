import camelCase from 'lodash/camelCase'

import { useCore } from '@/composables/core'

export function useFeatures() {
  const { core } = useCore()

  function hasFeature(name) {
    const value = getConfigFeatureValue(name)
    return [0, '0', 'false', null, undefined].indexOf(value) === -1
  }

  function getConfigFeatureValue(name) {
    return getConfigFeatureValueFromEnv(name) || getConfigFeatureValueFromConfig(name)
  }

  function getConfigFeatureValueFromEnv(name) {
    const key = `VITE_FEATURE_${name.toUpperCase()}`
    return import.meta.env[key] || null
  }

  function getConfigFeatureValueFromConfig(name) {
    const key = camelCase(`VITE_FEATURE_${name.toUpperCase()}`)
    return core?.config?.get(key, null) ?? null
  }

  return {
    hasFeature,
    getConfigFeatureValue,
    getConfigFeatureValueFromEnv,
    getConfigFeatureValueFromConfig
  }
}

export default useFeatures
