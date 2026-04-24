<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'

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

const { t, te } = useI18n()

// Resolve the human-readable label via i18n; fall back to the raw category key
// when no translation is registered (e.g. a new category the frontend doesn't know).
const resolvedLabel = computed(() => {
  const key = `filter.contentTypeCategory.${props.category}`
  return te(key) ? t(key) : props.category
})
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
