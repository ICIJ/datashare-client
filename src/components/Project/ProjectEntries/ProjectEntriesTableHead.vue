<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhCirclesThreePlus from '~icons/ph/circles-three-plus'
import IPhFiles from '~icons/ph/files'
import IPhCalendarBlank from '~icons/ph/calendar-blank'
import IPhTextAlignLeft from '~icons/ph/text-align-left'
import IPhUserSquare from '~icons/ph/user-square'

import PageTableTh from '@/components/PageTable/PageTableTh'
import { useBreakpoints } from '@/composables/useBreakpoints'
import ModeServerOnly from '@/components/Mode/ModeServerOnly'

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
    :icon="IPhCirclesThreePlus"
    emphasis
    sortable
    name="name"
  />
  <page-table-th
    v-if="!compact"
    :label="t('projectEntriesTableHead.description')"
    :icon="IPhTextAlignLeft"
    name="description"
  />
  <page-table-th
    :label="t('projectEntriesTableHead.documents')"
    :icon="IPhFiles"
    number
    sortable
    name="documentsCount"
  />
  <page-table-th
    :label="t('projectEntriesTableHead.updatedOn')"
    :icon="IPhCalendarBlank"
    sortable
    name="updateDate"
  />
  <mode-server-only>
    <page-table-th
      :label="t('projectEntriesTableHead.userRoles')"
      :icon="IPhUserSquare"
      sortable
      name="userRoles"
    />
  </mode-server-only>
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
