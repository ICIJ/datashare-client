<script setup>
import { computed } from 'vue'

import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import { getDocumentTypeLabel } from '@/utils/utils'

const modelValue = defineModel({ type: Boolean, default: false })

const props = defineProps({
  contentType: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
})

const label = computed(() => getDocumentTypeLabel(props.contentType))
</script>

<template>
  <filters-panel-section-filter-entry
    v-model="modelValue"
    class="content-types-category-item"
    :label="label"
    :count="count"
  />
</template>
