import { computed } from 'vue'
import { castArray, compact, map, omit, orderBy, trimStart, unset } from 'lodash'
import lucene from 'lucene'

import { useSearchFilter } from '@/composables/useSearchFilter'
import { useSearchBreadcrumbStore, useSearchStore } from '@/store/modules'
import findPath from '@/utils/findPath'

export function useSearchBreadcrumb() {
  const searchStore = useSearchStore.inject()
  const searchBreadcrumbStore = useSearchBreadcrumbStore()
  const { setQuery, removeIndex, removeFilterValue, refreshRoute } = useSearchFilter()

  const count = computed(() => entries.value.length)

  const anyFilters = computed(() => count.value - indicesEntries.value.length > 0)

  function parseIndicesEntries(routeQuery) {
    const indices = compact(routeQuery.indices.split(','))
    const noXIcon = indices.length === 1
    const filter = 'project'
    return indices.map(value => ({ filter, value, noXIcon }))
  }

  const indicesEntries = computed(() => {
    return parseIndicesEntries(searchBreadcrumbStore.endSearchQuery)
  })

  function parseQueryEntries({ q: query = null }) {
    return query ? [{ query }] : []
  }

  const queryEntries = computed(() => {
    return parseQueryEntries(searchBreadcrumbStore.endSearchQuery)
  })

  function parseFiltersEntries(routeQuery) {
    const filters = omit(routeQuery, ['q', 'field', 'indices'])
    // Each filter can have several values
    return map(filters, (values, param) => {
      const filter = param.split('[').pop().split(']').shift()
      return castArray(values).map((value) => {
        const lastIndex = searchBreadcrumbStore.paramLastIndex(param, value)
        return { filter, value, lastIndex }
      })
    }).flat()
  }

  const filtersEntries = computed(() => {
    return parseFiltersEntries(searchBreadcrumbStore.endSearchQuery)
  })

  function parseEntries(routeQuery) {
    return compact(
      [parseIndicesEntries(routeQuery), parseQueryEntries(routeQuery), parseFiltersEntries(routeQuery)].flat()
    )
  }

  const entries = computed(() => {
    return compact([indicesEntries.value, queryEntries.value, orderBy(filtersEntries.value, ['lastIndex'])].flat())
  })

  const hasQueryEntries = computed(() => !!queryEntries.value.length)
  const hasFiltersEntries = computed(() => !!filtersEntries.value.length)
  const hasQueryAndFiltersEntries = computed(() => hasQueryEntries.value && hasFiltersEntries.value)

  const clearEntry = (entryAst, { query, filter, value }) => {
    if (entryAst && query) {
      const ast = lucene.parse(query)
      const entryAstPath = findPath(ast, entryAst)
      const operatorPath = [...entryAstPath.split('.').slice(0, -1), 'operator'].join('.')
      unset(ast, entryAstPath)
      unset(ast, operatorPath)
      setQuery(lucene.toString(ast))
    }

    if (filter === 'project') {
      removeIndex(value)
    }
    else if (filter) {
      removeFilterValue(trimStart(filter, '-'), value)
    }

    return refreshRoute()
  }

  const clearFiltersEntries = () => {
    searchStore.resetFilterValues()
    return refreshRoute()
  }

  const clearQueryEntries = () => {
    searchStore.resetQuery()
    return refreshRoute()
  }

  const clearAll = () => {
    searchStore.resetFilterValues()
    searchStore.resetQuery()
    return refreshRoute()
  }

  return {
    anyFilters,
    entries,
    parseEntries,
    parseIndicesEntries,
    parseQueryEntries,
    parseFiltersEntries,
    clearEntry,
    clearFiltersEntries,
    clearQueryEntries,
    clearAll,
    count,
    hasQueryEntries,
    hasFiltersEntries,
    hasQueryAndFiltersEntries
  }
}

export default useSearchBreadcrumb
