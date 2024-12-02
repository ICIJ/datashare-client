import { computed } from 'vue'
import { useStore } from 'vuex'
import { castArray, compact, flatten, map, omit, orderBy, unset } from 'lodash'
import lucene from 'lucene'

import { useSearchFilter } from '@/composables/search-filter'
import findPath from '@/utils/find-path'

export function useSearchBreadcrumb() {
  const store = useStore()
  const { setQuery, removeIndex, removeFilterValue, refreshRoute } = useSearchFilter()

  const count = computed(() => entries.value.length)

  const indicesEntries = computed(() => {
    const indices = store.getters['search/toBaseRouteQuery']().indices.split(',')
    const noXIcon = indices.length === 1
    const filter = 'project'
    return indices.map((value) => ({ filter, value, noXIcon }))
  })

  const queryEntries = computed(() => {
    const { q: query = null } = store.getters['search/toBaseRouteQuery']()
    return query ? [{ query }] : []
  })

  const filtersEntries = computed(() => {
    const filters = omit(store.getters['search/toBaseRouteQuery'](), ['q', 'field', 'indices'])
    return flatten(
      // Each filter can have several values
      map(filters, (values, param) => {
        const filter = param.split('[').pop().split(']').shift()
        return castArray(values).map((value) => {
          const lastIndex = store.getters['searchBreadcrumb/paramLastIndex'](param, value)
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
    store.commit('search/resetFilterValues')
    return refreshRoute()
  }

  const clearQueryEntries = () => {
    store.commit('search/resetQuery')
    return refreshRoute()
  }

  const clearAll = () => {
    store.commit('search/resetFilterValues')
    store.commit('search/resetQuery')
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
