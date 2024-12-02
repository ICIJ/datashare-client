import { computed, nextTick, watch } from 'vue'
import { get, identity, isObject, last, toString, without } from 'lodash'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import settings from '@/utils/settings'
import { useCore } from '@/composables/core'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FilterTypeDateRange from '@/components/Filter/FilterType/FilterTypeDateRange'
import FilterTypePath from '@/components/Filter/FilterType/FilterTypePath'
import FilterTypeProject from '@/components/Filter/FilterType/FilterTypeProject'
import FilterTypeRecommendedBy from '@/components/Filter/FilterType/FilterTypeRecommendedBy'
import FilterTypeStarred from '@/components/Filter/FilterType/FilterTypeStarred'
import FilterText from '@/store/filters/FilterText.js'

export function useSearchFilter() {
  const store = useStore()
  const route = useRoute()
  const router = useRouter()
  const { t, te } = useI18n()
  const { core } = useCore()

  const filterTypes = {
    FilterType,
    FilterTypeDateRange,
    FilterTypeStarred,
    FilterTypeRecommendedBy,
    FilterTypePath,
    FilterTypeProject
  }

  function getFilterComponent({ component }) {
    return filterTypes[component]
  }

  function labelToHuman(label) {
    if (te(label)) {
      return t(label)
    } else if (te('global.' + label)) {
      return t('global.' + label)
    } else if (te('filter.' + label)) {
      return t('filter.' + label)
    }

    return last(String(label).split('.'))
  }

  function castFilter(filter) {
    if (filter instanceof FilterText) {
      return filter
    }
    return store.getters['search/getFilter']({ name: filter })
  }

  function castFilterItem(value) {
    return isObject(value) ? value : { key: value }
  }

  function computedFilterValues(filter, { get = null, set = null } = {}) {
    get ??= () => getFilterValues(filter)
    set ??= (key) => setFilterValue(filter, { key })
    return computed({ get, set })
  }

  function computedProjects({ get = null, set = null } = {}) {
    get ??= () => store.state.search.indices
    set ??= (indices) => store.commit('search/indices', indices)
    return computed({ get, set })
  }

  function getFilterByName(name) {
    return store.getters['search/getFilter']({ name })
  }

  function getFilterValuesByName(name) {
    return get(store.state, `search.values.${name}`, [])
  }

  function getFilterValues({ name }) {
    return getFilterValuesByName(name)
  }

  function getPerPage() {
    return store.getters['app/getSettings']('search', 'perPage')
  }

  function getOrderBy() {
    return store.getters['app/getSettings']('search', 'orderBy')
  }

  function getSort() {
    return getOrderBy()[0]
  }

  function getOrder() {
    return getOrderBy()[1]
  }

  async function getTotal({ query = 'type:Document' } = {}) {
    const index = store.state.search.indices
    const body = { track_total_hits: true, query: { query_string: { query } } }
    const preference = 'search-filter-total'
    const res = await core.api.elasticsearch.search({ index, body, preference, size: 0 })
    return res?.hits?.total?.value || 0
  }

  function setFilterValue(filter, item) {
    store.commit('search/setFilterValue', filter.itemParam(castFilterItem(item)))
  }

  function setQuery(query) {
    store.commit('search/query', query)
  }

  function setIndices(indices) {
    store.commit('search/indices', indices)
  }

  const hasFilterValue = (filter, item) => {
    const { value } = filter.itemParam(castFilterItem(item))
    return getFilterValues(filter).map(toString).includes(toString(value))
  }

  const hasAnyFilterValue = (filter) => {
    return getFilterValues(filter).length > 0
  }

  const toggleFilterValue = (filter, item, checked) => {
    if (checked) {
      return addFilterValue(filter, item)
    }
    return removeFilterValue(filter, item)
  }

  const addFilterValue = (filter, item) => {
    const instance = castFilter(filter)
    const param = instance.itemParam(castFilterItem(item))
    const value = toString(param.value)
    return store.commit('search/addFilterValue', { ...instance, value })
  }

  const removeFilterValue = (filter, item) => {
    const instance = castFilter(filter)
    const param = instance.itemParam(castFilterItem(item))
    const value = toString(param.value)
    return store.commit('search/removeFilterValue', { ...instance, value })
  }

  const sortFilter = ({ name }, { sortBy, orderBy }) => {
    store.commit('search/sortFilter', { name, sortBy, orderBy })
  }

  function computedSortFilter(filter, { get = null, set = null } = {}) {
    get ??= () => {
      const sortBy = filter?.sortBy ?? settings.filter.sortBy
      const orderBy = filter?.orderBy ?? settings.filter.orderBy
      return { sortBy, orderBy }
    }

    set ??= ({ sortBy, orderBy }) => sortFilter(filter, { sortBy, orderBy })

    return computed({ get, set })
  }

  function removeFilter(filter) {
    const { name } = castFilter(filter)
    store.commit('search/removeFilter', name)
  }

  function removeIndex(index) {
    setIndices(without(store.state.search.indices, index))
  }

  function resetSearchResponse() {
    store.commit('search/setResponse')
  }

  async function refreshRouteAndSearch() {
    await refreshRoute()
    await refreshSearch()
  }

  function refreshRoute() {
    const name = 'search'
    const query = store.getters['search/toRouteQuery']()
    return router.push({ name, query })
  }

  function refreshSearchFromRoute() {
    // Extract the query parameters that must be saved in the app state
    const { perPage = getPerPage(), sort = getSort(), order = getOrder() } = route.query
    store.commit('app/setSettings', { view: 'search', perPage, orderBy: [sort, order] })
    // Update the search store using the route query
    store.dispatch('search/updateFromRouteQuery', route.query)
    // And finally, refresh the search if t
    return nextTick(refreshSearch)
  }

  function refreshRecommendedBy() {
    const users = getFilterValues({ name: 'recommendedBy' })
    return store.dispatch('recommended/getDocumentsRecommendedBy', users)
  }

  async function refreshSearch() {
    await refreshRecommendedBy()
    return store.dispatch('search/query')
  }

  function toggleExcludeFilter({ name }, checked) {
    if (checked) {
      return store.commit('search/excludeFilter', name)
    }
    return store.commit('search/includeFilter', name)
  }

  function isFilterExcluded({ name }) {
    return store.getters['search/isFilterExcluded'](name)
  }

  function computedExcludeFilter(filter, { get = null, set = null } = {}) {
    get ??= () => isFilterExcluded(filter)
    set ??= (checked) => toggleExcludeFilter(filter, checked)
    return computed({ get, set })
  }

  function toggleContextualizeFilter({ name }, checked) {
    if (checked) {
      return store.commit('search/contextualizeFilter', name)
    }
    return store.commit('search/decontextualizeFilter', name)
  }

  function isFilterContextualized({ name }) {
    return store.getters['search/isFilterContextualized'](name)
  }

  function computedContextualizeFilter(filter, { get = null, set = null } = {}) {
    get ??= () => isFilterContextualized(filter)
    set ??= (checked) => toggleContextualizeFilter(filter, checked)
    return computed({ get, set })
  }

  function whenFilterContextualized(filter, fn) {
    return (...args) => {
      if (isFilterContextualized(filter)) {
        return fn(...args)
      }
      return identity(...args)
    }
  }

  function watchFilterContextualized(filter, callback, options) {
    return watch(() => isFilterContextualized(filter), callback, options)
  }

  function watchFilterValues(filter, callback, options = { deep: true }) {
    return watch(() => getFilterValues(filter), callback, options)
  }

  function watchFilterExcluded(filter, callback, options) {
    return watch(() => isFilterExcluded(filter), callback, options)
  }

  function watchFilterSort(filter, callback, options) {
    // We watch the values as string to avoid deep watching the object
    // with unnecessary reactivity and unwanted side effects.
    const values = () => Object.values(computedSortFilter(filter).value).join(':')
    return watch(values, callback, options)
  }

  function watchQuery(callback, options) {
    return watch(() => store.state.search.query, callback, options)
  }

  function watchFrom(callback, options) {
    return watch(() => store.state.search.from, callback, options)
  }

  function watchIndices(callback, options) {
    return watch(() => store.state.search.indices.join(','), callback, options)
  }

  function watchValues(callback, options = { deep: true }) {
    return watch(() => store.state.search.values, callback, options)
  }

  return {
    computedSortFilter,
    computedFilterValues,
    computedExcludeFilter,
    computedContextualizeFilter,
    computedProjects,
    getFilterByName,
    getFilterComponent,
    getFilterValues,
    getFilterValuesByName,
    getTotal,
    hasAnyFilterValue,
    hasFilterValue,
    isFilterContextualized,
    isFilterExcluded,
    labelToHuman,
    resetSearchResponse,
    refreshRoute,
    refreshSearchFromRoute,
    refreshRouteAndSearch,
    setFilterValue,
    setQuery,
    setIndices,
    sortFilter,
    toggleContextualizeFilter,
    toggleExcludeFilter,
    toggleFilterValue,
    addFilterValue,
    removeFilterValue,
    removeFilter,
    refreshSearch,
    removeIndex,
    watchFilterContextualized,
    watchFilterSort,
    watchFilterValues,
    watchFilterExcluded,
    watchFrom,
    watchQuery,
    watchIndices,
    watchValues,
    whenFilterContextualized
  }
}
