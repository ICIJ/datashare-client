<script setup>
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import { useSearchFilter } from '@/composables/useSearchFilter'

const props = defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
const { computedAll } = useSearchFilter()

const all = computedAll(toRef(props, 'filter'))
</script>

<template>
  <filters-panel-section-filter-entry
    v-model="all"
    :disabled="all"
    hide-count
    :label="t('filterTypeAll.label')"
  />
</template>
