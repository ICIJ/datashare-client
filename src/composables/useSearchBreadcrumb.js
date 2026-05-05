import { computed } from 'vue'
import { castArray, compact, map, omit, orderBy, trimStart, unset } from 'lodash'
import lucene from 'lucene'

import { useSearchFilter } from '@/composables/useSearchFilter'
import { useSearchBreadcrumbStore, useSearchStore } from '@/store/modules'
import { getCanonicalDimension, getPairedDimension } from '@/store/filters/pairedDimensions'
import findPath from '@/utils/findPath'

function isIncludedEntry(entry) {
  return Boolean(entry?.filter) && !entry.filter.startsWith('-')
}

function getEntryFilterName(entry) {
  return trimStart(entry.filter, '-')
}

// Walk the remaining entries once and split included siblings into the
// canonical/partner buckets, marking each consumed index so the outer loop
// skips them on subsequent iterations.
function collectPairGroups(rawEntries, canonicalName, partnerName, consumed) {
  const canonicalGroup = []
  const partnerGroup = []

  rawEntries.forEach((other, otherIndex) => {
    if (consumed.has(otherIndex) || !isIncludedEntry(other)) {
      return
    }
    const otherFilterName = getEntryFilterName(other)
    if (otherFilterName === canonicalName) {
      canonicalGroup.push(other)
      consumed.add(otherIndex)
    }
    else if (otherFilterName === partnerName) {
      partnerGroup.push(other)
      consumed.add(otherIndex)
    }
  })

  return { canonicalGroup, partnerGroup }
}

// Tag the first partner-side chip with `operator: 'OR'` so the inline OR
// badge renders only once at the boundary between the two groups.
function tagFirstPartnerWithOr(partnerGroup) {
  return partnerGroup.map((partner, index) => {
    if (index === 0) {
      return { ...partner, operator: 'OR' }
    }
    return partner
  })
}

/**
 * Reorder paired filter entries so canonical-side chips render first followed
 * by partner-side chips, with `operator: 'OR'` tagged on the first partner so
 * the chip renders the OR prefix inline. Excluded and unpaired entries pass
 * through unchanged; partner-side chips with no canonical counterpart stay
 * where they were (no OR semantics to display).
 */
export function assembleEntries(rawEntries) {
  const consumed = new Set()
  const result = []

  rawEntries.forEach((entry, index) => {
    if (consumed.has(index)) {
      return
    }

    const filterName = getEntryFilterName(entry)

    // Pass-through path: anything that isn't an included paired-dimension
    // chip keeps its original position and shape.
    if (!isIncludedEntry(entry) || !getPairedDimension(filterName)) {
      result.push(entry)
      consumed.add(index)
      return
    }

    const canonicalName = getCanonicalDimension(filterName)
    const partnerName = getPairedDimension(canonicalName)
    const { canonicalGroup, partnerGroup } = collectPairGroups(
      rawEntries,
      canonicalName,
      partnerName,
      consumed
    )

    // Only one side of the pair has values — no OR semantics to display, so
    // emit whichever side is non-empty in its original order.
    if (canonicalGroup.length === 0 || partnerGroup.length === 0) {
      result.push(...canonicalGroup, ...partnerGroup)
      return
    }

    result.push(...canonicalGroup, ...tagFirstPartnerWithOr(partnerGroup))
  })

  return result
}

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
  // Enable the button whereas there is filters or queries even if one of them is empty
  const hasQueryAndFiltersEntries = computed(() => hasQueryEntries.value || hasFiltersEntries.value)

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
