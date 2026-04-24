<script setup>
import { computed, ref, toRef, useTemplateRef } from 'vue'
import { uniq } from 'lodash'
import { useI18n } from 'vue-i18n'

import ButtonToggleContentTypesView from '@/components/Button/ButtonToggleContentTypesView.vue'
import ContentTypesAll from '@/components/ContentTypes/ContentTypesCategories/ContentTypesAll.vue'
import ContentTypesCategories from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategories.vue'
import ContentTypesCategory from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategory.vue'
import ContentTypesCategoryName from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName.vue'
import ContentTypesCategoryItem from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryItem.vue'
import ContentTypesEntry from '@/components/ContentTypes/ContentTypesCategories/ContentTypesEntry.vue'
import FilterType from './FilterType.vue'
import contentTypeCategoriesJson from '@/utils/contentTypeCategories.json'
import settings from '@/utils/settings'
import { getDocumentTypeLabel } from '@/utils/utils'
import { useContentTypeCategories } from '@/composables/useContentTypeCategories'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useSearchStore } from '@/store/modules'

const { t, te } = useI18n()

const CATEGORY_FILTER_NAME = 'contentTypeCategory'

const props = defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const grouped = ref(true)

const filterTypeRef = useTemplateRef('filterTypeRef')
const entries = computed(() => filterTypeRef.value?.entries ?? [])
const contentTypes = computed(() => entries.value.map(entry => entry.item.key))

const { categories } = useContentTypeCategories(contentTypes)
const { hasFilterValue, toggleFilterValue, getFilterByName, computedAll, computedTotal } = useSearchFilter()
const searchStore = useSearchStore.inject()

// Read the sort option directly from the search store so the grouped category
// order reacts to dropdown changes in FilterType.vue without any prop plumbing.
const sort = computed(() => searchStore.sortFilters[props.filter.name] ?? {
  sortBy: settings.filter.sortBy,
  orderBy: settings.filter.orderBy
})
const categoryJsonOrder = Object.keys(contentTypeCategoriesJson)
const categoryLabelFor = (category) => {
  const key = `filter.contentTypeCategory.${category}`
  return te(key) ? t(key) : category
}

// The hidden companion filter (`contentTypeCategory`) holds the high-level
// category selection whenever every MIME type in a category is picked.
const categoryFilter = computed(() => getFilterByName(CATEGORY_FILTER_NAME))

const allSelected = computedAll(toRef(props, 'filter'))
// Mirror FilterTypeAll: show the unfiltered hit total when no selection is
// active, and hide the count (null) once the user has picked anything.
const totalCount = computedTotal(toRef(props, 'filter'))

const entryFor = contentType => entries.value.find(entry => entry.item.key === contentType)

const entryCount = contentType => entryFor(contentType)?.item.doc_count ?? 0

// Reverse-lookup: returns the category key (e.g. "DOCUMENT") that owns a
// given MIME type, or `null` when the type is not grouped.
const categoryForContentType = (contentType) => {
  const match = Object.entries(categories.value).find(([, types]) => types.includes(contentType))
  return match ? match[0] : null
}

const isCategoryStored = (category) => {
  if (!categoryFilter.value) {
    return false
  }
  return hasFilterValue(categoryFilter.value, { key: category })
}

// A type is "selected" either because it appears in the `contentType` filter
// or because the entire category it belongs to is stored in `contentTypeCategory`.
const isEntrySelected = (contentType) => {
  const entry = entryFor(contentType)
  if (entry && hasFilterValue(props.filter, entry.item)) {
    return true
  }
  const category = categoryForContentType(contentType)
  return !!category && isCategoryStored(category)
}

const categorySelectedCount = types =>
  types.filter(contentType => isEntrySelected(contentType)).length

// Fully-selected means either the category lives in the hidden category filter
// OR every individual type inside the category is ticked in the `contentType` filter.
const categoryAllSelected = (category, types) => {
  if (isCategoryStored(category)) {
    return true
  }
  const selected = categorySelectedCount(types)
  return selected > 0 && selected === types.length
}

// Indeterminate: some (but not all) individual types are ticked and the category
// is not stored in the hidden filter (a stored category is always fully checked).
const categoryIndeterminate = (category, types) => {
  if (isCategoryStored(category)) {
    return false
  }
  const selected = categorySelectedCount(types)
  return selected > 0 && selected < types.length
}

const currentContentTypes = () => searchStore.values[props.filter.name] ?? []
const currentCategories = () => searchStore.values[CATEGORY_FILTER_NAME] ?? []

const writeContentTypes = (values) => {
  searchStore.setFilterValue({ name: props.filter.name, value: uniq(values) })
}

const writeCategories = (values) => {
  if (!categoryFilter.value) {
    return
  }
  searchStore.setFilterValue({ name: CATEGORY_FILTER_NAME, value: uniq(values) })
}

