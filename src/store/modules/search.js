import {
  castArray,
  compact,
  endsWith,
  find,
  get,
  has,
  isString,
  method,
  orderBy as orderArray,
  property,
  random,
  range,
  toString,
  uniq
} from 'lodash'
import lucene from 'lucene'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import EsDocList from '@/api/resources/EsDocList'
import filterDefs, * as filterTypes from '@/store/filters'
import { useAppStore, useSearchBreadcrumbStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'
import { defineSuffixedStore } from '@/store/defineSuffixedStore'
import settings from '@/utils/settings'

export const useSearchStore = defineSuffixedStore('search', () => {
  const error = ref(null)
  const field = ref(settings.defaultSearchField)
  const filters = ref([...filterDefs])
  const from = ref(0)
  const indices = ref([])
  const isReady = ref(true)
  const q = ref('')
  const response = ref(EsDocList.none())
  const excludeFilters = ref([])
  const contextualizeFilters = ref([])
  const sortFilters = ref({})
  const values = ref({})

  const appStore = useAppStore()
  const router = useRouter()
  const searchBreadcrumbStore = useSearchBreadcrumbStore()

  const index = computed({
    get: () => indices.value[0],
    set: (value) => {
      indices.value = [value]
    }
  })

  const fields = computed(() => {
    return find(settings.searchFields, { key: field.value }).fields
  })

  const instantiatedFilters = computed(() => {
    return orderArray(filters.value.map(instantiateFilter), 'order', 'asc')
  })

  const activeFilters = computed(() => {
    return instantiatedFilters.value.filter(method('hasValues'))
  })

  const filterValuesAsRouteQuery = computed(() => {
    return Object.keys(values.value).reduce((memo, name) => {
      // We need to look for the filter's definition in order to us its `id`
      // as key for the URL params. This was we track configured filter instead
      // of arbitrary values provided by the user. This allow to retrieve special
      // behaviors depending on the filter definition.
      const filter = find(instantiatedFilters.value, { name })
      // We don't add filterValue that match with any existing filters
      // defined in the `aggregation` store.
      if (filter && filter.values.length > 0) {
        const key = filter.excluded ? `f[-${filter.name}]` : `f[${filter.name}]`
        memo[key] = compact(filter.values)
      }
      return memo
    }, {})
  })

  const toBaseRouteQuery = computed(() => {
    return {
      q: q.value,
      indices: indices.value.join(','),
      field: field.value,
      ...filterValuesAsRouteQuery.value
    }
  })

  const toRouteQuery = computed(() => {
    return {
      from: `${from.value}`,
      perPage: `${perPage.value}`,
      sort: sortBy.value,
      order: orderBy.value,
      ...toBaseRouteQuery.value
    }
  })

  const toRouteQueryWithStamp = computed(() => {
    // A random string of 6 chars
    const seed = range(6).map(() => random(97, 122))
    const stamp = String.fromCharCode.apply(null, seed)
    return { ...toRouteQuery.value, stamp }
  })

  const toSearchParams = computed(() => {
    return {
      index: indices.value.join(','),
      query: q.value,
      filters: instantiatedFilters.value,
      from: from.value,
      perPage: perPage.value,
      sort: sort.value,
      fields: fields.value
    }
  })

  const stringifyBaseRouteQuery = computed(() => {
    const name = 'search'
    const query = toBaseRouteQuery.value
    const { href = null } = router?.resolve({ name, query }) ?? {}
    return href
  })

  const retrieveQueryTerms = computed(() => {
    const terms = []

    function getTerm(query, path, start, operator, isFuzzyNumber = false) {
      const term = get(query, `${path}.term`, '')
      const labels = terms.map(property('label'))
      const isWildcard = term === '*'
      const isEmpty = term === ''

      if (!isWildcard && !isEmpty && !isFuzzyNumber && !labels.includes(term)) {
        const label = term.replace('\\', '')
        const prefix = get(query, `${path}.prefix`, '')
        const hasNegativePrefix = ['-', '!'].includes(prefix)
        const negation = hasNegativePrefix || start === 'NOT' || endsWith(operator, 'NOT')
        const regex = get(query, `${path}.regex`, false)
        const field = get(query, `${path}.field`, '')
        const isFieldImplicit = field === '<implicit>'

        terms.push({ field: isFieldImplicit ? '' : field, label, negation, regex })
      }

      if (term === '' && has(query, `${path}.left`)) {
        retTerms(query.left)
      }
    }

    function retTerms(query, operator = null, isLeftFuzzyNumber = false) {
      getTerm(query, 'left', get(query, 'start', null), operator, isLeftFuzzyNumber)
      const isRightFuzzyNumber = get(query, 'left.similarity', null) !== null
      if (get(query, 'right.left', null) === null) {
        getTerm(query, 'right', null, get(query, 'operator', null), isRightFuzzyNumber)
      } else {
        retTerms(get(query, 'right'), get(query, 'operator', null), isRightFuzzyNumber)
      }
    }

    try {
      retTerms(lucene.parse(q.value.replace('\\@', '@')))
      return terms
    } catch (_) {
      return []
    }
  })

  const retrieveContentQueryTerms = computed(() => {
    const fields = ['', 'content']
    return retrieveQueryTerms.value.filter((item) => fields.includes(item.field))
  })

  const page = computed(() => {
    return Math.floor(from.value / perPage.value) + 1
  })

  const total = computed(() => {
    return response.value?.total ?? 0
  })

  const perPage = computed(() => {
    return parseInt(appStore.getSettings('search', 'perPage'))
  })

  const sort = computed(() => {
    const [sort, order] = appStore.getSettings('search', 'orderBy') ?? ['_score', 'desc']
    // Find optional extra params
    const extraParams = settings.searchSortFieldParams[sort] ?? null
    // We add a secondary path filter is the current sort is not the path itself
    const secondarySort = sort === 'path' ? [] : [{ path: { order: 'asc' } }]
    return [{ [sort]: { order, ...extraParams } }, ...secondarySort]
  })

  const sortBy = computed(() => {
    const [sort] = appStore.getSettings('search', 'orderBy') ?? ['_score']
    return sort
  })

  const orderBy = computed(() => {
    const [, order] = appStore.getSettings('search', 'orderBy') ?? [null, 'desc']
    return order
  })

  const hits = computed(() => {
    return response.value?.hits ?? []
  })

  function reset() {
    error.value = null
    field.value = settings.defaultSearchField
    from.value = 0
    isReady.value = true
    q.value = ''
    response.value = EsDocList.none()
    excludeFilters.value = []
    sortFilters.value = {}
    contextualizeFilters.value = []
    values.value = {}
  }

  function resetForRouteChange() {
    error.value = null
    from.value = 0
    isReady.value = true
    q.value = ''
    excludeFilters.value = []
    values.value = {}
  }

  function resetFilters() {
    filters.value = [...filterDefs]
    values.value = {}
    from.value = 0
  }

  function resetFilterValues() {
    values.value = {}
    from.value = 0
  }

  function resetQuery() {
    q.value = ''
    field.value = settings.defaultSearchField
    from.value = 0
  }

  function setQuery(value) {
    q.value = value
  }

  function setFrom(value) {
    from.value = Number(value)
  }

  function setIsReady(value = !isReady.value) {
    isReady.value = value
  }

  function setError(value = null) {
    error.value = value
  }

  function setIndex(value) {
    indices.value = [value]
  }

  function setIndices(value) {
    // Clean indices list to ensure we received an array. This means
    // this action can also receive a string with a comma separated
    // list of indices.
    const cleaned = compact(castArray(value))
      .map((str) => str.split(','))
      .flat()
    indices.value = cleaned
  }

  function setField(value) {
    const keys = settings.searchFields.map(property('key'))
    field.value = keys.indexOf(value) > -1 ? value : settings.defaultSearchField
  }

  function setResponse({ raw = null, parents = null, roots = null } = {}) {
    response.value = new EsDocList(raw, parents, roots, from.value)
  }

  function instantiateFilter({ type = 'FilterText', options } = {}) {
    const Type = filterTypes[type]
    const filter = new Type(options)
    // Bind current state to the filter be able to retrieve its values. Here we wrap
    // the state in a getters to ensure the filter can access those values transparently.
    return filter.bindStore({
      get values() {
        return values.value
      },
      get excludeFilters() {
        return excludeFilters.value
      },
      get contextualizeFilters() {
        return contextualizeFilters.value
      },
      get sortFilters() {
        return sortFilters.value
      }
    })
  }

  function hasFilterValue(item) {
    return !!instantiatedFilters.value.find(({ name, values }) => {
      return name === item.name && values.indexOf(item.value) > -1
    })
  }

  function isFilterContextualized(name) {
    return contextualizeFilters.value.includes(name)
  }

  function isFilterExcluded(name) {
    return excludeFilters.value.includes(name)
  }

  function filterSortedBy(name) {
    return getFilter({ name }).sortBy
  }

  function filterSortedByOrder(name) {
    return getFilter({ name }).orderBy
  }

  function addFilterValue({ name, value }) {
    // We cast the new filter values to allow several new values at the same time
    const newValues = castArray(value)
    // Look for existing values for this name
    const filterValues = values.value?.[name] ?? []
    const filterValuesAsString = filterValues.map(toString)
    values.value[name] = uniq(filterValuesAsString.concat(newValues))
  }

  function setFilterValue({ name, value }) {
    values.value[name] = castArray(value)
  }

  function getFilter(predicate) {
    return find(instantiatedFilters.value, predicate)
  }

  function removeFilterValue({ name, value }) {
    // Look for existing values for this name
    const existingValues = values.value?.[name] ?? []
    // Filter the values for this name to remove the given value
    values.value[name] = existingValues.filter((existingValue) => existingValue !== value)
  }

  function removeFilter(name) {
    const i = filters.value.findIndex(({ options }) => options.name === name)
    delete filters.value[i]
    if (name in values.value) {
      delete values.value[name]
    }
  }

  function addFilter({ type = 'FilterText', options = {}, position = null } = {}) {
    if (!filters.value.find((filter) => filter.options.name === options.name)) {
      if (position === null) {
        filters.value.push({ type, options })
      } else {
        filters.value.splice(position, 0, { type, options })
      }
    }
  }

  function sortFilter({ name, sortBy = '_count', orderBy = 'desc' } = {}) {
    sortFilters.value[name] = { sortBy, orderBy }
  }

  function unsortFilter(name) {
    delete sortFilters.value[name]
  }

  function contextualizeFilter(name) {
    if (!contextualizeFilters.value.includes(name)) {
      contextualizeFilters.value.push(name)
    }
  }

  function decontextualizeFilter(name) {
    const i = contextualizeFilters.value.indexOf(name)
    contextualizeFilters.value.splice(i, 1)
  }

  function excludeFilter(name) {
    if (!isFilterExcluded(name)) {
      excludeFilters.value.push(name)
    }
  }

  function includeFilter(name) {
    const i = excludeFilters.value.indexOf(name)
    if (i > -1) {
      excludeFilters.value.splice(i, 1)
    }
  }

  function toggleFilter(name, toggler = null) {
    if (toggler ?? !isFilterExcluded(name)) {
      return excludeFilter(name)
    }
    return includeFilter(name)
  }

  async function refresh() {
    setIsReady(false)
    setError(null)

    try {
      const raw = await searchDocuments()
      const roots = await searchRootDocuments(raw)
      searchBreadcrumbStore.pushSearchQuery(toBaseRouteQuery.value)
      setResponse({ raw, roots })
    } catch (error) {
      setResponse()
      setError(error)
    } finally {
      setIsReady(true)
    }
  }

  function searchDocuments(searchParams = toSearchParams.value) {
    return api.elasticsearch.searchDocs(searchParams)
  }

  function searchRootDocuments(raw) {
    const embedded = get(raw, 'hits.hits', []).filter((hit) => hit._source.extractionLevel > 0)
    const ids = embedded.map((hit) => hit._source.rootDocument)
    const source = ['contentType', 'contentLength', 'title', 'path']
    return api.elasticsearch.ids(indices.value.join(','), ids, source)
  }

  function updateFromRouteQuery(routeQuery) {
    // Reset the state except for the given keys
    resetForRouteChange()
    // Create a helper function that call the setter only if the key exists in the routeQuery
    const withRouteQuery = (key, setter) => key in routeQuery && setter(routeQuery[key])
    // This is all the key that can be found in the URL (apart from filters keys)
    withRouteQuery('index', setIndex)
    withRouteQuery('indices', setIndices)
    withRouteQuery('q', setQuery)
    withRouteQuery('from', setFrom)
    withRouteQuery('field', setField)
    // Iterate over the list of filter
    instantiatedFilters.value.forEach((filter) => {
      // The filter key are formatted in the URL as follow: f[filterName] or f[-filterName] for excluded filters
      withRouteQuery(`f[${filter.name}]`, (key) => addFilterValue(filter.itemParam({ key })))
      withRouteQuery(`f[-${filter.name}]`, (key) => addFilterValue(filter.itemParam({ key })))
      withRouteQuery(`f[-${filter.name}]`, () => excludeFilter(filter.name))
    })
  }

  function query(value = {}) {
    // The query can be a string
    if (isString(value)) {
      setQuery(value)
    } else {
      // Create a helper function that call the setter only if the key exists `q`
      const withKey = (key, setter) => key in value && setter(value[key])
      // Then we list of the keys that can be update
      withKey('index', setIndex)
      withKey('indices', setIndices)
      withKey('query', setQuery)
      withKey('from', setFrom)
      withKey('field', setField)
    }
    return refresh()
  }

  async function queryFilter({ name, options, from, size }) {
    const raw = await api.elasticsearch.searchFilter(
      indices.value.join(','),
      getFilter({ name }),
      q.value,
      instantiatedFilters.value,
      isFilterContextualized(name),
      options,
      fields.value,
      from,
      size
    )
    return new EsDocList(raw)
  }

  function querySetFilterValue(filter) {
    setFilterValue(filter)
    return query()
  }

  function queryAddFilterValue(filter) {
    addFilterValue(filter)
    return query()
  }

  function queryRemoveFilterValue(filter) {
    removeFilterValue(filter)
    return query()
  }

  function queryToggleFilter(name) {
    toggleFilter(name)
    return query()
  }

  function queryPreviousPage() {
    setFrom(from.value - perPage.value)
    return query()
  }

  function queryNextPage() {
    setFrom(from.value + perPage.value)
    return query()
  }

  function deleteTermFromLuceneQuery(query, term = '') {
    const hasQuery = (key) => has(query, key)
    const hasntQuery = (key) => !hasQuery(key)
    if (get(query, 'left.term', '') === term) delete query.left
    if (get(query, 'right.term', '') === term) delete query.right
    if (hasQuery('left.left')) query.left = deleteTermFromLuceneQuery(query.left, term)
    if (hasQuery('right.left')) query.right = deleteTermFromLuceneQuery(query.right, term)
    if (hasQuery('right.right') && hasntQuery('right.left') && get(query, 'operator', '').includes('NOT'))
      query.operator = '<implicit>'
    if (hasQuery('start') && hasntQuery('left')) delete query.start
    if (hasQuery('operator') && (hasntQuery('left') || hasntQuery('right'))) delete query.operator
    if (hasQuery('parenthesized') && (hasntQuery('left') || hasntQuery('right'))) delete query.parenthesized
    return query
  }

  function queryDeleteQueryTerm(term = '') {
    const luceneQuery = deleteTermFromLuceneQuery(lucene.parse(q.value), term)
    setQuery(lucene.toString(luceneQuery))
    return query()
  }

  function runBatchDownload(uri = null) {
    const batchDownloadQuery = ['', null, undefined].indexOf(q.value) === -1 ? q.value : '*'
    const { query } = api.elasticsearch.rootSearch(instantiatedFilters.value, batchDownloadQuery).build()
    return api.runBatchDownload({ projectIds: indices.value, query, uri })
  }

  return {
    error,
    field,
    filters,
    from,
    index,
    indices,
    isReady,
    q,
    response,
    excludeFilters,
    contextualizeFilters,
    sortFilters,
    values,
    // Getters
    instantiatedFilters,
    activeFilters,
    fields,
    filterValuesAsRouteQuery,
    toBaseRouteQuery,
    toRouteQuery,
    toRouteQueryWithStamp,
    toSearchParams,
    stringifyBaseRouteQuery,
    retrieveQueryTerms,
    retrieveContentQueryTerms,
    page,
    total,
    perPage,
    sort,
    sortBy,
    orderBy,
    hits,
    // Actions
    reset,
    resetForRouteChange,
    resetFilters,
    resetFilterValues,
    resetQuery,
    hasFilterValue,
    isFilterContextualized,
    isFilterExcluded,
    filterSortedBy,
    filterSortedByOrder,
    getFilter,
    setQuery,
    setFrom,
    setIsReady,
    setError,
    setIndex,
    setIndices,
    setField,
    setResponse,
    addFilterValue,
    setFilterValue,
    removeFilterValue,
    removeFilter,
    addFilter,
    sortFilter,
    unsortFilter,
    contextualizeFilter,
    decontextualizeFilter,
    excludeFilter,
    includeFilter,
    toggleFilter,
    refresh,
    searchDocuments,
    searchRootDocuments,
    updateFromRouteQuery,
    query,
    queryFilter,
    querySetFilterValue,
    queryAddFilterValue,
    queryRemoveFilterValue,
    queryToggleFilter,
    queryPreviousPage,
    queryNextPage,
    queryDeleteQueryTerm,
    runBatchDownload
  }
})
