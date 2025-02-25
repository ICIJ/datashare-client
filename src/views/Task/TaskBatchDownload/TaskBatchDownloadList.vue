<script setup>
import get from 'lodash/get'

import { useTaskSettings } from '@/composables/task-settings'
import TaskList from '@/components/Task/TaskList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayContentLength from '@/components/Display/DisplayContentLength'
import { TASK_NAME } from '@/enums/taskNames'
import TaskPage from '@/views/Task/TaskPage'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import TaskBatchDownloadLink from '@/components/Task/TaskBatchDownload/TaskBatchDownloadLink'
import BatchDownloadActions from '@/components/BatchDownloadActions'

const { propertiesModelValueOptions } = useTaskSettings('batch-download')

function hasZipSize(item) {
  return item.state !== 'ERROR' && item.result?.size !== undefined
}

function getRecord(item, key, defaultValue = undefined) {
  if (key) {
    return get(item, `args.batchDownload.${key}`, defaultValue)
  }
  return get(item, `args.batchDownload`, defaultValue)
}
</script>

<template>
  <task-page
    v-slot="{ tasks, sort, order, updateSort, updateOrder, empty }"
    :task-filter="[TASK_NAME.BATCH_DOWNLOAD]"
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
      <template #cell(state)="{ item }">
        <display-status :value="item.state" />
      </template>

      <template #cell(name)="{ item }"> <task-batch-download-link :item="item" /> </template>

      <template #cell(projects)="{ item }">
        <display-project-list :values="getRecord(item, 'projects')" />
      </template>
      <template #cell(createdAt)="{ item }">
        <display-datetime-from-now :value="item.createdAt" />
      </template>
      <template #cell(size)="{ item }">
        <display-content-length v-if="hasZipSize(item)" :value="item.result.size" class="text-nowrap" />
      </template>
      <template #cell(action)="{ item }">
        <batch-download-actions :id="item.id" :name="item.name" :state="item.state" :value="getRecord(item)" />
      </template>
    </task-list>
  </task-page>
</template>
