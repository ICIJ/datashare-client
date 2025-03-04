<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import TaskBoardLatest from '@/views/Task/TaskBoard/TaskBoardLatest'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskBoardEntryList from '@/components/Task/TaskBoard/TaskBoardEntryList'
import { TASK_NAME, TASK_NAME_ICON } from '@/enums/taskNames'
const { t } = useI18n()
const batchSearchesPublic = ref(13)
const batchSearchesPrivate = ref(0)
const batchDownloads = ref(45)
const findEntities = ref(3)
const documentAdditions = ref(4)
const entries = [
  {
    key: 'task.task-board.entries.batch-search',
    icon: TASK_NAME_ICON[TASK_NAME.BATCH_SEARCH],
    infoComp: computed(() => {
      const nbPublic = t('task.task-board.entries.batch-search.nbPublic', batchSearchesPublic.value)
      const nbPrivate = t('task.task-board.entries.batch-search.nbPrivate', batchSearchesPrivate.value)
      return t('task.task-board.entries.batch-search.info', { nbPublic, nbPrivate })
    }),
    listLink: { name: 'task.batch-search.list' },
    actionLink: { name: 'task.batch-search.new' }
  },
  {
    key: 'task.task-board.entries.batch-download',
    icon: TASK_NAME_ICON[TASK_NAME.BATCH_DOWNLOAD],
    listLink: { name: 'task.batch-download.list' },
    info: batchDownloads.value
  },
  {
    key: 'task.task-board.entries.entity-recognition',
    icon: TASK_NAME_ICON[TASK_NAME.EXTRACT_NLP],
    info: findEntities.value,
    listLink: { name: 'task.entities.list' },
    actionLink: { name: 'task.entities.new' }
  },
  {
    key: 'task.task-board.entries.document-addition',
    icon: TASK_NAME_ICON[TASK_NAME.INDEX],
    info: documentAdditions.value,
    listLink: { name: 'task.documents.list' },
    actionLink: { name: 'task.documents.new' }
  }
]
</script>

<template>
  <page-container fluid deck class="task-board">
    <page-header no-toggle-settings />
    <task-board-latest />
    <task-board-entry-list :entries="entries" />
  </page-container>
</template>
