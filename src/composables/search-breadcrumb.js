import { computed } from 'vue'
import { castArray, compact, flatten, map, omit, orderBy, unset } from 'lodash'
import lucene from 'lucene'

import { useSearchFilter } from '@/composables/search-filter'
import { useSearchBreadcrumbStore, useSearchStore } from '@/store/modules'
import findPath from '@/utils/find-path'

export function useSearchBreadcrumb() {
  const searchStore = useSearchStore()
  const searchBreadcrumbStore = useSearchBreadcrumbStore()
  const { setQuery, removeIndex, removeFilterValue, refreshRoute } = useSearchFilter()

  const count = computed(() => entries.value.length)

  const indicesEntries = computed(() => {
    const indices = searchStore.toBaseRouteQuery.indices.split(',')
    const noXIcon = indices.length === 1
    const filter = 'project'
    return indices.map((value) => ({ filter, value, noXIcon }))
  })

  const queryEntries = computed(() => {
    const { q: query = null } = searchStore.toBaseRouteQuery
    return query ? [{ query }] : []
  })

  const filtersEntries = computed(() => {
    const filters = omit(searchStore.toBaseRouteQuery, ['q', 'field', 'indices'])
    return flatten(
      // Each filter can have several values
      map(filters, (values, param) => {
        const filter = param.split('[').pop().split(']').shift()
        return castArray(values).map((value) => {
          const lastIndex = searchBreadcrumbStore.paramLastIndex(param, value)
          return { filter, value, lastIndex }
        })
      })
    )
  })

  const entries = computed(() => {
    return compact(flatten([indicesEntries.value, queryEntries.value, orderBy(filtersEntries.value, ['lastIndex'])]))
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
    } else if (filter) {
      removeFilterValue(filter, value)
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
    entries,
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
