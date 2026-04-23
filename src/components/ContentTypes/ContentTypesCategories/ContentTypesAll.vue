<script setup>
import { useI18n } from 'vue-i18n'

import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'

const modelValue = defineModel({ type: Boolean, default: false })

defineProps({
  count: {
    type: Number,
    default: 0
  },
  label: {
    type: String,
    default: null
  }
})

const { t } = useI18n()
</script>

<template>
  <filters-panel-section-filter-entry
    v-model="modelValue"
    class="content-types-all"
    :label="label ?? t('filterTypeAll.label')"
    :count="count"
    :disabled="modelValue"
  />
</template>
