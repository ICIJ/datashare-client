<script setup>
import { computed, ref, toRef, useTemplateRef } from 'vue'
import { deburr, isEqual } from 'lodash'

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
import { useContentTypeCategoryLabel } from '@/composables/useContentTypeCategoryLabel'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useSearchStore } from '@/store/modules'
import { CONTENT_TYPE_CATEGORY_FILTER_NAME } from '@/store/filters/FilterContentTypeCategory'

const props = defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const grouped = ref(true)
const query = ref('')

const filterTypeRef = useTemplateRef('filterTypeRef')
const entries = computed(() => filterTypeRef.value?.entries ?? [])
const contentTypes = computed(() => entries.value.map(entry => entry.item.key))

const { categories } = useContentTypeCategories(contentTypes)
const {
  toggleFilterValue,
  hasFilterValue,
  getFilterByName,
  getFilterValuesByName,
  computedAll,
  computedTotal
} = useSearchFilter()
const searchStore = useSearchStore.inject()
const categoryLabelFor = useContentTypeCategoryLabel()

const normalizeForSearch = value => deburr(String(value ?? '')).toLowerCase()
const normalizedQuery = computed(() => normalizeForSearch(query.value))
const hasQuery = computed(() => normalizedQuery.value !== '')

// Precompute deburred haystacks once per (entries/categories/locale) change so
// the per-keystroke filter doesn't redo deburr+lowercase across every label
// and MIME key on every render.
const categoryHaystacks = computed(() => {
  const map = new Map()
  Object.keys(categories.value).forEach((category) => {
    map.set(category, normalizeForSearch(categoryLabelFor(category)))
  })
  return map
})

const contentTypeHaystacks = computed(() => {
  const map = new Map()
  contentTypes.value.forEach((contentType) => {
    const key = normalizeForSearch(contentType)
    const label = normalizeForSearch(getDocumentTypeLabel(contentType))
    map.set(contentType, `${key}\n${label}`)
  })
  return map
})

const matchesContentType = (contentType) => {
  if (!hasQuery.value) {
    return true
  }
  return contentTypeHaystacks.value.get(contentType)?.includes(normalizedQuery.value) ?? false
}

const matchesCategory = (category) => {
  if (!hasQuery.value) {
    return true
  }
  return categoryHaystacks.value.get(category)?.includes(normalizedQuery.value) ?? false
}

// Keep selected and category-implied types visible while typing so the user
// doesn't appear to "lose" a selection.
const isContentTypeVisible = contentType =>
  matchesContentType(contentType) || isEntryRetainedDuringSearch(contentType)

// A category-label hit short-circuits per-type filtering: every type the API
// returned for that category stays visible, even those that don't individually
// match the query.
const visibleTypesFor = (category, types) => {
  if (!hasQuery.value || matchesCategory(category)) {
    return types
  }
  return types.filter(isContentTypeVisible)
}

const visibleEntries = (slotEntries) => {
  if (!hasQuery.value) {
    return slotEntries
  }
  return slotEntries.filter(entry => isContentTypeVisible(entry.item.key))
}

const sort = computed(() => searchStore.sortFilters[props.filter.name] ?? {
  sortBy: settings.filter.sortBy,
  orderBy: settings.filter.orderBy
})
const categoryJsonOrder = Object.keys(contentTypeCategoriesJson)

const categoryFilter = computed(() => getFilterByName(CONTENT_TYPE_CATEGORY_FILTER_NAME))

const allSelected = computedAll(toRef(props, 'filter'))
const totalCount = computedTotal(toRef(props, 'filter'))

// O(1) lookups derived from `entries` and `categories` so the template loop
// and sort comparator don't pay linear-search costs per call.
const entryCountMap = computed(() => {
  const map = new Map()
  entries.value.forEach(entry => map.set(entry.item.key, entry.item.doc_count ?? 0))
  return map
})
const categoryByContentType = computed(() => {
  const map = new Map()
  Object.entries(categories.value).forEach(([category, types]) => {
    types.forEach(type => map.set(type, category))
  })
  return map
})

const entryCount = contentType => entryCountMap.value.get(contentType) ?? 0
const categoryForContentType = contentType => categoryByContentType.value.get(contentType) ?? null

const currentContentTypes = () => getFilterValuesByName(props.filter.name)
const currentCategories = () => getFilterValuesByName(CONTENT_TYPE_CATEGORY_FILTER_NAME)

