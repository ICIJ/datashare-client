import { castArray } from 'lodash'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { apiInstance as api } from '@/api/apiInstance'
import { useOnce } from '@/composables/useOnce'
import { useWait } from '@/composables/useWait'

/**
 * Defines the store for managing Datashare supported languages.
 */
export const useLanguagesStore = defineStore('languages', () => {
  const fetched = ref(false)
  const textLanguages = ref([])
  const ocrLanguages = ref([])
  const ocrAvailable = ref(null)
  const { isLoading, isReady, waitFor } = useWait()

  const hasTextLanguages = computed(() => !!textLanguages.value.length)
  const hasOcrLanguages = computed(() => !!ocrLanguages.value.length)

  const missingTextLanguages = computed(() => fetched.value && !hasTextLanguages.value)
  const missingOcrLanguages = computed(() => fetched.value && !hasOcrLanguages.value)

  const fetch = waitFor(async () => {
    await Promise.all([
      fetchTextLanguages(),
      fetchOcrLanguages()
    ])

    fetched.value = true
  })

  const { run: fetchOnce } = useOnce(fetch)

  const fetchTextLanguages = waitFor(async () => {
    try {
      textLanguages.value = castArray(await api.textLanguages())
    }
    catch {
      textLanguages.value = []
    }
    return textLanguages.value
  })

  const fetchOcrLanguages = waitFor(async () => {
    try {
      ocrLanguages.value = castArray(await api.ocrLanguages())
      ocrAvailable.value = true
    }
    catch (error) {
      ocrLanguages.value = []
      ocrAvailable.value = error.response?.status !== 503
    }
    return ocrLanguages.value
  })

  return {
    isLoading,
    isReady,
    hasTextLanguages,
    hasOcrLanguages,
    missingTextLanguages,
    missingOcrLanguages,
    fetch,
    fetchOnce,
    fetched,
    textLanguages,
    ocrLanguages,
    ocrAvailable,
  }
})
