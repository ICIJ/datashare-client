import { computed, ref, toValue } from 'vue'
import { deburr } from 'lodash'

import { getDocumentTypeLabel } from '@/utils/utils'

const normalizeForSearch = value => deburr(String(value ?? '')).toLowerCase()

/**
 * Client-side query filter for the content-types panel. Returns the search
 * `query` model and visibility predicates that keep selected or
 * category-implied types visible while typing.
 */
export function useContentTypeSearchFilter({
  contentTypes,
  categories,
  categoryLabelFor,
  isContentTypeRetained
}) {
  const query = ref('')
  const normalizedQuery = computed(() => normalizeForSearch(query.value))
  const hasQuery = computed(() => normalizedQuery.value !== '')

  /**
   * Map each category to its deburred lowercase label for substring matching.
   * @returns {Map<string, string>}
   */
  const categoryHaystacks = computed(() => {
    const map = new Map()
    Object.keys(toValue(categories) ?? {}).forEach((category) => {
      map.set(category, normalizeForSearch(categoryLabelFor(category)))
    })
    return map
  })

  /**
   * Map each content type to its deburred MIME key + label haystack.
   * @returns {Map<string, string>}
   */
  const contentTypeHaystacks = computed(() => {
    const map = new Map()
    ;(toValue(contentTypes) ?? []).forEach((contentType) => {
      const key = normalizeForSearch(contentType)
      const label = normalizeForSearch(getDocumentTypeLabel(contentType))
      map.set(contentType, `${key}\n${label}`)
    })
    return map
  })

  /**
   * True when the active query is a substring of the type's key or label.
   * @param {string} contentType
   * @returns {boolean}
   */
  const matchesContentType = (contentType) => {
    if (!hasQuery.value) {
      return true
    }
    return contentTypeHaystacks.value.get(contentType)?.includes(normalizedQuery.value) ?? false
  }

  /**
   * True when the active query is a substring of the category's label.
   * @param {string} category
   * @returns {boolean}
   */
  const matchesCategory = (category) => {
    if (!hasQuery.value) {
      return true
    }
    return categoryHaystacks.value.get(category)?.includes(normalizedQuery.value) ?? false
  }

  /**
   * Keep a type visible if it matches OR is selected/category-implied.
   * @param {string} contentType
   * @returns {boolean}
   */
  const isContentTypeVisible = contentType =>
    matchesContentType(contentType) || isContentTypeRetained(contentType)

  /**
   * Types to render under `category`. A category-label hit keeps every child.
   * @param {string} category
   * @param {string[]} types
   * @returns {string[]}
   */
  const visibleTypesFor = (category, types) => {
    if (!hasQuery.value || matchesCategory(category)) {
      return types
    }
    return types.filter(isContentTypeVisible)
  }

  /**
   * Flat-view counterpart of `visibleTypesFor`.
   * @param {Array<{item: {key: string}}>} slotEntries
   * @returns {Array<{item: {key: string}}>}
   */
  const visibleEntries = (slotEntries) => {
    if (!hasQuery.value) {
      return slotEntries
    }
    return slotEntries.filter(entry => isContentTypeVisible(entry.item.key))
  }

  // Empty-query fast path returns the original pairs ref so the grouped
  // view re-renders identically when no filter is active.
  /** @returns {Array<[string, string[]]>} */
  const filteredCategoryPairs = computed(() => {
    const pairs = Object.entries(toValue(categories) ?? {})
    if (!hasQuery.value) {
      return pairs
    }
    return pairs.filter(([category, types]) => {
      if (matchesCategory(category)) {
        return true
      }
      return types.some(isContentTypeVisible)
    })
  })

  return {
    query,
    hasQuery,
    isContentTypeVisible,
    visibleTypesFor,
    visibleEntries,
    filteredCategoryPairs
  }
}

export default useContentTypeSearchFilter
