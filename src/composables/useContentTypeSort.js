import { computed, toValue } from 'vue'

import contentTypeCategoriesJson from '@/utils/contentTypeCategories.json'
import settings from '@/utils/settings'
import { getDocumentTypeLabel } from '@/utils/utils'
import { useSearchStore } from '@/store/modules'

const SORT_BY_KEY = '_key'
const categoryJsonOrder = Object.keys(contentTypeCategoriesJson)

const compareLabels = (a, b) =>
  a.localeCompare(b, undefined, { sensitivity: 'base' })

/**
 * Sorted views for the file-types filter. Reads the user's sort preference
 * from `searchStore.sortFilters[filterName]` and applies it to both the
 * category-level list and the type-level list inside each category.
 */
export function useContentTypeSort({ entries, filter, categoryLabelFor, filteredCategoryPairs }) {
  const searchStore = useSearchStore.inject()

  const filterName = computed(() => toValue(filter)?.name)

  const sort = computed(() => searchStore.sortFilters[filterName.value] ?? {
    sortBy: settings.filter.sortBy,
    orderBy: settings.filter.orderBy
  })

  const entryCountMap = computed(() => {
    const map = new Map()
    ;(toValue(entries) ?? []).forEach(entry => map.set(entry.item.key, entry.item.doc_count ?? 0))
    return map
  })

  const entryCount = contentType => entryCountMap.value.get(contentType) ?? 0

  const categoryCount = types =>
    types.reduce((sum, contentType) => sum + entryCount(contentType), 0)

  const sortedCategoryEntries = computed(() => {
    const pairs = toValue(filteredCategoryPairs) ?? []
    const { sortBy, orderBy } = sort.value
    const direction = orderBy === 'asc' ? 1 : -1

    const jsonPosition = (key) => {
      const index = categoryJsonOrder.indexOf(key)
      return index === -1 ? Number.POSITIVE_INFINITY : index
    }

    const byCount = ([aKey, aTypes], [bKey, bTypes]) => {
      const diff = categoryCount(aTypes) - categoryCount(bTypes)
      if (diff !== 0) {
        return diff * direction
      }
      return jsonPosition(aKey) - jsonPosition(bKey)
    }

    const byLabel = ([aKey], [bKey]) =>
      compareLabels(categoryLabelFor(aKey), categoryLabelFor(bKey)) * direction

    return [...pairs].sort(sortBy === SORT_BY_KEY ? byLabel : byCount)
  })

  const sortedTypesFor = (types) => {
    const { sortBy, orderBy } = sort.value
    const direction = orderBy === 'asc' ? 1 : -1

    const byCount = (aType, bType) => {
      const diff = entryCount(aType) - entryCount(bType)
      if (diff !== 0) {
        return diff * direction
      }
      return compareLabels(getDocumentTypeLabel(aType), getDocumentTypeLabel(bType))
    }

    const byLabel = (aType, bType) =>
      compareLabels(getDocumentTypeLabel(aType), getDocumentTypeLabel(bType)) * direction

    return [...types].sort(sortBy === SORT_BY_KEY ? byLabel : byCount)
  }

  return {
    entryCount,
    categoryCount,
    sortedCategoryEntries,
    sortedTypesFor
  }
}

export default useContentTypeSort
