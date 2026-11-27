import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { apiInstance as api } from '@/api/apiInstance'
import { useOnce } from '@/composables/useOnce'

/**
 * The FollowTheMoney ontology, fetched once per session.
 *
 * The payload is around 233 KB, so it is held here and read through `useEntityProperties` rather
 * than fetched by anything that renders an entity. A failed fetch leaves the model null: the card
 * falls back to humanized labels rather than failing, which is what an older backend with no
 * /api/models route gets.
 */
export const useStructuredEntityModelStore = defineStore('structuredEntityModel', () => {
  const model = ref(null)

  const types = computed(() => model.value?.types ?? {})
  const version = computed(() => model.value?.version ?? null)

  const type = name => types.value[name]

  const fetch = async (name = 'ftm') => {
    try {
      model.value = await api.getStructuredEntityModel(name)
    }
    catch {
      model.value = null
    }
    return model.value
  }

  // useOnce caches the first successful call and lets a rejected one retry. Since `fetch` swallows
  // its own error, a failed attempt resolves, so reset on an empty result to keep the retry.
  const { run, reset } = useOnce(fetch)

  const fetchOnce = async (name = 'ftm') => {
    const result = await run(name)
    if (!result) {
      reset()
    }
    return result
  }

  return { model, types, version, type, fetch, fetchOnce }
})
