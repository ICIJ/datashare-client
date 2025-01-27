<script setup>
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import Task from '@/views/Task/Task'
import TaskList from '@/components/Task/TaskList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayProgress from '@/components/Display/DisplayProgress'
import { useTaskSettings } from '@/views/Task/task-settings'

const { t } = useI18n()
const store = useStore()
const settingName = 'batch-download'

const { propertiesModelValueOptions } = useTaskSettings(settingName, store, t)
/* function isBatchDownloadEncrypted(item) {
  return item.name.includes('BatchDownload') && item.args.batchDownload.encrypted
}
function hasZipSize(item) {
  return item.name.includes('BatchDownload') && item.state !== 'ERROR' && item.result?.size !== undefined
} */
</script>
<template>
  <task
    v-slot="{ tasks, sort, order, updateSort, updateOrder, empty }"
    :task-filter="['org.icij.datashare.tasks.BatchDownloadRunner']"
    page-name="batch-download"
  >
    <task-list
      v-if="!empty"
      :tasks="tasks"
      :columns="propertiesModelValueOptions"
      :sort="sort"
      :order="order"
      @update:sort="updateSort"
      @update:order="updateOrder"
    >
      <template #cell(state)="{ item }"><display-status :value="item.state" /></template>
      <template #cell(createdAt)="{ item }"><display-datetime-from-now :value="item.createdAt" /></template>
      <template #cell(progress)="{ item }"><display-progress :value="item.progress" /></template>
    </task-list>
  </task>
</template>
