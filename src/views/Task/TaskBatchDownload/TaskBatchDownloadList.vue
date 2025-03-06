<script setup>
import get from 'lodash/get'

import { useTaskSettings } from '@/composables/task-settings'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayContentLength from '@/components/Display/DisplayContentLength'
import { TASK_NAME } from '@/enums/taskNames'
import TaskPage from '@/views/Task/TaskPage'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import LinkBatchDownload from '@/components/Link/LinkBatchDownload'
import BatchDownloadActions from '@/components/BatchDownload/BatchDownloadActions'
import SearchBreadcrumbUri from '@/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri'

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
    <page-table-generic
      v-if="!empty"
      :items="tasks"
      :fields="propertiesModelValueOptions"
      :sort="sort"
      :order="order"
      @update:sort="updateSort"
      @update:order="updateOrder"
    >
      <template #cell(state)="{ item }">
        <display-status :value="item.state" />
      </template>

      <template #cell(name)="{ item }"> <link-batch-download :item="item" /> </template>

      <template #cell(projects)="{ item }">
        <display-project-list :values="getRecord(item, 'projects')" />
      </template>
      <template #cell(createdAt)="{ item }">
        <display-datetime-from-now :value="item.createdAt" />
      </template>
      <template #cell(size)="{ item }">
        <display-content-length v-if="hasZipSize(item)" :value="item.result.size" class="text-nowrap" />
      </template>

      <template #row-actions="{ item, detailsShowing, toggleDetails }">
        <batch-download-actions
          :id="item.id"
          :name="item.name"
          :state="item.state"
          :value="getRecord(item)"
          :toggle="detailsShowing"
          @update:toggle="toggleDetails"
        />
      </template>

      <template #row-details="{ item }">
        <search-breadcrumb-uri :uri="getRecord(item).uri" no-label />
      </template>
    </page-table-generic>
  </task-page>
</template>