const isCategoryStored = category => currentCategories().includes(category)

// Explicit-only set so a category-implied child still renders unchecked.
const selectedContentTypeSet = computed(() => new Set(currentContentTypes()))

// Superset including category-implied children, used only by the search box
// so a category-covered row stays visible when its label stops matching.
const retainedContentTypeSet = computed(() => {
  const set = new Set(currentContentTypes())
  currentCategories().forEach((category) => {
    const types = categories.value[category] ?? []
    types.forEach(type => set.add(type))
  })
  return set
})

const isEntrySelected = contentType => selectedContentTypeSet.value.has(contentType)
const isEntryRetainedDuringSearch = contentType => retainedContentTypeSet.value.has(contentType)

const categorySelectedCount = types => types.filter(isEntrySelected).length

const categoryAllSelected = (category, types) => {
  if (isCategoryStored(category)) {
    return true
  }
  const selected = categorySelectedCount(types)
  return selected > 0 && selected === types.length
}

const categoryIndeterminate = (category, types) => {
  if (isCategoryStored(category)) {
    return false
  }
  const selected = categorySelectedCount(types)
  return selected > 0 && selected < types.length
}

// Guard against no-op writes so downstream watchers (route sync, query
// refresh) don't fire when the user's action produced no actual change.
const writeContentTypes = (values) => {
  const next = [...new Set(values)]
  if (isEqual([...next].sort(), [...currentContentTypes()].sort())) {
    return
  }
  searchStore.setFilterValue({ name: props.filter.name, value: next })
}

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

const toggleCategory = (category, types, checked) => {
  writeContentTypes(currentContentTypes().filter(value => !types.includes(value)))
  const remainingCategories = currentCategories().filter(value => value !== category)
  writeCategories(checked ? [...remainingCategories, category] : remainingCategories)
}

// Drop `category` and replace any explicit child it covered with `keepFromCategory`.
// Shared by demote (keep just the clicked child) and uncheck-with-stored-category
// (keep the surviving siblings).
const dropCategoryAnd = (category, keepFromCategory) => {
  const categoryTypes = categories.value[category] ?? []
  const others = currentContentTypes().filter(value => !categoryTypes.includes(value))
  writeCategories(currentCategories().filter(value => value !== category))
  writeContentTypes([...others, ...keepFromCategory])
}

// True when checking `contentType` would tick every remaining sibling of its
// category, so the selection can be promoted to a single hidden-filter value.
const shouldPromoteToCategory = (category, contentType, currentTypes) => {
  if (!category || currentCategories().includes(category)) {
    return false
  }
  const siblings = (categories.value[category] ?? []).filter(type => type !== contentType)
  return siblings.length > 0 && siblings.every(type => currentTypes.includes(type))
}

const toggleEntry = (contentType, checked) => {
  const category = categoryForContentType(contentType)

  if (checked) {
    const currentTypes = currentContentTypes()
    // Demote: clicking a child of a stored category narrows the selection to
    // that single child.
    if (category && isCategoryStored(category)) {
      dropCategoryAnd(category, [contentType])
      return
    }
    if (shouldPromoteToCategory(category, contentType, currentTypes)) {
      const categoryTypes = categories.value[category] ?? []
      writeContentTypes(currentTypes.filter(value => !categoryTypes.includes(value)))
      writeCategories([...currentCategories(), category])
      return
    }
    writeContentTypes([...currentTypes, contentType])
    return
  }

  // Defensive: URL-tamper or race may store both the category and an explicit
  // child. Normal flow now hits the demote branch above, so this only fires
  // for tampered state.
  if (category && isCategoryStored(category)) {
    const siblings = (categories.value[category] ?? []).filter(type => type !== contentType)
    dropCategoryAnd(category, siblings)
    return
  }

  writeContentTypes(currentContentTypes().filter(value => value !== contentType))
}

const categoryCount = types =>
  types.reduce((sum, contentType) => sum + entryCount(contentType), 0)

// Empty-query fast path returns the original pairs ref so the grouped view
// re-renders identically when no filter is active.
const filteredCategoryPairs = computed(() => {
  const pairs = Object.entries(categories.value)
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

const sortedCategoryEntries = computed(() => {
  const pairs = filteredCategoryPairs.value
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
    v-model:query="query"
    :filter="props.filter"
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
              v-for="contentType in sortedTypesFor(visibleTypesFor(category, types))"
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
            v-for="entry in visibleEntries(slotEntries)"
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
