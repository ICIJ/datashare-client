<script setup>
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'

const modelValue = defineModel({ type: Boolean, default: false })

defineProps({
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
</script>

<template>
  <filters-panel-section-filter-entry
    v-model="modelValue"
    class="content-types-category-name"
    :label="label"
    :count="count"
    :indeterminate="indeterminate"
  />
</template>
