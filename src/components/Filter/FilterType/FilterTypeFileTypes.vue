<script setup>
import { computed, ref, useTemplateRef } from 'vue'

import ButtonToggleContentTypesView from '@/components/Button/ButtonToggleContentTypesView.vue'
import ContentTypesView from '@/components/ContentTypes/ContentTypesView/ContentTypesView.vue'
import ContentTypesViewCategory from '@/components/ContentTypes/ContentTypesView/ContentTypesViewCategory.vue'
import ContentTypesViewCategoryName from '@/components/ContentTypes/ContentTypesView/ContentTypesViewCategoryName.vue'
import ContentTypesViewCategoryEntry from '@/components/ContentTypes/ContentTypesView/ContentTypesViewCategoryEntry.vue'
import ContentTypesViewEntry from '@/components/ContentTypes/ContentTypesView/ContentTypesViewEntry.vue'
import FilterType from './FilterType.vue'
import { useContentTypeCategories } from '@/composables/useContentTypeCategories'

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
const contentTypes = computed(() =>
  (filterTypeRef.value?.entries ?? []).map(entry => entry.item.key)
)

const { categories } = useContentTypeCategories(contentTypes)
</script>

<template>
  <filter-type
    ref="filterTypeRef"
    :filter="props.filter"
    :hide-search="grouped"
  >
    <template #default="{ entries }">
      <content-types-view>
        <template v-if="grouped">
          <content-types-view-category
            v-for="(types, category) in categories"
            :key="category"
          >
            <content-types-view-category-name :label="category" />
            <content-types-view-category-entry
              v-for="contentType in types"
              :key="contentType"
              :content-type="contentType"
            />
          </content-types-view-category>
        </template>
        <template v-else>
          <content-types-view-entry
            v-for="entry in entries"
            :key="entry.item.key"
            :content-type="entry.item.key"
          />
        </template>
      </content-types-view>
    </template>

    <template #actions>
      <button-toggle-content-types-view v-model:grouped="grouped" />
    </template>
  </filter-type>
</template>
