import { computed, toValue } from 'vue'
import { isEqual } from 'lodash'

import { useSearchStore } from '@/store/modules'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { CONTENT_TYPE_CATEGORY_FILTER_NAME } from '@/store/filters/FilterContentTypeCategory'

/**
 * Selection state and toggle handlers for the content-types filter. Keeps
 * the `contentType` and `contentTypeCategory` dimensions in lockstep, with
 * automatic promote/demote when a category becomes fully or partially
 * ticked.
 */
export function useContentTypeSelection({ filter, categories }) {
  const searchStore = useSearchStore.inject()
  const { getFilterByName, getFilterValuesByName } = useSearchFilter()

  const filterName = computed(() => toValue(filter)?.name)
  const categoryFilter = computed(() => getFilterByName(CONTENT_TYPE_CATEGORY_FILTER_NAME))

  /**
   * Current explicit `contentType` values stored in the search filter.
   * @returns {string[]}
   */
  const currentContentTypes = () => getFilterValuesByName(filterName.value)
  /**
   * Current `contentTypeCategory` values stored in the search filter.
   * @returns {string[]}
   */
  const currentCategories = () => getFilterValuesByName(CONTENT_TYPE_CATEGORY_FILTER_NAME)

  /**
   * True when `category` is bulk-selected via `contentTypeCategory`.
   * @param {string} category
   * @returns {boolean}
   */
  const isCategoryStored = category => currentCategories().includes(category)

  /**
   * Reverse map giving each child its parent category in O(1).
   * @returns {Map<string, string>}
   */
  const categoryByContentType = computed(() => {
    const map = new Map()
    Object.entries(toValue(categories) ?? {}).forEach(([category, types]) => {
      types.forEach(type => map.set(type, category))
    })
    return map
  })

  /**
   * Resolve a content type's parent category, or `null` when unknown.
   * @param {string} contentType
   * @returns {string | null}
   */
  const categoryForContentType = contentType => categoryByContentType.value.get(contentType) ?? null

  // Explicit-only set so a category-implied child still renders unchecked.
  /** @returns {Set<string>} */
  const selectedContentTypeSet = computed(() => new Set(currentContentTypes()))

  // Superset including category-implied children, used only by the search
  // box so a category-covered row stays visible when its label stops
  // matching.
  /** @returns {Set<string>} */
  const retainedContentTypeSet = computed(() => {
    const set = new Set(currentContentTypes())
    currentCategories().forEach((category) => {
      const types = (toValue(categories) ?? {})[category] ?? []
      types.forEach(type => set.add(type))
    })
    return set
  })

  /**
   * True when the user has explicitly ticked `contentType`.
   * @param {string} contentType
   * @returns {boolean}
   */
  const isEntrySelected = contentType => selectedContentTypeSet.value.has(contentType)
  /**
   * True when `contentType` is selected OR implicitly covered by a stored category.
   * @param {string} contentType
   * @returns {boolean}
   */
  const isEntryRetainedDuringSearch = contentType => retainedContentTypeSet.value.has(contentType)

  /**
   * Number of `types` currently selected explicitly.
   * @param {string[]} types
   * @returns {number}
   */
  const categorySelectedCount = types => types.filter(isEntrySelected).length

  /**
   * True when the category should display as fully checked.
   * @param {string} category
   * @param {string[]} types
   * @returns {boolean}
   */
  const categoryAllSelected = (category, types) => {
    if (isCategoryStored(category)) {
      return true
    }
    const selected = categorySelectedCount(types)
    return selected > 0 && selected === types.length
  }

  /**
   * True when the category should display as indeterminate.
   * @param {string} category
   * @param {string[]} types
   * @returns {boolean}
   */
  const categoryIndeterminate = (category, types) => {
    if (isCategoryStored(category)) {
      return false
    }
    const selected = categorySelectedCount(types)
    return selected > 0 && selected < types.length
  }

  /**
   * Persist `values` as the new `contentType` filter, skipping no-op writes.
   * @param {string[]} values
   * @returns {void}
   */
  const writeContentTypes = (values) => {
    const next = [...new Set(values)]
    if (isEqual([...next].sort(), [...currentContentTypes()].sort())) {
      return
    }
    searchStore.setFilterValue({ name: filterName.value, value: next })
  }

  /**
   * Persist `values` as the new `contentTypeCategory` filter, skipping no-op writes.
   * @param {string[]} values
   * @returns {void}
   */
  const writeCategories = (values) => {
    if (!categoryFilter.value) {
      return
    }
    const next = [...new Set(values)]
    if (isEqual([...next].sort(), [...currentCategories()].sort())) {
      return
    }
    searchStore.setFilterValue({ name: CONTENT_TYPE_CATEGORY_FILTER_NAME, value: next })
  }

  /**
   * Drop `category` and replace any explicit child it covered with
   * `keepFromCategory`. Shared by demote (keep just the clicked child) and
   * uncheck-with-stored-category (keep the surviving siblings).
   * @param {string} category
   * @param {string[]} keepFromCategory
   * @returns {void}
   */
  const dropCategoryAnd = (category, keepFromCategory) => {
    const categoryTypes = (toValue(categories) ?? {})[category] ?? []
    const others = currentContentTypes().filter(value => !categoryTypes.includes(value))
    writeCategories(currentCategories().filter(value => value !== category))
    writeContentTypes([...others, ...keepFromCategory])
  }

  /**
   * True when ticking `contentType` would complete the category.
   * @param {string | null} category
   * @param {string} contentType
   * @param {string[]} currentTypes
   * @returns {boolean}
   */
  const shouldPromoteToCategory = (category, contentType, currentTypes) => {
    if (!category || currentCategories().includes(category)) {
      return false
    }
    const siblings = ((toValue(categories) ?? {})[category] ?? []).filter(type => type !== contentType)
    return siblings.length > 0 && siblings.every(type => currentTypes.includes(type))
  }

  /**
   * Toggle an entire category, clearing any explicit child overlap.
   * @param {string} category
   * @param {string[]} types
   * @param {boolean} checked
   * @returns {void}
   */
  const toggleCategory = (category, types, checked) => {
    writeContentTypes(currentContentTypes().filter(value => !types.includes(value)))
    const remainingCategories = currentCategories().filter(value => value !== category)
    writeCategories(checked ? [...remainingCategories, category] : remainingCategories)
  }

  /**
   * Toggle a single content type, with promote/demote against its category.
   * @param {string} contentType
   * @param {boolean} checked
   * @returns {void}
   */
  const toggleEntry = (contentType, checked) => {
    const category = categoryForContentType(contentType)

    if (checked) {
      const currentTypes = currentContentTypes()
      // Demote: clicking a child of a stored category narrows the selection
      // to that single child.
      if (category && isCategoryStored(category)) {
        dropCategoryAnd(category, [contentType])
        return
      }
      if (shouldPromoteToCategory(category, contentType, currentTypes)) {
        const categoryTypes = (toValue(categories) ?? {})[category] ?? []
        writeContentTypes(currentTypes.filter(value => !categoryTypes.includes(value)))
        writeCategories([...currentCategories(), category])
        return
      }
      writeContentTypes([...currentTypes, contentType])
      return
    }

    // Defensive: URL-tamper or race may store both the category and an
    // explicit child. Normal flow now hits the demote branch above, so this
    // only fires for tampered state.
    if (category && isCategoryStored(category)) {
      const siblings = ((toValue(categories) ?? {})[category] ?? []).filter(type => type !== contentType)
      dropCategoryAnd(category, siblings)
      return
    }

    writeContentTypes(currentContentTypes().filter(value => value !== contentType))
  }

  return {
    isEntrySelected,
    isEntryRetainedDuringSearch,
    categoryAllSelected,
    categoryIndeterminate,
    toggleCategory,
    toggleEntry
  }
}

export default useContentTypeSelection
