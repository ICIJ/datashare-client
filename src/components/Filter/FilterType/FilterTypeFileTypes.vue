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
import { useSearchFilter } from '@/composables/useSearchFilter'

const props = defineProps({
  filter: {
    type: Object,
    required: true
  },
  hideCount: {
    type: Boolean
  }
})

const grouped = ref(true)

const filterTypeRef = useTemplateRef('filterTypeRef')
const entries = computed(() => filterTypeRef.value?.entries ?? [])
const contentTypes = computed(() => entries.value.map(entry => entry.item.key))

const { categories } = useContentTypeCategories(contentTypes)
const { hasFilterValue, toggleFilterValue, computedAll } = useSearchFilter()

const allSelected = computedAll(toRef(props, 'filter'))
const totalCount = computed(() =>
  entries.value.reduce((sum, entry) => sum + (entry.item.doc_count ?? 0), 0)
)

const entryFor = contentType => entries.value.find(entry => entry.item.key === contentType)

const entryCount = contentType => entryFor(contentType)?.item.doc_count ?? 0

const isEntrySelected = (contentType) => {
  const entry = entryFor(contentType)
  return entry ? hasFilterValue(props.filter, entry.item) : false
}

const toggleEntry = async (contentType, checked) => {
  const entry = entryFor(contentType)
  if (entry) {
    await toggleFilterValue(props.filter, entry.item, checked)
  }
}

const categoryCount = types =>
  types.reduce((sum, contentType) => sum + entryCount(contentType), 0)

const categorySelectedCount = types =>
  types.filter(contentType => isEntrySelected(contentType)).length

const categoryAllSelected = (types) => {
  const selected = categorySelectedCount(types)
  return selected > 0 && selected === types.length
}

const categoryIndeterminate = (types) => {
  const selected = categorySelectedCount(types)
  return selected > 0 && selected < types.length
}

const toggleCategory = async (types, checked) => {
  for (const contentType of types) {
    if (isEntrySelected(contentType) !== checked) {
      await toggleEntry(contentType, checked)
    }
  }
}
</script>

<template>
  <filter-type
    ref="filterTypeRef"
    :filter="props.filter"
    :hide-search="grouped"
  >
    <template #all />
    <template #default="{ entries: slotEntries }">
      <content-types-categories>
        <content-types-all
          v-model="allSelected"
          :count="totalCount"
        />
        <template v-if="grouped">
          <content-types-category
            v-for="(types, category) in categories"
            :key="category"
          >
            <content-types-category-name
              :label="category"
              :count="categoryCount(types)"
              :model-value="categoryAllSelected(types)"
              :indeterminate="categoryIndeterminate(types)"
              @update:model-value="toggleCategory(types, $event)"
            />
            <content-types-category-item
              v-for="contentType in types"
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
