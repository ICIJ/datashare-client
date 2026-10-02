import { computed, onScopeDispose, ref, toValue, watch } from 'vue'
import debounce from 'lodash/debounce'
import isEqual from 'lodash/isEqual'

import { useToast } from '@/composables/useToast.js'
import { useUrlParam } from '@/composables/useUrlParam.js'
import { useUrlPageParam } from '@/composables/useUrlPageParam.js'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore.js'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore.js'
import { useWait } from '@/composables/useWait.js'
import { useAppStore } from '@/store/modules'

/**
 * A paginated, sortable and searchable list of users, kept in the URL (`sort`, `order`,
 * `perPage`, `q`, `page`) with sort and page size remembered per view in the app store.
 *
 * @param {string} view - The app store settings view (e.g. 'instanceUsersList').
 * @param {Object} options
 * @param {Function} options.load - Loads one page: receives `{ q, sort, desc, from, size }` and
 *   resolves to `{ items, total }`.
 * @param {string|Ref<string>|Function} options.errorMessage - Toasted when a load fails.
 */
export function usePaginatedUsers(view, { load, errorMessage }) {
  const appStore = useAppStore()
  const { toastedPromise } = useToast()
  const { waitFor, isLoading, start, loaderId } = useWait()

  const users = ref([])
  const totalRows = ref(0)
  // The users store behind the backend can't list accounts (it answers 501): there is no list to
  // show, which is different from an empty one or a failed request.
  const isListingUnsupported = ref(false)
  // The latest page request, so a caller can wait for it and reuse its rows.
  let usersLoaded = Promise.resolve()

  const sortOrder = useUrlParamsWithStore(['sort', 'order'], {
    get: () => appStore.getSettings(view, 'orderBy'),
    set: (sort, order) => appStore.setSettings(view, { orderBy: [sort, order] })
  })
  const sort = computed({
    get: () => sortOrder.value?.[0] ?? null,
    set: value => (sortOrder.value = [value, order.value])
  })
  const order = computed({
    get: () => sortOrder.value?.[1] ?? 'asc',
    set: value => (sortOrder.value = [sort.value, value])
  })
  const perPage = useUrlParamWithStore('perPage', {
    transform: value => Math.max(10, parseInt(value) || 10),
    get: () => appStore.getSettings(view, 'perPage'),
    set: perPage => appStore.setSettings(view, { perPage })
  })
  const query = useUrlParam('q', '')
  // A local copy of the search box: reading `query` right after setting it can be stale until the
  // URL update lands, so requests read this one instead.
  const queryInput = ref(query.value)
  watch(query, (value) => {
    if (value !== queryInput.value) queryInput.value = value
  })
  const page = useUrlPageParam()

  // Only the latest request writes the list: an older one that answers late (two quick refreshes,
  // or a page/sort change while one is in flight) would otherwise overwrite it with stale rows.
  let latestRequest = 0

  async function loadPage() {
    const request = ++latestRequest
    const size = Number(perPage.value)
    let result
    try {
      result = await load({
        q: queryInput.value || null,
        sort: sort.value,
        desc: order.value === 'desc',
        from: (page.value - 1) * size,
        size
      })
    }
    catch (error) {
      // A superseded request is ignored, failed or not
      if (request !== latestRequest) return
      if (error?.response?.status !== 501) throw error
      isListingUnsupported.value = true
      users.value = []
      totalRows.value = 0
      return
    }
    if (request !== latestRequest) return
    isListingUnsupported.value = false
    users.value = result.items
    totalRows.value = result.total
  }

  // Reloads the current page without the loading state, for refreshes behind an open modal.
  function refreshUsers() {
    usersLoaded = loadPage()
    return toastedPromise(usersLoaded, { errorMessage: toValue(errorMessage) }).catch(() => {})
  }
  const fetchUsers = waitFor(refreshUsers)
  const debouncedFetchUsers = debounce(fetchUsers, 200)
  // A search typed just before leaving the page must not load (or toast) once it's gone
  onScopeDispose(() => debouncedFetchUsers.cancel())

  let skipNextPageWatch = false

  function resetToFirstPage() {
    start(loaderId)
    if (page.value !== 1) {
      skipNextPageWatch = true
      page.value = 1
    }
    debouncedFetchUsers()
  }

  watch(queryInput, (value) => {
    query.value = value
    resetToFirstPage()
  })
  watch(perPage, resetToFirstPage)
  watch(sortOrder, (value, oldValue) => {
    if (!isEqual(value, oldValue)) fetchUsers()
  })
  watch(page, () => {
    if (skipNextPageWatch) {
      skipNextPageWatch = false
      return
    }
    fetchUsers()
  })

  return {
    users,
    totalRows,
    sort,
    order,
    perPage,
    queryInput,
    page,
    isLoading,
    isListingUnsupported,
    fetchUsers,
    refreshUsers,
    whenUsersLoaded: () => usersLoaded
  }
}

export default usePaginatedUsers
