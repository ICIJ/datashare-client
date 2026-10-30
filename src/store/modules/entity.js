import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { elasticsearch } from '@/api/elasticsearch'

/**
 * The entities list: a cross-project search over the `<project>.entities` indices.
 *
 * Deliberately not modelled on the search store, which carries filters, operators, breadcrumb and
 * async-search concerns this page does not have.
 */
export const useEntityStore = defineStore('entity', () => {
  const query = ref('')
  const projects = ref([])
  const from = ref(0)
  const perPage = ref(25)
  const sort = ref(null)
  const response = ref(null)
  const error = ref(null)
  const isReady = ref(true)

  // Monotonic: a search that is no longer the latest drops its response rather than overwriting a
  // newer one. Two are in flight whenever a user paginates and then changes the sort.
  let latestRequest = 0

  const hits = computed(() => response.value?.hits?.hits ?? [])
  const total = computed(() => response.value?.hits?.total?.value ?? 0)
  const isEmpty = computed(() => isReady.value && !error.value && !hits.value.length)

  const reset = () => {
    query.value = ''
    from.value = 0
    sort.value = null
    response.value = null
    error.value = null
    isReady.value = true
  }

  const search = async () => {
    // An empty index list means "every index in the cluster" to elasticsearch, which would read
    // projects the user was never granted. No projects means no request.
    if (!projects.value.length) {
      response.value = null
      error.value = null
      isReady.value = true
      return
    }
    const request = ++latestRequest
    isReady.value = false
    error.value = null
    try {
      const result = await elasticsearch.searchEntities({
        indices: projects.value,
        query: query.value,
        from: from.value,
        perPage: perPage.value,
        sort: sort.value
      })
      if (request !== latestRequest) return
      response.value = result
    }
    catch (e) {
      if (request !== latestRequest) return
      response.value = null
      error.value = e
    }
    finally {
      if (request === latestRequest) isReady.value = true
    }
  }

  return { query, projects, from, perPage, sort, response, error, isReady, hits, total, isEmpty, search, reset }
})
