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

  /**
   * Reset the search state to its initial values.
   * This function clears the search field, resets the pagination,
   * and clears the response, filters, and values.
   */
  function reset() {
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

  /**
   * Reset the search state for a route change.
   * This function clears the search field, resets the pagination,
   * and clears the response, filters, and values.
   * This is useful when navigating to a new route
   * to ensure the search state is fresh.
   */
  function resetForRouteChange() {
    from.value = 0
    isReady.value = true
    q.value = ''
    excludeFilters.value = []
    values.value = {}
  }

  /**
   * Reset the filters to their initial definitions.
   * This function restores the filters to their default state,
   * clears the filter values, and resets the pagination.
   */
  function resetFilters() {
    filters.value = [...filterDefs]
    values.value = {}
    from.value = 0
  }

  /**
   * Reset the filter values to an empty state.
   *
   * This function clears all filter values and resets the pagination.
   * It does not affect the filters themselves, only their values.
   */
  function resetFilterValues() {
    values.value = {}
    from.value = 0
  }

  /**
   * Reset the search query to its initial state.
   */
  function resetQuery() {
    q.value = ''
    field.value = settings.defaultSearchField
    from.value = 0
  }

  /**
   * Set the search query to a specific value.
   *
   * @param {string} value - The search query to set.
   */
  function setQuery(value) {
    q.value = value
  }

  /**
   * Set the starting point for the search results.
   *
   * @param {number} value - The starting point for the search results.
   */
  function setFrom(value) {
    from.value = Number(value)
  }

  /**
   * Set the readiness state of the search.
   *
   * This function toggles the readiness state of the search,
   * allowing it to be set to either ready or not ready.
   * @param {boolean} [value=!isReady.value] - The value to set the readiness state to.
   */
  function setIsReady(value = !isReady.value) {
    isReady.value = value
  }

  /**
   * Set an error message or value for the search, which can be used to display error messages or handle errors in the UI.
   *
   * @param {string|null} [value=null] - The error message or value to set. If null, it clears the error.
   */
  function setError(value = null) {
    error.value = value
  }

  /**
   * Set the index for the search.
   *
   * @param {string} value - The index to set for the search.
   */
  function setIndex(value) {
    indices.value = [value]
  }

  /**
   * Set the indices for the search.
   * @param {Array|string} value - The indices to set for the search. This can be an array of indices or a comma-separated string.
   */
  function setIndices(value) {
    // Clean indices list to ensure we received an array. This means
    // this action can also receive a string with a comma separated
    // list of indices.
    const cleaned = compact(castArray(value))
      .map((str) => str.split(','))
      .flat()
    indices.value = cleaned
  }

  /**
   * Set the search field to a specific value.
   *
   * @param {string} value - The search field to set. If the value is not in the list of search fields, it will default to the configured default search field.
   */
  function setField(value) {
    const keys = settings.searchFields.map(property('key'))
    field.value = keys.indexOf(value) > -1 ? value : settings.defaultSearchField
  }

  /**
   * Set the response for the search.
   *
   * @param {Object} params - The parameters for the response.
   * @param {Object|null} params.raw - The raw response data from the search.
   * @param {Array|null} params.parents - The parent documents of the search results.
   * @param {Array|null} params.roots - The root documents of the search results.
   */
  function setResponse({ raw = null, parents = null, roots = null } = {}) {
    response.value = new EsDocList(raw, parents, roots, from.value)
  }

  /**
   * Instantiate a filter based on its type and options.
   *
   * This function creates a new filter instance of the specified type,
   * binds it to the current state, and returns the filter instance.
   *
   * @param {Object} params - The parameters for the filter.
   * @param {string} [params.type='FilterText'] - The type of the filter to instantiate, default is 'FilterText'.
   * @param {Object} [params.options={}] - The options for the filter, default is an empty object.
   * @returns {Object} - The instantiated filter object.
   */
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

  /**
   * Check if a specific filter value exists in the instantiated filters.
   *
   * @param {Object} item - The filter item to check.
   * @param {string} item.name - The name of the filter.
   * @param {string} item.value - The value of the filter to check.
   * @returns {boolean} - Returns true if the filter value exists, false otherwise.
   */
  function hasFilterValue(item) {
    return !!instantiatedFilters.value.find(({ name, values }) => {
      return name === item.name && values.indexOf(item.value) > -1
    })
  }

  /**
   * Check if a filter is contextualized, i.e., if its values are being used in the current search context.
   *
   * @param {string} name - The name of the filter to check.
   * @returns {boolean} - Returns true if the filter is contextualized, false otherwise.
   */
  function isFilterContextualized(name) {
    return contextualizeFilters.value.includes(name)
  }

  /**
   * Check if a filter is excluded, i.e., if it is not currently included in the search.
   *
   * @param {string} name - The name of the filter to check.
   * @returns {boolean} - Returns true if the filter is excluded, false otherwise.
   */
  function isFilterExcluded(name) {
    return excludeFilters.value.includes(name)
  }

  /**
   * Get the sorting parameters for a specific filter by its name.
   *
   * @param {string} name - The name of the filter to get the sorting parameters for.
   * @returns {Object} - Returns the sorting parameters for the filter, including sortBy and orderBy.
   */
  function filterSortedBy(name) {
    return getFilter({ name }).sortBy
  }

  /**
   * Get the order of sorting for a specific filter by its name.
   *
   * @param {string} name - The name of the filter to get the order of sorting for.
   * @return {string} - Returns the order of sorting for the filter, such as 'asc' or 'desc'.
   */
  function filterSortedByOrder(name) {
    return getFilter({ name }).orderBy
  }

  /**
   * Add a new value to the filter's values.
   *
   * This function checks if the filter already has values for the given name,
   * and if so, it adds the new value to those values. If the filter does not
   * have existing values for the name, it initializes the values with the new value.
   *
   * @param {Object} filter - The filter object containing the name and value to add.
   * @param {string} filter.name - The name of the filter to which the value will be added.
   * @param {string|Array} filter.value - The value or values to add to the filter's values.
   */
  function addFilterValue({ name, value }) {
    // We cast the new filter values to allow several new values at the same time
    const newValues = castArray(value)
    // Look for existing values for this name
    const filterValues = values.value?.[name] ?? []
    const filterValuesAsString = filterValues.map(toString)
    values.value[name] = uniq(filterValuesAsString.concat(newValues))
  }

  /**
   * Set a filter value in the store.
   *
   * @param {Object} filter - The filter object containing the name and value to set.
   * @param {string} filter.name - The name of the filter to set the value for.
   * @param {string|Array} filter.value - The value or values to set for the filter.
   */
  function setFilterValue({ name, value }) {
    values.value[name] = castArray(value)
  }

  /**
   * Get a filter by its name or a predicate function.
   *
   * @param {Function|string} predicate - The predicate function to find the filter or the name of the filter.
   * @return {Object|null} - Returns the filter object if found, otherwise null.
   */
  function getFilter(predicate) {
    return find(instantiatedFilters.value, predicate)
  }

  /**
   * Remove a specific value from the filter's values.
   *
   * This function checks if the filter has existing values for the given name,
   * and if so, it filters out the specified value from those values.
   * If the value is not found, it does nothing.
   * @param {Object} filter - The filter object containing the name and value to remove.
   * @param {string} filter.name - The name of the filter from which to remove the value.
   * @param {string} filter.value - The value to remove from the filter's values.
   */
  function removeFilterValue({ name, value }) {
    // Look for existing values for this name
    const existingValues = values.value?.[name] ?? []
    // Filter the values for this name to remove the given value
    values.value[name] = existingValues.filter((existingValue) => existingValue !== value)
  }

  /**
   * Remove a filter by its name.
   *
   * @param {string} name - The name of the filter to remove.
   */
  function removeFilter(name) {
    const i = filters.value.findIndex(({ options }) => options.name === name)
    delete filters.value[i]
    if (name in values.value) {
      delete values.value[name]
    }
  }

  /**
   * Add a new filter to the filters list.
   *
   * @param {Object} params - The parameters for the filter.
   * @param {string} [params.type='FilterText'] - The type of the filter, default is 'FilterText'.
   * @param {Object} [params.options={}] - The options for the filter, default is an empty object.
   * @param {number|null} [params.position=null] - The position to insert the filter in the list, default is null (append to the end).
   */
  function addFilter({ type = 'FilterText', options = {}, position = null } = {}) {
    if (!filters.value.find((filter) => filter.options.name === options.name)) {
      if (position === null) {
        filters.value.push({ type, options })
      } else {
        filters.value.splice(position, 0, { type, options })
      }
    }
  }

  /**
   * Sort a filter by its name.
   * @param {Object} params - The parameters for sorting the filter.
   * @param {string} params.name - The name of the filter to sort.
   * @param {string} [params.sortBy='_count'] - The field to sort by, default is '_count'.
   * @param {string} [params.orderBy='desc'] - The order of sorting, default is 'desc'.
   */
  function sortFilter({ name, sortBy = '_count', orderBy = 'desc' } = {}) {
    sortFilters.value[name] = { sortBy, orderBy }
  }

  /**
   * Unsort a filter by its name.
   * @param {string} name - The name of the filter to unsort.
   */
  function unsortFilter(name) {
    delete sortFilters.value[name]
  }

  /**
   * Contextualize a filter by its name.
   *
   * This function adds the filter to the contextualized filters list.
   * If the filter is already contextualized, it will not be added again.
   * @param {string} name - The name of the filter to contextualize.
   */
  function contextualizeFilter(name) {
    if (!contextualizeFilters.value.includes(name)) {
      contextualizeFilters.value.push(name)
    }
  }

  /**
   * Decontextualize a filter by its name.
   * This function removes the filter from the contextualized filters list.
   * @param {string} name - The name of the filter to decontextualize.
   */
  function decontextualizeFilter(name) {
    const i = contextualizeFilters.value.indexOf(name)
    contextualizeFilters.value.splice(i, 1)
  }

  /**
   * Exclude a filter by its name.
   * This function checks if the filter is currently included.
   * If it is, it will add the filter to the excluded filters list.
   * @param {string} name - The name of the filter to exclude.
   */
  function excludeFilter(name) {
    if (!isFilterExcluded(name)) {
      excludeFilters.value.push(name)
    }
  }

  /**
   * Include a filter by its name.
   * This function checks if the filter is currently excluded.
   * If it is, it will remove the filter from the excluded filters list.
   * @param {string} name - The name of the filter to include.
   */
  function includeFilter(name) {
    const i = excludeFilters.value.indexOf(name)
    if (i > -1) {
      excludeFilters.value.splice(i, 1)
    }
  }

  /**
   * Toggle a filter by its name.
   * This function checks if the filter is currently excluded.
   * If it is, it will exclude the filter; otherwise, it will include it.
   * @param {string} name - The name of the filter to toggle.
   * @param {boolean|null} toggler - Optional parameter to force the toggle action. If provided, it will override the current state of the filter.
   * @returns {Object} - The result of the toggle action, either excluding or including the filter.
   */
  function toggleFilter(name, toggler = null) {
    if (toggler ?? !isFilterExcluded(name)) {
      return excludeFilter(name)
    }
    return includeFilter(name)
  }

  /**
   * Refresh the search results based on the current search parameters.
   *
   * This function resets the state, clears any previous errors,
   * and performs a search using the current search parameters.
   * It updates the response with the search results and handles any errors that may occur.
   * @returns {Promise<void>} - A promise that resolves when the search is complete.
   */
  async function refresh() {
    setIsReady(false)
    setError()
    setResponse()

    try {
      const raw = await searchDocuments()
      const roots = await searchRootDocuments(raw)
      searchBreadcrumbStore.pushSearchQuery(toBaseRouteQuery.value)
      setResponse({ raw, roots })
    } catch (error) {
      setError(error)
    } finally {
      setIsReady(true)
    }
  }

  /**
   * Search for documents in the Elasticsearch index based on the current search parameters.
   *
   * This function uses the `api.elasticsearch.searchDocs` method to perform the search
   * and returns a promise that resolves to the search results.
   * @param {Object} searchParams - The search parameters to use for the query.
   * @returns {Promise<EsDocList>} - A promise that resolves to an instance of EsDocList containing the search results.
   */
  function searchDocuments(searchParams = toSearchParams.value) {
    return api.elasticsearch.searchDocs(searchParams)
  }

  /**
   * Search for root documents based on the provided raw search results.
   *
   * This function extracts the IDs of embedded documents from the raw search results
   * and queries the Elasticsearch index for their root documents.
   * @param {Object} raw - The raw search results from Elasticsearch.
   * @returns {Promise} - A promise that resolves to the root documents.
   */
  function searchRootDocuments(raw) {
    const embedded = get(raw, 'hits.hits', []).filter((hit) => hit._source.extractionLevel > 0)
    const ids = embedded.map((hit) => hit._source.rootDocument)
    const source = ['contentType', 'contentLength', 'title', 'path']
    return api.elasticsearch.ids(indices.value.join(','), ids, source)
  }

  /**
   * Update the search state based on the current route query.
   *
   * This function resets the search state and updates it with the values
   * from the route query. It sets the index, indices, query, from, field,
   * and filters based on the provided route query.
   * @param {Object} routeQuery - The query parameters from the current route.
   */
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

  /**
   * Query the Elasticsearch index with the current search parameters.
   *
   * This function updates the search parameters based on the provided value,
   * which can be a string or an object. If it's a string, it sets the query directly.
   * If it's an object, it updates the relevant parameters based on the keys present in the object.
   * @param {Object|string} value - The search parameters or query string to set.
   * @returns {Promise} - A promise that resolves when the search is refreshed.
   */
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

  /**
   * Query the Elasticsearch index with a filter.
   *
   * This function performs a search on the specified indices
   * using a filter based on the provided name, along with the current
   * query string, instantiated filters, and other options.
   * @param {Object} params - The parameters for the query.
   * @param {string} params.name - The name of the filter to apply.
   * @param {Object} params.options - Additional options for the filter.
   * @param {number} [params.from=0] - The starting point for the search results.
   * @param {number} [params.size=10] - The number of results to return.
   * @returns {Promise<EsDocList>} - A promise that resolves to an instance of EsDocList containing the search results.
   */
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

  /**
   * Set a filter value and return the updated query.
   *
   * This function updates the filter's value in the store
   * and then calls the `query` function to refresh the results.
   * @param {Object} filter - The filter object containing the name and value to set.
   * @returns {Promise} - A promise that resolves when the query is updated.
   */
  function querySetFilterValue(filter) {
    setFilterValue(filter)
    return query()
  }

  /**
   * Add a filter value and return the updated query.
   *
   * This function adds a new value to the filter's values
   * and then calls the `query` function to refresh the results.
   * @param {Object} filter - The filter object containing the name and value to add.
   * @returns {Promise} - A promise that resolves when the query is updated.
   */
  function queryAddFilterValue(filter) {
    addFilterValue(filter)
    return query()
  }

  /**
   * Remove a filter value and return the updated query.
   *
   * This function removes a specific value from the filter's values
   * and then calls the `query` function to refresh the results.
   * @param {Object} filter - The filter object containing the name and value to remove.
   * @returns {Promise} - A promise that resolves when the query is updated.
   */
  function queryRemoveFilterValue(filter) {
    removeFilterValue(filter)
    return query()
  }

  /**
   * Toggle a filter by its name and return the updated query.
   *
   * This function checks if the filter is currently excluded and toggles its state.
   * If the filter is excluded, it will be included, and vice versa.
   * @param {string} name - The name of the filter to toggle.
   * @returns {Promise} - A promise that resolves when the query is updated.
   */
  function queryToggleFilter(name) {
    toggleFilter(name)
    return query()
  }

  /**
   * Query the previous page of results.
   *
   * This function decrements the `from` value by the number of items per page
   * and then calls the `query` function to fetch the previous set of results.
   * @returns {Promise} - A promise that resolves when the previous page of results is fetched.
   */
  function queryPreviousPage() {
    setFrom(from.value - perPage.value)
    return query()
  }

  /**
   * Query the next page of results.
   *
   * This function increments the `from` value by the number of items per page
   * and then calls the `query` function to fetch the next set of results.
   * @returns {Promise} - A promise that resolves when the next page of results is fetched.
   */
  function queryNextPage() {
    setFrom(from.value + perPage.value)
    return query()
  }

  /**
   * Recursively delete a term from a Lucene query object.
   *
   * This function traverses the query structure and removes any occurrence of the specified term.
   * If the term is found in the left or right part of the query, it is removed.
   * If the term is not found, the query structure is returned unchanged.
   * @param {Object} query - The Lucene query object to modify.
   * @param {string} term - The term to remove from the query.
   * @returns {Object} - The modified query object with the term removed.
   */
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

  /**
   * Remove a term from the current Lucene query.
   * @param {string} term - The term to remove from the query.
   * @returns {Promise} - A promise that resolves when the query is updated.
   */
  function queryDeleteQueryTerm(term = '') {
    const luceneQuery = deleteTermFromLuceneQuery(lucene.parse(q.value), term)
    setQuery(lucene.toString(luceneQuery))
    return query()
  }

  /**
   * Run a batch download for the current search query.
   * @param {string|null} uri - The URI to download the batch, if provided.
   * @returns {Promise} - A promise that resolves when the batch download is initiated.
   */
  function runBatchDownload(uri = null) {
    const batchDownloadQuery = ['', null, undefined].indexOf(q.value) === -1 ? q.value : '*'
    const { query } = api.elasticsearch.rootSearch(instantiatedFilters.value, batchDownloadQuery).build()
    return api.runBatchDownload({ projectIds: indices.value, query, uri })
  }

  /**
   * Check if the current route query is the same as the given query,
   * ignoring the keys in the `omit` array.
   * @param {Object} query - The query to compare with the current route query.
   * @param {Array} omit - The keys to ignore in the comparison.
   * @returns {boolean} - Returns true if the queries are the same, false otherwise.
   */
  function sameRouteQuery(query = {}, omit = []) {
    return Object.keys(query).every((key) => {
      return omit.includes(key) || query[key] === toRouteQueryWithStamp.value[key]
    })
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
    runBatchDownload,
    sameRouteQuery
  }
})
