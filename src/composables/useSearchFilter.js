import { computed, defineAsyncComponent, toValue, nextTick, watch, watchEffect } from 'vue'
import castArray from 'lodash/castArray'
import get from 'lodash/get'
import identity from 'lodash/identity'
import isObject from 'lodash/isObject'
import range from 'lodash/range'
import random from 'lodash/random'
import toString from 'lodash/toString'
import without from 'lodash/without'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import settings from '@/utils/settings'
import { SEARCH_OPERATORS } from '@/enums/searchOperators'
import { useCore } from '@/composables/useCore'
import { useMode } from '@/composables/useMode'
import { useContentTypeCategoryAvailability } from '@/composables/useContentTypeCategoryAvailability'
import { onAfterRouteUpdate } from '@/composables/onAfterRouteUpdate'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FilterTypeFileTypes from '@/components/Filter/FilterType/FilterTypeFileTypes'

// FilterType (the generic base, used by most filters: date, tag, entity,
// etc.) and FilterTypeFileTypes (the always-on contentType facet) are
// imported statically since both are on by default for every project. The
// specialized types below are each only relevant to a project enabling that
// specific facet, so they're loaded on demand.
const FilterTypeDateRange = defineAsyncComponent(() => import('@/components/Filter/FilterType/FilterTypeDateRange'))
const FilterTypePath = defineAsyncComponent(() => import('@/components/Filter/FilterType/FilterTypePath'))
const FilterTypeProject = defineAsyncComponent(() => import('@/components/Filter/FilterType/FilterTypeProject'))
const FilterTypeRecommendedBy = defineAsyncComponent(() => import('@/components/Filter/FilterType/FilterTypeRecommendedBy'))
const FilterTypeStarred = defineAsyncComponent(() => import('@/components/Filter/FilterType/FilterTypeStarred'))
import { CONTENT_TYPE_CATEGORY_FILTER_NAME } from '@/store/filters/FilterContentTypeCategory'
import FilterText from '@/store/filters/FilterText.js'
import { PAIRED_DIMENSIONS, getCanonicalDimension, getPairedDimension, getPairedDimensions } from '@/store/filters/pairedDimensions'
import { useAppStore, useLockedFiltersStore, useRecommendedStore, useSearchStore } from '@/store/modules'
import { toLockedName } from '@/store/modules/lockedFilters'

// Module-level singleton (shared across every useSearchFilter() call, not
// per-call state): a one-shot flag set by SearchBar.vue's submit() to mark
// "this next search was an explicit user submission (Enter/Search button),
// not a filter/index/operator watcher". Deliberately NOT round-tripped
// through the route query string: pushing even a *complete* route query can
// still trigger a same-tick cascade of corrective re-navigations from
// independently registered watchers reacting to a resulting state change
// (e.g. a locked-filter merge triggering watchFilters(refreshRouteFromStart)
// with a freshly regenerated stamp) — and Vue's watch(route.fullPath)
// coalesces multiple synchronous updates into a single firing for only the
// *latest* value, so an arbitrary custom query param can be silently
// dropped before any consumer ever observes it. A plain JS flag has no such
// round-trip to survive. See icij/datashare#2332.
//
// Standalone module exports, not returned from useSearchFilter(): neither
// function needs any Vue/router/store context, so callers (including tests)
// can use them without mounting a component.
let justSubmitted = false

// Set by SearchBar.vue's submit() right before it pushes the route — marks
// the upcoming search as an explicit user submission.
export function markJustSubmitted() {
  justSubmitted = true
}

// Reads and clears the flag in one step, so it's consumed exactly once no
// matter how many route updates the resulting search triggers (e.g. a
// locked-filter merge cascading into further re-navigations) — every one of
// those sees the flag already cleared after the first check.
export function consumeJustSubmitted() {
  const value = justSubmitted
  justSubmitted = false
  return value
}

// Same rationale and idiom as justSubmitted above, for a different one-shot
// signal: set by SearchSavedEntries.vue right before navigating into a saved
// search, so the hydration guards below can skip the otherwise-automatic
// locked-filter merge for that one navigation. A saved search is a frozen
// snapshot; a lock absent from it should not be silently re-injected the way
// it would be for an ordinary link (the "silent-merge-unless-conflicting"
// rule is deliberately bypassed here, not just its conflict branch). A URL
// query flag was tried first and rejected for the same reason justSubmitted
// isn't one: stripping it back out of the URL is itself a navigation, and
// that navigation would re-hydrate with the flag already gone, silently
// merging the lock right back in a tick later. See icij/datashare#2331.
//
// Two independent guards below (refreshSearchFromRoute and
// refreshSearchFromRouteStart) both need to read this for the same
// navigation, so reading does not consume it, only onConsumeSavedSearchOpened
// does, and it must be registered after both so they observe it first.
let savedSearchOpened = false

