import { computed, toValue } from 'vue'

import contentTypeCategoriesJson from '@/utils/contentTypeCategories.json'
import settings from '@/utils/settings'
import { getDocumentTypeLabel } from '@/utils/utils'
import { useSearchStore } from '@/store/modules'

const SORT_BY_KEY = '_key'
const ASC = 'asc'

const categoryJsonOrder = Object.keys(contentTypeCategoriesJson)

const compareLabels = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })

const compareTypeLabels = (a, b) => compareLabels(getDocumentTypeLabel(a), getDocumentTypeLabel(b))

const directionFor = (orderBy) => {
  if (orderBy === ASC) {
    return 1
  }
  return -1
}

const categoryJsonPosition = (key) => {
  const index = categoryJsonOrder.indexOf(key)
  if (index === -1) {
    return Number.POSITIVE_INFINITY
  }
  return index
}

const defaultSort = () => ({
  sortBy: settings.filter.sortBy,
  orderBy: settings.filter.orderBy
})

/**
 * Sorted views for the file-types filter. Reads the user's sort preference
 * from `searchStore.sortFilters[filterName]` and applies it to both the
 * category-level list and the type-level list inside each category.
 */
export function useContentTypeSort({ entries, filter, categoryLabelFor, filteredCategoryPairs }) {
  const searchStore = useSearchStore.inject()

  const filterName = computed(() => toValue(filter)?.name)
  const sort = computed(() => searchStore.sortFilters[filterName.value] ?? defaultSort())

  const entryCountMap = computed(() => {
    const map = new Map()
    for (const { item } of toValue(entries) ?? []) {
      map.set(item.key, item.doc_count ?? 0)
    }
    return map
  })

  const entryCount = contentType => entryCountMap.value.get(contentType) ?? 0
  const categoryCount = types => types.reduce((sum, type) => sum + entryCount(type), 0)

  const compareCategoriesByCount = direction => ([aKey, aTypes], [bKey, bTypes]) => {
    const diff = categoryCount(aTypes) - categoryCount(bTypes)
    if (diff !== 0) {
      return diff * direction
    }
    return categoryJsonPosition(aKey) - categoryJsonPosition(bKey)
  }

  const compareCategoriesByLabel = direction => ([aKey], [bKey]) => {
    return compareLabels(categoryLabelFor(aKey), categoryLabelFor(bKey)) * direction
  }

  const categoryComparator = ({ sortBy, orderBy }) => {
    const direction = directionFor(orderBy)
    if (sortBy === SORT_BY_KEY) {
      return compareCategoriesByLabel(direction)
    }
    return compareCategoriesByCount(direction)
  }

  const compareTypesByCount = direction => (aType, bType) => {
    const diff = entryCount(aType) - entryCount(bType)
    if (diff !== 0) {
      return diff * direction
    }
    return compareTypeLabels(aType, bType)
  }

  const compareTypesByLabel = direction => (aType, bType) => {
    return compareTypeLabels(aType, bType) * direction
  }

  const typesComparator = ({ sortBy, orderBy }) => {
    const direction = directionFor(orderBy)
    if (sortBy === SORT_BY_KEY) {
      return compareTypesByLabel(direction)
    }
    return compareTypesByCount(direction)
  }

  const sortedCategoryEntries = computed(() => {
    const pairs = toValue(filteredCategoryPairs) ?? []
    return [...pairs].sort(categoryComparator(sort.value))
  })

  const sortedTypesFor = types => [...types].sort(typesComparator(sort.value))

  return {
    entryCount,
    categoryCount,
    sortedCategoryEntries,
    sortedTypesFor
  }
}

export default useContentTypeSort
