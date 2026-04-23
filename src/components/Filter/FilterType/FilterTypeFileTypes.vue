<script setup>
import { computed, ref, useTemplateRef } from 'vue'

import ButtonToggleFileTypesGrouped from '@/components/Button/ButtonToggleFileTypesGrouped.vue'
import FileTypesView from '@/components/FileTypes/FileTypesView/FileTypesView.vue'
import FileTypesViewCategory from '@/components/FileTypes/FileTypesView/FileTypesViewCategory.vue'
import FileTypesViewCategoryName from '@/components/FileTypes/FileTypesView/FileTypesViewCategoryName.vue'
import FileTypesViewCategoryEntry from '@/components/FileTypes/FileTypesView/FileTypesViewCategoryEntry.vue'
import FileTypesViewEntry from '@/components/FileTypes/FileTypesView/FileTypesViewEntry.vue'
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
      <file-types-view>
        <template v-if="grouped">
          <file-types-view-category
            v-for="(types, category) in categories"
            :key="category"
          >
            <file-types-view-category-name :label="category" />
            <file-types-view-category-entry
              v-for="fileType in types"
              :key="fileType"
              :file-type="fileType"
            />
          </file-types-view-category>
        </template>
        <template v-else>
          <file-types-view-entry
            v-for="entry in entries"
            :key="entry.item.key"
            :file-type="entry.item.key"
          />
        </template>
      </file-types-view>
    </template>

    <template #actions>
      <button-toggle-file-types-grouped v-model:grouped="grouped" />
    </template>
  </filter-type>
</template>
