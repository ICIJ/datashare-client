<script setup>
import { useI18n } from 'vue-i18n'

import PageTableTh from '@/components/PageTable/PageTableTh'

const { t } = useI18n()
</script>

<template>
  <page-table-th :label="t('projectEntriesTableHead.name')" icon="circles-three-plus" emphasis />
  <page-table-th :label="t('projectEntriesTableHead.description')" />
  <page-table-th :label="t('projectEntriesTableHead.documents')" icon="files" number />
  <page-table-th :label="t('projectEntriesTableHead.updatedOn')" icon="calendar-blank" />
  <page-table-th :label="t('projectEntriesTableHead.links')" hide-label />
  <page-table-th :label="t('projectEntriesTableHead.actions')" hide-label />
</template>
