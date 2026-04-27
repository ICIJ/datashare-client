import { computed, toValue } from 'vue'

import contentTypeCategoriesJson from '@/utils/contentTypeCategories.json'
import settings from '@/utils/settings'
import { getDocumentTypeLabel } from '@/utils/utils'
import { useSearchStore } from '@/store/modules'

const categoryJsonOrder = Object.keys(contentTypeCategoriesJson)

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

  /**
   * O(1) lookup of `doc_count` per content type, derived from `entries`.
   * @returns {Map<string, number>}
   */
  const entryCountMap = computed(() => {
    const map = new Map()
    ;(toValue(entries) ?? []).forEach(entry => map.set(entry.item.key, entry.item.doc_count ?? 0))
    return map
  })

  /**
   * Document count for `contentType`, or 0 when missing.
   * @param {string} contentType
   * @returns {number}
   */
  const entryCount = contentType => entryCountMap.value.get(contentType) ?? 0
  /**
   * Sum of document counts across `types`.
   * @param {string[]} types
   * @returns {number}
   */
  const categoryCount = types =>
    types.reduce((sum, contentType) => sum + entryCount(contentType), 0)

  /**
   * Filtered category pairs sorted by the user's preference.
   * @returns {Array<[string, string[]]>}
   */
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

    const byLabel = ([aKey], [bKey]) => {
      const compare = categoryLabelFor(aKey).localeCompare(
        categoryLabelFor(bKey),
        undefined,
        { sensitivity: 'base' }
      )
      return compare * direction
    }

    return [...pairs].sort(sortBy === '_key' ? byLabel : byCount)
  })

  /**
   * Sort `types` by the active preference, used per category in the template.
   * @param {string[]} types
   * @returns {string[]}
   */
  const sortedTypesFor = (types) => {
    const { sortBy, orderBy } = sort.value
    const direction = orderBy === 'asc' ? 1 : -1

    const byCount = (aType, bType) => {
      const diff = entryCount(aType) - entryCount(bType)
      if (diff !== 0) {
        return diff * direction
      }
      return getDocumentTypeLabel(aType).localeCompare(
        getDocumentTypeLabel(bType),
        undefined,
        { sensitivity: 'base' }
      )
    }

    const byLabel = (aType, bType) => {
      const compare = getDocumentTypeLabel(aType).localeCompare(
        getDocumentTypeLabel(bType),
        undefined,
        { sensitivity: 'base' }
      )
      return compare * direction
    }

    return [...types].sort(sortBy === '_key' ? byLabel : byCount)
  }

  return {
    entryCount,
    categoryCount,
    sortedCategoryEntries,
    sortedTypesFor
  }
}

export default useContentTypeSort
