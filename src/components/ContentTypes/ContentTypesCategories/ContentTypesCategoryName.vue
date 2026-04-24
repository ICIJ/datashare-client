<script setup>
import { computed } from 'vue'

import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import { useContentTypeCategoryLabel } from '@/composables/useContentTypeCategoryLabel'

const modelValue = defineModel({ type: Boolean, default: false })

const props = defineProps({
  category: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  indeterminate: {
    type: Boolean
  }
})

const categoryLabel = useContentTypeCategoryLabel()
const resolvedLabel = computed(() => categoryLabel(props.category))
</script>

<template>
  <filters-panel-section-filter-entry
    v-model="modelValue"
    class="content-types-category-name"
    :label="resolvedLabel"
    :count="count"
    :indeterminate="indeterminate"
  />
</template>
