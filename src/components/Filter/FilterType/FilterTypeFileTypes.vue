<script setup>
import { computed, ref, toRef, useTemplateRef } from 'vue'

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
import { useContentTypeSearchFilter } from '@/composables/useContentTypeSearchFilter'
import { useContentTypeSelection } from '@/composables/useContentTypeSelection'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useSearchStore } from '@/store/modules'

const props = defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const grouped = ref(true)
const filterRef = toRef(props, 'filter')

const filterTypeRef = useTemplateRef('filterTypeRef')
const entries = computed(() => filterTypeRef.value?.entries ?? [])
const contentTypes = computed(() => entries.value.map(entry => entry.item.key))

const { categories } = useContentTypeCategories(contentTypes)
const {
  toggleFilterValue,
  hasFilterValue,
  computedAll,
  computedTotal
} = useSearchFilter()
const searchStore = useSearchStore.inject()
const categoryLabelFor = useContentTypeCategoryLabel()

const {
  isEntrySelected,
  isEntryRetainedDuringSearch,
  categoryAllSelected,
  categoryIndeterminate,
  toggleCategory,
  toggleEntry
} = useContentTypeSelection({ filter: filterRef, categories })

const {
  query,
  visibleTypesFor,
  visibleEntries,
  filteredCategoryPairs
} = useContentTypeSearchFilter({
  contentTypes,
  categories,
  categoryLabelFor,
  isContentTypeRetained: isEntryRetainedDuringSearch
})

const sort = computed(() => searchStore.sortFilters[props.filter.name] ?? {
  sortBy: settings.filter.sortBy,
  orderBy: settings.filter.orderBy
})
const categoryJsonOrder = Object.keys(contentTypeCategoriesJson)

const allSelected = computedAll(filterRef)
const totalCount = computedTotal(filterRef)

// O(1) lookup of doc counts so the template loop and sort comparator don't
// pay linear-search costs per call.
const entryCountMap = computed(() => {
  const map = new Map()
  entries.value.forEach(entry => map.set(entry.item.key, entry.item.doc_count ?? 0))
  return map
})

const entryCount = contentType => entryCountMap.value.get(contentType) ?? 0
const categoryCount = types =>
  types.reduce((sum, contentType) => sum + entryCount(contentType), 0)

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
