import { computed, inject, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { matches } from 'lodash'

import EsDocList from '@/api/resources/EsDocList'
import { useCore } from '@/composables/core'
import { useDocument } from '@/composables/document'
import { useSearchStore } from '@/store/modules'

export function useSearchNav(currentDocument = null) {
  const { core } = useCore()
  const { document: viewDocument } = useDocument()
  const router = useRouter()
  const searchStore = useSearchStore.instantiate(inject('searchStoreSuffix'))
  const currentDocumentRef = toRef(currentDocument)
  const document = computed(() => currentDocumentRef.value || viewDocument.value)

  const total = computed(() => searchStore.total)
  const page = computed(() => searchStore.page)
  const perPage = computed(() => searchStore.perPage)
  const hits = computed(() => searchStore.hits)

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

  const atEntryIndex = (entryIndex) => {
    return hits.value[entryIndex]
  }

  const goToEntry = (entry) => {
    const { routerParams: params } = entry
    return router.push({ name: 'document', params })
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

  const previous = () => {
    return fetchPreviousDocument().then(goToEntry)
  }

  const next = () => {
    return fetchNextDocument().then(goToEntry)
  }

  const fetchPreviousDocument = async () => {
    if (isFirstInPage.value) {
      await searchStore.queryPreviousPage()
      return atEntryIndex(hits.value.length - 1)
    }

    return atEntryIndex(documentPagePosition.value - 1)
  }

  const fetchNextDocument = async () => {
    if (isLastInPage.value) {
      await searchStore.queryNextPage()
      return atEntryIndex(0)
    }

    return atEntryIndex(documentPagePosition.value + 1)
  }

  async function fetchCarouselEntries(position, carouselSize = 5) {
    const params = searchStore.toSearchParams
    const from = Math.min(Math.max(0, position - Math.floor(carouselSize / 2)), total.value - carouselSize)
    const raw = await core.api.elasticsearch.searchDocs({ ...params, from, perPage: carouselSize })
    const response = new EsDocList(raw, null, null, from)
    return response.hits
  }

  async function searchFromPosition(position) {
    const perPage = searchStore.perPage
    const page = Math.ceil((position + 1) / perPage)
    const from = (page - 1) * perPage
    // Only search from the position if the position is on a different page
    if (from !== searchStore.from) {
      searchStore.setFrom(from)
      return searchStore.query()
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
    fetchNextDocument,
    fetchPreviousDocument,
    searchFromPosition,
    searchAndGetFromPosition,
    watchPosition,
    watchSearchEntries,
    whenNoSearchEntries
  }
}

export default useSearchNav
