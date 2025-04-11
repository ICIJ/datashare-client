import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useSearchStore } from '@/store/modules'
import { useHistoryEvents } from '@/composables/useHistoryEvents'

export function useSearchSaving() {
  const searchStore = useSearchStore.inject()
  const { save: saveSearchEvent, removeAll: removeAllSearchEvents } = useHistoryEvents('SEARCH')
  const { resolve } = useRouter()

  const searchRoute = computed(() => {
    const from = 0
    const routeQuery = searchStore.toRouteQuery
    const query = { ...routeQuery, from }
    return resolve({ name: 'search', query })
  })

  function save({ name, id = null }) {
    const projectIds = searchStore.indices
    const uri = searchRoute.value.fullPath
    const type = 'SEARCH'
    return saveSearchEvent({ id, projectIds, type, name, uri })
  }

  function removeAll() {
    return removeAllSearchEvents()
  }

  return { save, removeAll }
}

export default useSearchSaving
