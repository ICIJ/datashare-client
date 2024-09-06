<script setup>
import { useI18n } from 'vue-i18n'
import { PhCirclesThreePlus, PhFiles, PhCalendarBlank } from '@phosphor-icons/vue'

import PageTableTh from '@/components/PageTable/PageTableTh'

const { t } = useI18n()
</script>

<template>
  <page-table-th :label="t('projectEntriesTableHead.name')" :icon="PhCirclesThreePlus" emphasis sortable name="name" />
  <page-table-th :label="t('projectEntriesTableHead.description')" />
  <page-table-th
    :label="t('projectEntriesTableHead.documents')"
    :icon="PhFiles"
    number
    sortable
    name="documentsCount"
  />
  <page-table-th :label="t('projectEntriesTableHead.updatedOn')" :icon="PhCalendarBlank" />
  <page-table-th :label="t('projectEntriesTableHead.links')" hide-label />
  <page-table-th :label="t('projectEntriesTableHead.actions')" hide-label />
</template>
