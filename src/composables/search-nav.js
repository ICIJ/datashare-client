import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { matches } from 'lodash'

import EsDocList from '@/api/resources/EsDocList'
import { useCore } from '@/composables/core'
import { useDocument } from '@/composables/document'

export function useSearchNav() {
  const { core } = useCore()
  const { document } = useDocument()
  const { commit, dispatch, getters } = useStore()
  const router = useRouter()

  const total = computed(() => getters['search/total'])
  const page = computed(() => getters['search/page'])
  const perPage = computed(() => getters['search/perPage'])
  const hits = computed(() => getters['search/hits'])

  // Position of the document in the hits array
  const documentPagePosition = computed(() => (document.value ? hits.value.findIndex(document.value.eq) : -1))
  // Position of the document in the total documents
  const documentPosition = computed(() => perPage.value * (page.value - 1) + documentPagePosition.value)
  // Check if there are any hits in which the document is present
  const hasEntries = computed(() => documentPagePosition.value > -1)
  // Check if the document is the first or last in the current page based on its position in the hits array
  const isFirstInPage = computed(() => documentPagePosition.value === 0)
  const isLastInPage = computed(() => documentPagePosition.value === perPage.value - 1)
  // Check if the previous and next buttons should be disabled
  const disabledPrevious = computed(() => documentPosition.value === 0)
  const disabledNext = computed(() => documentPosition.value === total.value - 1)

  const goToEntry = (entryIndex) => {
    const { routerParams: params } = hits.value[entryIndex]
    return router.push({ name: 'document', params })
  }

  const goToFirstEntryOfPreviousPage = async () => {
    await dispatch('search/previousPage')
    return goToEntry(hits.value.length - 1)
  }

  const goToFirstEntryOfNextPage = async () => {
    await dispatch('search/nextPage')
    return goToEntry(0)
  }

  const goToPosition = async (position) => {
    // Avoid going to an invalid position
    if (position < 0 || position >= total.value) return
    // Get document from search position
    const document = await searchAndGetFromPosition(position)
    // Push the document to the route
    if (document) {
      return router.push({ name: 'document', params: document.routerParams })
    }
  }

  const previous = async () => {
    if (isFirstInPage.value) {
      return goToFirstEntryOfPreviousPage()
    }
    return goToEntry(documentPagePosition.value - 1)
  }

  const next = () => {
    if (isLastInPage.value) {
      return goToFirstEntryOfNextPage()
    }
    return goToEntry(documentPagePosition.value + 1)
  }

  async function fetchCarouselEntries(position, carouselSize = 5) {
    const params = getters['search/toSearchParams']
    const from = Math.min(Math.max(0, position - Math.floor(carouselSize / 2)), total.value - carouselSize)
    const raw = await core.api.elasticsearch.searchDocs({ ...params, from, perPage: carouselSize })
    const response = new EsDocList(raw, null, null, from)
    return response.hits
  }

  async function searchFromPosition(position) {
    const perPage = getters['search/perPage']
    const page = Math.ceil((position + 1) / perPage)
    const from = (page - 1) * perPage
    // Only search from the position if the position is on a different page
    if (from !== getters['search/from']) {
      commit('search/from', from)
      return dispatch('search/query')
    }
  }

  async function searchAndGetFromPosition(position) {
    await searchFromPosition(position)
    // Simply get the document using it's positions
    return hits.value.find(matches({ position }))
  }

  function getSearchPosition() {
    if (!document.value) return null
    const entry = hits.value.find(matches(document.value.eq))
    return entry?.position ?? null
  }

  function watchSearchEntries(callback, options = { deep: true }) {
    return watch(hits, callback, options)
  }

  function watchPosition(callback, options) {
    return watch(getSearchPosition, callback, options)
  }

  function whenNoSearchEntries(callback) {
    return () => {
      if (!hasEntries.value) {
        return callback()
      }
    }
  }

  return {
    disabledNext,
    disabledPrevious,
    documentPagePosition,
    documentPosition,
    goToPosition,
    fetchCarouselEntries,
    hasEntries,
    isFirstInPage,
    isLastInPage,
    next,
    previous,
    searchFromPosition,
    searchAndGetFromPosition,
    watchPosition,
    watchSearchEntries,
    whenNoSearchEntries
  }
}

export default useSearchNav