export function markSavedSearchOpened() {
  savedSearchOpened = true
}

// Non-destructive read, called by both hydration guards below.
export function isSavedSearchOpened() {
  return savedSearchOpened
}

// Clears the flag. Called once, by onConsumeSavedSearchOpened's callback,
// after both guards have already read it via isSavedSearchOpened() above.
export function clearSavedSearchOpened() {
  savedSearchOpened = false
}

export function useSearchFilter() {
  const appStore = useAppStore()
  const searchStore = useSearchStore.inject()
  const lockedFiltersStore = useLockedFiltersStore()
  const recommendedStore = useRecommendedStore()
  const route = useRoute()
  const router = useRouter()
  const { t, te } = useI18n()
  const core = useCore()
  const { isServer } = useMode(core)
  // Drives the read-layer degradation in getFilterPairedDimensions: when the
  // contentTypeCategory field is missing from the selected indices' mapping,
  // the contentType filter falls back to single-dimension behavior so paired
  // counts and the "All" checkbox stop referencing the absent dimension.
  // Tolerate an undefined return so a stubbed composable in tests doesn't
  // crash unrelated mounts (FilterModal sits under every FilterType).
  const {
    isAvailable: isCategoryAvailable,
    isLoading: isCategoryAvailabilityLoading
  } = useContentTypeCategoryAvailability() ?? {}

  // Keep non-canonical paired dimensions in lockstep with their canonical.
  // flush:'sync' ensures reconciliation runs within the same tick as setup,
  // not deferred to the next render, so URL-restored drift is corrected before
  // any computed getter or template ever reads the store.
  watchEffect(() => {
    for (const [canonical, paired] of Object.entries(PAIRED_DIMENSIONS)) {
      const value = searchStore.isFilterExcluded(canonical)
      if (searchStore.isFilterExcluded(paired) !== value) {
        searchStore.toggleFilter(paired, value)
      }
    }
  }, { flush: 'sync' })

  watchEffect(() => {
    for (const [canonical, paired] of Object.entries(PAIRED_DIMENSIONS)) {
      const value = searchStore.isFilterContextualized(canonical)
      if (searchStore.isFilterContextualized(paired) !== value) {
        if (value) {
          searchStore.contextualizeFilter(paired)
        }
        else {
          // Guard: decontextualizeFilter does splice(-1,1) when absent, popping
          // an unrelated filter — only call it when the filter is actually present.
          searchStore.decontextualizeFilter(paired)
        }
      }
    }
  }, { flush: 'sync' })

  const filterTypes = {
    FilterType,
    FilterTypeDateRange,
    FilterTypeStarred,
    FilterTypeRecommendedBy,
    FilterTypePath,
    FilterTypeProject,
    FilterTypeFileTypes,
  }

  const indices = computed(() => searchStore.indices)
  const allProjectsSelected = computed(() => indices.value.length === core.projectIds.length)

  function getFilterComponent({ component, hidden = false }) {
    if (hidden) {
      return null
    }
    return filterTypes[component]
  }

  function labelToHuman(label) {
    if (te(label)) {
      return t(label)
    }
    else if (te('global.' + label)) {
      return t('global.' + label)
    }
    else if (te('filter.' + label)) {
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
        // Accept either a single filter or a list (used by paired dimensions),
        // so "all-selected" reflects the absence of values across every entry.
        const filters = castArray(toValue(filter))
        return !filters.some(hasAnyFilterValue)
      },
      set(value) {
        if (value) {
          const filters = castArray(toValue(filter))
          for (const eachFilter of filters) {
            removeFilterValues(eachFilter)
          }
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
    set ??= key => setFilterValue(filter, { key })
    return computed({ get, set })
  }

  function computedProjects({ get = null, set = null } = {}) {
    get ??= () => indices.value
    set ??= indices => searchStore.setIndices(indices)
    return computed({ get, set })
  }

  function getFilterByName(name) {
    return searchStore.getFilter({ name })
  }

  function resolveFilterName(filter) {
    const value = toValue(filter)
    if (value instanceof FilterText) {
      return value.name
    }
    if (isObject(value)) {
      return value.name
    }
    return value
  }

  function getFilterPairedDimension(filter) {
    return getPairedDimension(resolveFilterName(filter))
  }

  function getFilterPairedDimensions(filter) {
    const name = resolveFilterName(filter)
    // Graceful degradation for legacy indices: when the paired sibling is
    // contentTypeCategory and the field isn't in the index mapping, treat the
    // filter as unpaired so callers (computedAll, breadcrumb counts) skip the
    // missing dimension. The static config in pairedDimensions.js stays the
    // source of truth — only this read layer degrades.
    if (
      !isCategoryAvailable?.value
      && getPairedDimension(name) === CONTENT_TYPE_CATEGORY_FILTER_NAME
    ) {
      return [name]
    }
    return getPairedDimensions(name)
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

  function getSearchOperator() {
    return appStore.getSettings('search', 'searchOperator')
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

  // The store key for a filter's locks: its own current include/exclude
  // mode, never a paired dimension's — shared by every value-removal path
  // below so unlocking never leaks across a paired filter's other side.
  // Takes an already-cast instance (not a raw filter/name) so callers that
  // already resolved one via castFilter don't pay for a second Map lookup.
  function lockedNameFor(instance) {
    return toLockedName(instance.name, isFilterExcluded(instance))
  }

  const removeFilterValue = (filter, item) => {
    const instance = castFilter(filter)
    const param = instance.itemParam(castFilterItem(item))
    const value = toString(param.value)
    lockedFiltersStore.unlock({ name: lockedNameFor(instance), value })
    return searchStore.removeFilterValue({ ...instance, value })
  }

  const removeFilterValues = (filter) => {
    // setFilterValue takes a single { name, value } arg; passing [] positionally writes [undefined].
    const instance = castFilter(filter)
    const { name } = instance
    const lockedName = lockedNameFor(instance)
    lockedFiltersStore.unlockWhere(entry => entry.name === lockedName)
    return searchStore.setFilterValue({ name, value: [] })
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

  function toValidSearchOperator(value) {
    return Object.values(SEARCH_OPERATORS).includes(value) ? value : SEARCH_OPERATORS.OR
  }

  function refreshSearchFromRoute() {
    // Extract the query parameters that must be saved in the app state
    const { perPage = getPerPage(), sort = getSort(), order = getOrder() } = route.query
    const searchOperator = toValidSearchOperator(route.query.searchOperator ?? getSearchOperator())
    appStore.setSettings('search', { perPage, orderBy: [sort, order], searchOperator })
    // Update the search store using the route query
    searchStore.updateFromRouteQuery(route.query, { mergeLocks: !isSavedSearchOpened() })
    // And finally, refresh the search if t
    return nextTick(refreshSearch)
  }

  function refreshSearchFromRouteStart() {
    // Extract the query parameters that must be saved in the app state
    const { perPage = getPerPage(), sort = getSort(), order = getOrder() } = route.query
    const searchOperator = toValidSearchOperator(route.query.searchOperator ?? getSearchOperator())
    appStore.setSettings('search', { perPage, orderBy: [sort, order], searchOperator })
    // Update the search store using the route query and reset the `from` parameter
    searchStore.updateFromRouteQuery({ ...route.query, from: 0 }, { mergeLocks: !savedSearchOpened })
    // And finally, refresh the search if t
    return nextTick(refreshSearch)
  }

  function refreshRecommendedBy() {
    // Recommendations are a server-mode-only feature
    if (!isServer.value) return
    const users = getFilterValues({ name: 'recommendedBy' })
    return recommendedStore.getDocumentsRecommendedBy(indices.value, users)
  }

  async function refreshSearch() {
    await refreshRecommendedBy()
    return searchStore.query()
  }

  function toggleExcludeFilter({ name }, checked) {
    for (const dimension of getPairedDimensions(name)) {
      searchStore.toggleFilter(dimension, checked)
    }
  }

  function isFilterExcluded({ name }) {
    const dimensions = getPairedDimensions(name)
    if (dimensions.length === 1) {
      return searchStore.isFilterExcluded(name)
    }
    return searchStore.isFilterExcluded(getCanonicalDimension(name))
  }

  function computedExcludeFilter(filter, { get = null, set = null } = {}) {
    get ??= () => isFilterExcluded(filter)
    set ??= checked => toggleExcludeFilter(filter, checked)
    return computed({ get, set })
  }

  function toggleContextualizeFilter({ name }, checked) {
    for (const dimension of getPairedDimensions(name)) {
      if (checked) {
        searchStore.contextualizeFilter(dimension)
      }
      else if (searchStore.isFilterContextualized(dimension)) {
        // Guard the call — the store's decontextualizeFilter does splice(-1, 1)
        // when the name is absent, which would pop an unrelated filter.
        searchStore.decontextualizeFilter(dimension)
      }
    }
  }

  function isFilterContextualized({ name }) {
    const dimensions = getPairedDimensions(name)
    if (dimensions.length === 1) {
      return searchStore.isFilterContextualized(name)
    }
    return searchStore.isFilterContextualized(getCanonicalDimension(name))
  }

  function computedContextualizeFilter(filter, { get = null, set = null } = {}) {
    get ??= () => isFilterContextualized(filter)
    set ??= checked => toggleContextualizeFilter(filter, checked)
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

  function watchOperator(callback) {
    return watch(() => searchStore.searchOperator, callback)
  }

  function onAfterRouteQueryUpdate(callback, options) {
    return onAfterRouteUpdate((to, from) => {
      if (
        // We don't want to trigger the callback when the route is not "search"
        to.name === 'search'
        // or when the `noRefresh` query parameter is set
        && !to.query?.noRefresh
        // or when the query is not changed (except for the `from` parameter)
        && !searchStore.sameAppliedQuery(to.query, ['from'])
      ) {
        callback(to, from)
      }
    }, options)
  }

  function onAfterRouteQueryFromUpdate(callback, options) {
    return onAfterRouteUpdate((to, from) => {
      if (
        // We don't want to trigger the callback when the route is not "search"
        to.name === 'search'
        // or when the `noRefresh` query parameter is set
        && !to.query?.noRefresh
        // or when the previous route is not a document in a modal (for instance,
        // when the user navigates from a document in grid view)
        && !(from.name === 'document' && from.query.modal)
        // or when the `from` query parameter is not changed.
        && to.query.from !== from.query.from
      ) {
        callback(to, from)
      }
    }, options)
  }

  function onConsumeNoRefresh(options) {
    // `noRefresh` is a one-shot flag set when returning to search from a
    // document, telling the refresh guards to skip a reload. Once those guards
    // have observed it for this navigation, strip it from the URL so it never
    // persists into the next navigation (page/sort/perPage changes copy the
    // current route query forward via batchQueryParamUpdate, which would
    // otherwise keep re-applying the flag and suppress the refresh).
    //
    // This consumer MUST be registered after the refresh guards so its
    // queued microtask runs last and the guards read `noRefresh` first.
    return onAfterRouteUpdate((to) => {
      if (to.name === 'search' && to.query?.noRefresh) {
        const { noRefresh: _noRefresh, ...query } = to.query
        // Stripping `noRefresh` here re-triggers `onAfterRouteQueryUpdate` (it is NOT
        // gated on `from`), which is what runs the initial search when a shared
        // `noRefresh=1` URL is loaded/reloaded directly — do not add a `from` guard there,
        // or reloading such a URL would leave the results blank.
        // `.catch` swallows the benign rejection from a concurrent navigation superseding this replace.
        router.replace({ name: 'search', query }).catch(() => {})
      }
    }, options)
  }

  function onConsumeSavedSearchOpened(options) {
    // Clears the in-memory savedSearchOpened flag (see its declaration above
    // for why it isn't a URL param). Bare onAfterRouteUpdate, not
    // onAfterRouteQueryUpdate: the latter's sameAppliedQuery gate could skip
    // this callback on a rare matching navigation, leaking the flag into an
    // unrelated future one; this must run unconditionally on every 'search'
    // navigation.
    //
    // This consumer MUST be registered after refreshSearchFromRouteStart and
    // refreshSearchFromRoute so its queued microtask runs last and both
    // guards read the flag before it is cleared here.
    return onAfterRouteUpdate((to) => {
      if (to.name === 'search') {
        clearSavedSearchOpened()
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
    getFilterPairedDimension,
    getFilterPairedDimensions,
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
    watchOperator,
    onAfterRouteQueryUpdate,
    onAfterRouteQueryFromUpdate,
    onConsumeNoRefresh,
    onConsumeSavedSearchOpened,
    watchValues,
    whenFilterContextualized,
    isCategoryAvailable,
    isCategoryAvailabilityLoading
  }
}
