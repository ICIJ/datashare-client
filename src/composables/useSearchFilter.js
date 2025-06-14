import { computed, toValue, nextTick, watch } from 'vue'
import { get, identity, isObject, range, random, toString, without } from 'lodash'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import settings from '@/utils/settings'
import { useCore } from '@/composables/useCore'
import { onAfterRouteUpdate } from '@/composables/onAfterRouteUpdate'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FilterTypeDateRange from '@/components/Filter/FilterType/FilterTypeDateRange'
import FilterTypePath from '@/components/Filter/FilterType/FilterTypePath'
import FilterTypeProject from '@/components/Filter/FilterType/FilterTypeProject'
import FilterTypeRecommendedBy from '@/components/Filter/FilterType/FilterTypeRecommendedBy'
import FilterTypeStarred from '@/components/Filter/FilterType/FilterTypeStarred'
import FilterText from '@/store/filters/FilterText.js'
import { useAppStore, useRecommendedStore, useSearchStore } from '@/store/modules'

export function useSearchFilter() {
  const appStore = useAppStore()
  const searchStore = useSearchStore.inject()
  const recommendedStore = useRecommendedStore()
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

  const indices = computed(() => searchStore.indices)
  const allProjectsSelected = computed(() => indices.value.length === core.projectIds.length)

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
    return label
  }

  function castFilter(filterRef) {
    const filter = toValue(filterRef)

    if (filter instanceof FilterText) {
      return filter
    }

    return searchStore.getFilter({ name: filter?.name ?? filter })
  }

  function castFilterItem(valueRef) {
    const value = toValue(valueRef)
    return isObject(value) ? value : { key: value }
  }

  function computedAll(filter) {
    return computed({
      get() {
        return !hasAnyFilterValue(filter)
      },
      set(value) {
        if (value) {
          removeFilterValues(filter)
        }
      }
    })
  }

  function computedTotal(filter) {
    return computed(() => {
      return hasAnyFilterValue(filter) ? null : searchStore.total
    })
  }

  function computedFilterValues(filter, { get = null, set = null } = {}) {
    get ??= () => getFilterValues(filter)
    set ??= (key) => setFilterValue(filter, { key })
    return computed({ get, set })
  }

  function computedProjects({ get = null, set = null } = {}) {
    get ??= () => indices.value
    set ??= (indices) => searchStore.setIndices(indices)
    return computed({ get, set })
  }

  function getFilterByName(name) {
    return searchStore.getFilter({ name })
  }

  function getFilterValuesByName(name) {
    return get(searchStore, `values.${name}`, [])
  }

  function getFilterValues(filter) {
    const { name } = castFilter(filter)
    return getFilterValuesByName(name)
  }

  function getPerPage() {
    return appStore.getSettings('search', 'perPage')
  }

  function getOrderBy() {
    return appStore.getSettings('search', 'orderBy')
  }

  function getSort() {
    return getOrderBy()[0]
  }

  function getOrder() {
    return getOrderBy()[1]
  }

  async function getTotal({ query = 'type:Document' } = {}) {
    const index = indices.value
    const body = { track_total_hits: true, query: { query_string: { query } } }
    const preference = 'search-filter-total'
    const res = await core.api.elasticsearch.search({ index, body, preference, size: 0 })
    return res?.hits?.total?.value || 0
  }

  function setFilterValue(filter, item) {
    searchStore.setFilterValue(filter.itemParam(castFilterItem(item)))
  }

  function setQuery(query) {
    searchStore.setQuery(query)
  }

  function setIndices(indices) {
    searchStore.setIndices(indices)
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
    return searchStore.addFilterValue({ ...instance, value })
  }

  const removeFilterValue = (filter, item) => {
    const instance = castFilter(filter)
    const param = instance.itemParam(castFilterItem(item))
    const value = toString(param.value)
    return searchStore.removeFilterValue({ ...instance, value })
  }

  const removeFilterValues = (filter) => {
    return searchStore.setFilterValue(castFilter(filter), [])
  }

  const sortFilter = ({ name }, { sortBy, orderBy }) => {
    searchStore.sortFilter({ name, sortBy, orderBy })
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
    searchStore.removeFilter(name)
  }

  function removeIndex(index) {
    setIndices(without(indices.value, index))
  }

  function resetSearchResponse() {
    searchStore.setResponse()
  }

  function refreshRoute() {
    const name = 'search'
    const query = searchStore.toRouteQuery
    return router.push({ name, query })
  }

  function refreshRouteFromStart() {
    const name = 'search'
    const seed = range(6).map(() => random(97, 122))
    const stamp = String.fromCharCode.apply(null, seed)
    const query = { ...searchStore.toRouteQuery, stamp, from: 0 }
    return router.push({ name, query })
  }

  function refreshSearchFromRoute() {
    // Extract the query parameters that must be saved in the app state
    const { perPage = getPerPage(), sort = getSort(), order = getOrder() } = route.query
    appStore.setSettings('search', { perPage, orderBy: [sort, order] })
    // Update the search store using the route query
    searchStore.updateFromRouteQuery(route.query)
    // And finally, refresh the search if t
    return nextTick(refreshSearch)
  }

  function refreshSearchFromRouteStart() {
    // Extract the query parameters that must be saved in the app state
    const { perPage = getPerPage(), sort = getSort(), order = getOrder() } = route.query
    appStore.setSettings('search', { perPage, orderBy: [sort, order] })
    // Update the search store using the route query and reset the `from` parameter
    searchStore.updateFromRouteQuery({ ...route.query, from: 0 })
    // And finally, refresh the search if t
    return nextTick(refreshSearch)
  }

  function refreshRecommendedBy() {
    const users = getFilterValues({ name: 'recommendedBy' })
    return recommendedStore.getDocumentsRecommendedBy(indices.value, users)
  }

  async function refreshSearch() {
    await refreshRecommendedBy()
    return searchStore.query()
  }

  function toggleExcludeFilter({ name }, checked) {
    return searchStore.toggleFilter(name, checked)
  }

  function isFilterExcluded({ name }) {
    return searchStore.isFilterExcluded(name)
  }

  function computedExcludeFilter(filter, { get = null, set = null } = {}) {
    get ??= () => isFilterExcluded(filter)
    set ??= (checked) => toggleExcludeFilter(filter, checked)
    return computed({ get, set })
  }

  function toggleContextualizeFilter({ name }, checked) {
    if (checked) {
      return searchStore.contextualizeFilter(name)
    }
    return searchStore.decontextualizeFilter(name)
  }

  function isFilterContextualized({ name }) {
    return searchStore.isFilterContextualized(name)
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

  function watchFilters(callback) {
    // We stringify the values to avoid deep watching the object
    // with unnecessary reactivity and unwanted side effects.
    return watch(() => JSON.stringify([searchStore.values, searchStore.excludeFilters]), callback)
  }

  function watchQuery(callback, options) {
    return watch(() => searchStore.query, callback, options)
  }

  function watchIndices(callback, options = { deep: false }) {
    return watch(() => indices.value.join(','), callback, options)
  }

  function watchValues(callback, options = { deep: false }) {
    return watch(() => JSON.stringify(searchStore.values), callback, options)
  }

  function onAfterRouteQueryUpdate(callback, options) {
    return onAfterRouteUpdate((to, from) => {
      if (to.name === 'search' && !searchStore.sameAppliedQuery(to.query, ['from'])) {
        callback(to, from)
      }
    }, options)
  }

  function onAfterRouteQueryFromUpdate(callback, options) {
    return onAfterRouteUpdate((to, from) => {
      if (
        // We don't want to trigger the callback when the route is not "search"
        to.name === 'search' &&
        // or when the previous route is not a document in a modal (for instance,
        // when the user navigates from a document in grid view)
        !(from.name === 'document' && from.query.modal) &&
        // or when the `from` query parameter is not changed.
        to.query.from !== from.query.from
      ) {
        callback(to, from)
      }
    }, options)
  }

  return {
    indices,
    allProjectsSelected,
    computedAll,
    computedContextualizeFilter,
    computedExcludeFilter,
    computedFilterValues,
    computedProjects,
    computedSortFilter,
    computedTotal,
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
    refreshRouteFromStart,
    refreshSearchFromRoute,
    refreshSearchFromRouteStart,
    setFilterValue,
    setQuery,
    setIndices,
    sortFilter,
    toggleContextualizeFilter,
    toggleExcludeFilter,
    toggleFilterValue,
    addFilterValue,
    removeFilterValue,
    removeFilterValues,
    removeFilter,
    refreshSearch,
    removeIndex,
    searchStore,
    watchFilterContextualized,
    watchFilterSort,
    watchFilterValues,
    watchFilterExcluded,
    watchFilters,
    watchQuery,
    watchIndices,
    onAfterRouteQueryUpdate,
    onAfterRouteQueryFromUpdate,
    watchValues,
    whenFilterContextualized
  }
}
