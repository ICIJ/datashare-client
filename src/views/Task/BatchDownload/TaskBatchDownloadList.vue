<script setup>
import { basename } from 'path'
import { PhDownload } from '@phosphor-icons/vue'

import Task from '@/views/Task/Task'
import TaskList from '@/components/Task/TaskList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import { useTaskSettings } from '@/composables/task-settings'
import DisplayContentLength from '@/components/Display/DisplayContentLength'

const settingName = 'batch-download'

const { propertiesModelValueOptions } = useTaskSettings(settingName)

function hasZipSize(item) {
  return item.state !== 'ERROR' && item.result?.size !== undefined
}
function filename(item) {
  return basename(item.args.batchDownload.filename)
}
function batchDownloadExists(item) {
  return item.args.batchDownload.exists
}
function downloadResultsUrl(item) {
  return `/api/task/${item.id}/result`
}
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
      <template #cell(state)="{ item }">
        <display-status :value="item.state" />
      </template>

      <template #cell(name)="{ item }">
        <a v-if="batchDownloadExists(item)" :href="downloadResultsUrl(item)" target="_blank">
          <ph-download fixed-width />
          {{ filename(item) }}
        </a>
      </template>

      <template #cell(createdAt)="{ item }">
        <display-datetime-from-now :value="item.createdAt" />
      </template>

      <template #cell(size)="{ item }">
        <display-content-length v-if="hasZipSize(item)" :value="item.result.size" />
      </template>
    </task-list>
  </task>
</template>
