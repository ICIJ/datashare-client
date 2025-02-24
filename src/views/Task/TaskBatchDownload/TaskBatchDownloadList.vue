<script setup>
import { basename } from 'path'
import { PhDownload } from '@phosphor-icons/vue'

import { useTaskSettings } from '@/composables/task-settings'
import TaskList from '@/components/Task/TaskList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayContentLength from '@/components/Display/DisplayContentLength'
import { TASK_NAME } from '@/enums/taskNames'
import TaskPage from '@/views/Task/TaskPage'
import DisplayProjectList from '@/components/Display/DisplayProjectList'

const { propertiesModelValueOptions } = useTaskSettings('batch-download')

function hasZipSize(item) {
  return item.state !== 'ERROR' && item.result?.size !== undefined
}

function filename(item) {
  return item.args?.batchDownload ? basename(item.args?.batchDownload?.filename) : ''
}

function batchDownloadExists(item) {
  return item.args?.batchDownload?.exists ?? 'test'
}

function downloadResultsUrl(item) {
  return `/api/task/${item.id}/result`
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

      <template #cell(name)="{ item }">
        <a v-if="batchDownloadExists(item)" :href="downloadResultsUrl(item)" target="_blank">
          <ph-download fixed-width />
          {{ filename(item) }}
        </a>
      </template>

      <template #cell(projects)="{ item }">
        <display-project-list :values="item.args.batchDownload.projects" />
      </template>
      <template #cell(createdAt)="{ item }">
        <display-datetime-from-now :value="item.createdAt" />
      </template>
      <template #cell(size)="{ item }">
        <display-content-length v-if="hasZipSize(item)" :value="item.result.size" />
      </template>
    </task-list>
  </task-page>
</template>
