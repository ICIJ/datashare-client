<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'

const modelValue = defineModel({ type: Boolean, default: false })

const props = defineProps({
  count: {
    type: Number,
    default: null
  },
  label: {
    type: String,
    default: null
  }
})

const { t } = useI18n()
// Hide the badge when no count is available (e.g. after the user makes a
// selection and `computedTotal` switches to null).
const hideCount = computed(() => props.count === null)
</script>

<template>
  <filters-panel-section-filter-entry
    v-model="modelValue"
    class="content-types-all"
    :label="label ?? t('filterTypeAll.label')"
    :count="count ?? 0"
    :hide-count="hideCount"
    :disabled="modelValue"
  />
</template>
