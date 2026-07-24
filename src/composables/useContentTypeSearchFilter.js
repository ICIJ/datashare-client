import { computed, ref, toValue } from 'vue'
import { deburr } from 'lodash'

import { getDocumentTypeLabel } from '@/utils/utils'

const HAYSTACK_SEPARATOR = '\n'

const normalizeForSearch = value => deburr(String(value ?? '')).toLowerCase()

const haystackForContentType = (contentType) => {
  const key = normalizeForSearch(contentType)
  const label = normalizeForSearch(getDocumentTypeLabel(contentType))
  return `${key}${HAYSTACK_SEPARATOR}${label}`
}

const buildHaystackMap = (keys, valueFor) => {
  const map = new Map()
  for (const key of keys) {
    map.set(key, valueFor(key))
  }
  return map
}

const haystackIncludes = (haystack, needle) => {
  if (!haystack) {
    return false
  }
  return haystack.includes(needle)
}

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
    const keys = Object.keys(toValue(categories) ?? {})
    return buildHaystackMap(keys, category => normalizeForSearch(categoryLabelFor(category)))
  })

  /**
   * Map each content type to its deburred MIME key + label haystack.
   * @returns {Map<string, string>}
   */
  const contentTypeHaystacks = computed(() => {
    const keys = toValue(contentTypes) ?? []
    return buildHaystackMap(keys, haystackForContentType)
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
    return haystackIncludes(contentTypeHaystacks.value.get(contentType), normalizedQuery.value)
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
    return haystackIncludes(categoryHaystacks.value.get(category), normalizedQuery.value)
  }

  /**
   * Keep a type visible if it matches OR is selected/category-implied.
   * @param {string} contentType
   * @returns {boolean}
   */
  const isContentTypeVisible = (contentType) => {
    if (matchesContentType(contentType)) {
      return true
    }
    return isContentTypeRetained(contentType)
  }

  /**
   * Types to render under `category`. A category-label hit keeps every child.
   * @param {string} category
   * @param {string[]} types
   * @returns {string[]}
   */
  const visibleTypesFor = (category, types) => {
    if (!hasQuery.value) {
      return types
    }
    if (matchesCategory(category)) {
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

  const categoryHasVisibleType = ([category, types]) => {
    if (matchesCategory(category)) {
      return true
    }
    return types.some(isContentTypeVisible)
  }

  // Empty-query fast path returns the original pairs ref so the grouped
  // view re-renders identically when no filter is active.
  /** @returns {Array<[string, string[]]>} */
  const filteredCategoryPairs = computed(() => {
    const pairs = Object.entries(toValue(categories) ?? {})
    if (!hasQuery.value) {
      return pairs
    }
    return pairs.filter(categoryHasVisibleType)
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
