<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import PageTableTh from '@/components/PageTable/PageTableTh'
import { useBreakpoints } from '@/composables/useBreakpoints'

const { breakpointDown } = useBreakpoints()

const props = defineProps({
  compactBreakpoint: {
    type: String,
    default: 'md'
  }
})

const { t } = useI18n()

const compact = computed(() => {
  return breakpointDown.value[props.compactBreakpoint]
})
</script>

<template>
  <page-table-th
    :label="t('projectEntriesTableHead.name')"
    :icon="PhCirclesThreePlus"
    emphasis
    sortable
    name="name"
  />
  <page-table-th
    v-if="!compact"
    :label="t('projectEntriesTableHead.description')"
    :icon="PhTextAlignLeft"
    name="description"
  />
  <page-table-th
    :label="t('projectEntriesTableHead.documents')"
    :icon="PhFiles"
    number
    sortable
    name="documentsCount"
  />
  <page-table-th
    :label="t('projectEntriesTableHead.updatedOn')"
    :icon="PhCalendarBlank"
    sortable
    name="updateDate"
  />
  <page-table-th
    :label="t('projectEntriesTableHead.links')"
    hide-label
    name="links"
  />
  <page-table-th
    :label="t('projectEntriesTableHead.actions')"
    hide-label
    name="actions"
  />
</template>
