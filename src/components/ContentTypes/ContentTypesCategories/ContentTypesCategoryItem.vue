<script setup>
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'

const modelValue = defineModel({ type: Boolean, default: false })

defineProps({
  contentType: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <filters-panel-section-filter-entry
    v-model="modelValue"
    class="content-types-category-item"
    :label="contentType"
    :count="count"
  />
</template>
