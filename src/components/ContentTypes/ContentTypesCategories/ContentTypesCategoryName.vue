<script setup>
import { computed } from 'vue'

import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import categories from '@/utils/contentTypeCategories.json'

const modelValue = defineModel({ type: Boolean, default: false })

const props = defineProps({
  label: {
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

// Resolve the human-readable category label via `contentTypeCategories.json`;
// fall back to the raw prop value when it doesn't match any known category key.
const resolvedLabel = computed(() => categories[props.label]?.label ?? props.label)
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
