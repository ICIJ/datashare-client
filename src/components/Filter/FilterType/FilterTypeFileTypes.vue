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
import { useContentTypeCategories } from '@/composables/useContentTypeCategories'
import { useContentTypeCategoryLabel } from '@/composables/useContentTypeCategoryLabel'
import { useContentTypeSearchFilter } from '@/composables/useContentTypeSearchFilter'
import { useContentTypeSelection } from '@/composables/useContentTypeSelection'
import { useContentTypeSort } from '@/composables/useContentTypeSort'
import { useSearchFilter } from '@/composables/useSearchFilter'

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

const {
  entryCount,
  categoryCount,
  sortedCategoryEntries,
  sortedTypesFor
} = useContentTypeSort({
  entries,
  filter: filterRef,
  categoryLabelFor,
  filteredCategoryPairs
})

const allSelected = computedAll(filterRef)
const totalCount = computedTotal(filterRef)

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
