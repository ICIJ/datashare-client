<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import TaskboardLatest from '@/views/Task/Taskboard/TaskboardLatest'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskboardEntryList from '@/components/Task/Taskboard/TaskboardEntryList'
import { TASK_NAME, TASK_NAME_ICON } from '@/enums/taskNames'
const { t } = useI18n()
const batchSearchesPublic = ref(13)
const batchSearchesPrivate = ref(0)
const batchDownloads = ref(45)
const findEntities = ref(3)
const documentAdditions = ref(4)
const entries = [
  {
    key: 'task.taskboard.entries.batch-search',
    icon: TASK_NAME_ICON[TASK_NAME.BATCH_SEARCH],
    infoComp: computed(() => {
      const nbPublic = t('task.taskboard.entries.batch-search.nbPublic', batchSearchesPublic.value)
      const nbPrivate = t('task.taskboard.entries.batch-search.nbPrivate', batchSearchesPrivate.value)
      return t('task.taskboard.entries.batch-search.info', { nbPublic, nbPrivate })
    }),
    listLink: { name: 'task.batch-search.list' },
    actionLink: { name: 'task.batch-search.new' }
  },
  {
    key: 'task.taskboard.entries.batch-download',
    icon: TASK_NAME_ICON[TASK_NAME.BATCH_DOWNLOAD],
    listLink: { name: 'task.batch-download.list' },
    info: batchDownloads.value
  },
  {
    key: 'task.taskboard.entries.entity-recognition',
    icon: TASK_NAME_ICON[TASK_NAME.EXTRACT_NLP],
    info: findEntities.value,
    listLink: { name: 'task.entities.list' },
    actionLink: { name: 'task.entities.new' }
  },
  {
    key: 'task.taskboard.entries.document-addition',
    icon: TASK_NAME_ICON[TASK_NAME.INDEX],
    info: documentAdditions.value,
    listLink: { name: 'task.documents.list' },
    actionLink: { name: 'task.documents.new' }
  }
]
</script>

<template>
  <page-header no-toggle-settings />
  <page-container fluid class="d-flex flex-column gap-5">
    <taskboard-latest />
    <taskboard-entry-list :entries="entries" />
  </page-container>
</template>
