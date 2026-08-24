<script setup>
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import { useSearchFilter } from '@/composables/useSearchFilter'

const props = defineProps({
  filter: {
    type: Object,
    required: true
  },
  // Same escape hatch as FilterType.vue's own hideLock: a "clear all" here
  // must not unlock the user's real personal lock store when this instance
  // is rendered against a non-live search store (e.g. the batch-search
  // creation form).
  hideLock: {
    type: Boolean
  }
})

const { t } = useI18n()
const { computedAll } = useSearchFilter()

const all = computedAll(toRef(props, 'filter'), { skipUnlock: props.hideLock })
</script>

<template>
  <filters-panel-section-filter-entry
    v-model="all"
    :disabled="all"
    hide-count
    :label="t('filterTypeAll.label')"
  />
</template>