// Smart category toggle — a single write per affected filter instead of N:
//   * checked   → remove every individual `contentType` value in the category
//                 and write a single `contentTypeCategory` value instead.
//   * unchecked → remove the `contentTypeCategory` value and clear every
//                 individual `contentType` value that belonged to the category.
const toggleCategory = (category, types, checked) => {
  const remainingTypes = currentContentTypes().filter(value => !types.includes(value))
  writeContentTypes(remainingTypes)

  const categoriesSet = currentCategories().filter(value => value !== category)
  writeCategories(checked ? [...categoriesSet, category] : categoriesSet)
}

// Smart entry toggle:
//   * Checking the last remaining type in a category promotes the selection
//     to a single `contentTypeCategory` value (auto-collapse).
//   * Un-ticking a type inside a category that is currently stored expands the
//     category back into the remaining individual `contentType` values.
//   * Otherwise, we just flip the individual `contentType` value.
const toggleEntry = (contentType, checked) => {
  const category = categoryForContentType(contentType)

  if (checked) {
    const categoryTypes = category ? categories.value[category] ?? [] : []
    const currentTypes = currentContentTypes()
    const siblings = categoryTypes.filter(type => type !== contentType)
    const categoryAlreadyStored = category && currentCategories().includes(category)
    const completesCategory
      = category
        && !categoryAlreadyStored
        && siblings.length > 0
        && siblings.every(type => currentTypes.includes(type))

    if (completesCategory) {
      writeContentTypes(currentTypes.filter(value => !categoryTypes.includes(value)))
      writeCategories([...currentCategories(), category])
      return
    }

    writeContentTypes([...currentTypes, contentType])
    return
  }

  if (category && isCategoryStored(category)) {
    const remaining = categories.value[category].filter(type => type !== contentType)
    // Drop the unchecked type too, in case a URL-tampering edge case left it
    // stored both under contentType and implicitly under contentTypeCategory.
    const others = currentContentTypes().filter(value => value !== contentType)
    writeCategories(currentCategories().filter(value => value !== category))
    writeContentTypes([...others, ...remaining])
    return
  }

  writeContentTypes(currentContentTypes().filter(value => value !== contentType))
}

const categoryCount = types =>
  types.reduce((sum, contentType) => sum + entryCount(contentType), 0)

// Ordered [category, types] pairs derived from the selected sort option.
// Never mutates the original `categories` record or `contentTypeCategories.json`.
const sortedCategoryEntries = computed(() => {
  const pairs = Object.entries(categories.value)
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
    // Stable tie-break: fall back to the order defined in contentTypeCategories.json.
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

// Apply the same sort option to the MIME types nested inside a category so the
// two levels stay consistent. Mirrors `sortedCategoryEntries` but operates on
// bucket `doc_count` and the label returned by `getDocumentTypeLabel`.
const sortedTypesFor = (types) => {
  const { sortBy, orderBy } = sort.value
  const direction = orderBy === 'asc' ? 1 : -1

  const byCount = (aType, bType) => {
    const diff = entryCount(aType) - entryCount(bType)
    if (diff !== 0) {
      return diff * direction
    }
    // Stable tie-break by label so equal counts land in a deterministic order.
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

defineExpose({
  grouped,
  categoryAllSelected,
  categoryIndeterminate,
  isEntrySelected,
  sortedCategoryEntries,
  sortedTypesFor,
  toggleCategory,
  toggleEntry
})
</script>

<template>
  <filter-type
    ref="filterTypeRef"
    :filter="props.filter"
    :hide-search="grouped"
  >
    <template #all>
      <content-types-all
        v-model="allSelected"
        :count="totalCount"
      />
    </template>
    <template #default="{ entries: slotEntries }">
      <content-types-categories>
        <template v-if="grouped">
          <content-types-category
            v-for="[category, types] in sortedCategoryEntries"
            :key="category"
          >
            <content-types-category-name
              :category="category"
              :count="categoryCount(types)"
              :model-value="categoryAllSelected(category, types)"
              :indeterminate="categoryIndeterminate(category, types)"
              @update:model-value="toggleCategory(category, types, $event)"
            />
            <content-types-category-item
              v-for="contentType in sortedTypesFor(types)"
              :key="contentType"
              :content-type="contentType"
              :count="entryCount(contentType)"
              :model-value="isEntrySelected(contentType)"
              @update:model-value="toggleEntry(contentType, $event)"
            />
          </content-types-category>
        </template>
        <template v-else>
          <content-types-entry
            v-for="entry in slotEntries"
            :key="entry.item.key"
            :content-type="entry.item.key"
            :count="entry.item.doc_count"
            :model-value="hasFilterValue(props.filter, entry.item)"
            @update:model-value="toggleFilterValue(props.filter, entry.item, $event)"
          />
        </template>
      </content-types-categories>
    </template>

    <template #actions>
      <button-toggle-content-types-view v-model:grouped="grouped" />
    </template>
  </filter-type>
</template>
