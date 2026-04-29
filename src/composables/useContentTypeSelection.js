import { computed, toValue } from 'vue'
import { isEqual } from 'lodash'

import { useSearchStore } from '@/store/modules'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { CONTENT_TYPE_CATEGORY_FILTER_NAME } from '@/store/filters/FilterContentTypeCategory'

const sameValueSet = (a, b) => isEqual([...a].sort(), [...b].sort())

const uniqueValues = values => [...new Set(values)]

const without = (list, value) => list.filter(item => item !== value)

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
   * Resolve the static {category: types[]} mapping to a plain object.
   * @returns {Record<string, string[]>}
   */
  const categoriesMap = () => toValue(categories) ?? {}

  /**
   * Children stored under `category`, or `[]` when the category is unknown.
   * @param {string} category
   * @returns {string[]}
   */
  const typesInCategory = category => categoriesMap()[category] ?? []

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
    for (const [category, types] of Object.entries(categoriesMap())) {
      for (const type of types) {
        map.set(type, category)
      }
    }
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
    for (const category of currentCategories()) {
      for (const type of typesInCategory(category)) {
        set.add(type)
      }
    }
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
    if (selected === 0) {
      return false
    }
    return selected === types.length
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
    if (selected === 0) {
      return false
    }
    return selected < types.length
  }

  /**
   * Persist `values` as the new `contentType` filter, skipping no-op writes.
   * @param {string[]} values
   * @returns {void}
   */
  const writeContentTypes = (values) => {
    const next = uniqueValues(values)
    if (sameValueSet(next, currentContentTypes())) {
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
    const next = uniqueValues(values)
    if (sameValueSet(next, currentCategories())) {
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
    const categoryTypes = typesInCategory(category)
    const others = currentContentTypes().filter(value => !categoryTypes.includes(value))
    writeCategories(without(currentCategories(), category))
    writeContentTypes([...others, ...keepFromCategory])
  }

  /**
   * Promote `category` by removing its explicit children and storing the
   * category itself.
   * @param {string} category
   * @returns {void}
   */
  const promoteToCategory = (category) => {
    const categoryTypes = typesInCategory(category)
    writeContentTypes(currentContentTypes().filter(value => !categoryTypes.includes(value)))
    writeCategories([...currentCategories(), category])
  }

  /**
   * True when ticking `contentType` would complete the category.
   * @param {string | null} category
   * @param {string} contentType
   * @param {string[]} currentTypes
   * @returns {boolean}
   */
  const shouldPromoteToCategory = (category, contentType, currentTypes) => {
    if (!category) {
      return false
    }
    if (isCategoryStored(category)) {
      return false
    }
    const siblings = without(typesInCategory(category), contentType)
    if (siblings.length === 0) {
      return false
    }
    return siblings.every(type => currentTypes.includes(type))
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
    const remainingCategories = without(currentCategories(), category)
    if (checked) {
      writeCategories([...remainingCategories, category])
      return
    }
    writeCategories(remainingCategories)
  }

  /**
   * Handle a check on a child whose category is currently stored.
   * Demotes the category to a single explicit selection.
   * @param {string} category
   * @param {string} contentType
   * @returns {void}
   */
  const checkChildOfStoredCategory = (category, contentType) => {
    dropCategoryAnd(category, [contentType])
  }

  /**
   * Handle a check on a child that completes its category.
   * Replaces the explicit children with the stored category.
   * @param {string} category
   * @returns {void}
   */
  const checkChildThatCompletesCategory = (category) => {
    promoteToCategory(category)
  }

  /**
   * Handle a check on a child without any category interaction.
   * @param {string} contentType
   * @returns {void}
   */
  const checkPlainChild = (contentType) => {
    writeContentTypes([...currentContentTypes(), contentType])
  }

  /**
   * Handle an uncheck on a child whose category is stored. Defensive against
   * URL-tamper / race conditions where both the category and an explicit
   * child are stored — the normal flow demotes earlier.
   * @param {string} category
   * @param {string} contentType
   * @returns {void}
   */
  const uncheckChildOfStoredCategory = (category, contentType) => {
    const siblings = without(typesInCategory(category), contentType)
    dropCategoryAnd(category, siblings)
  }

  /**
   * Handle an uncheck on a plain child (no stored category interaction).
   * @param {string} contentType
   * @returns {void}
   */
  const uncheckPlainChild = (contentType) => {
    writeContentTypes(without(currentContentTypes(), contentType))
  }

  const handleEntryCheck = (contentType) => {
    const category = categoryForContentType(contentType)
    if (category && isCategoryStored(category)) {
      checkChildOfStoredCategory(category, contentType)
      return
    }
    const currentTypes = currentContentTypes()
    if (shouldPromoteToCategory(category, contentType, currentTypes)) {
      checkChildThatCompletesCategory(category)
      return
    }
    checkPlainChild(contentType)
  }

  const handleEntryUncheck = (contentType) => {
    const category = categoryForContentType(contentType)
    if (category && isCategoryStored(category)) {
      uncheckChildOfStoredCategory(category, contentType)
      return
    }
    uncheckPlainChild(contentType)
  }

  /**
   * Toggle a single content type, with promote/demote against its category.
   * @param {string} contentType
   * @param {boolean} checked
   * @returns {void}
   */
  const toggleEntry = (contentType, checked) => {
    if (checked) {
      handleEntryCheck(contentType)
      return
    }
    handleEntryUncheck(contentType)
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
