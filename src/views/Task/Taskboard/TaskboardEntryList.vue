<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import TaskboardEntry from '@/components/Task/Taskboard/TaskboardEntry'
import { TASK_NAME, TASK_NAME_ICON } from '@/enums/taskNames'
const batchSearchesPublic = ref(13)
const batchSearchesPrivate = ref(0)
const batchDownloads = ref(45)
const findEntities = ref(3)
const documentAdditions = ref(4)
const { t } = useI18n()
const taskEntries = [
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
  <div class="taskboard-entry-list container-fluid bg-tertiary-subtle py-4">
    <div class="row justify-content-around g-5 mx-2">
      <div v-for="(task, index) in taskEntries" :key="index" class="col-12 col-xl-6">
        <taskboard-entry
          :icon="task.icon"
          :title="t(`${task.key}.title`)"
          :description="t(`${task.key}.description`)"
          :info="task.infoComp ?? t(`${task.key}.info`, task.info)"
          :list-link="task.listLink"
          :action-link="task.actionLink"
          :action-text="t(`${task.key}.actionText`)"
          class="h-100 d-flex flex-column"
        >
        </taskboard-entry>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
