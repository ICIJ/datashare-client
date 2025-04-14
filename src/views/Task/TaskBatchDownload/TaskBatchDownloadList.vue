<script setup>
import get from 'lodash/get'

import { useTaskSettings } from '@/composables/useTaskSettings'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayContentLength from '@/components/Display/DisplayContentLength'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import RouterLinkBatchDownload from '@/components/RouterLink/RouterLinkBatchDownload'
import BatchDownloadActions from '@/components/BatchDownload/BatchDownloadActions'
import SearchBreadcrumbUri from '@/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri'
import RowPaginationBatchDownloads from '@/components/RowPagination/RowPaginationBatchDownloads'
import { TASK_NAME } from '@/enums/taskNames'
import TaskPage from '@/views/Task/TaskPage'

const { propertiesModelValueOptions } = useTaskSettings('batch-download')

function hasZipSize(item) {
  return item.state !== 'ERROR' && item.result?.size !== undefined
}

function getBatchDownloadRecord(item, key, defaultValue) {
  return get(item, key ? `args.batchDownload.${key}` : 'args.batchDownload', defaultValue)
}
</script>

<template>
  <task-page :task-filter="[TASK_NAME.BATCH_DOWNLOAD]" page-name="batch-download" hide-clear-done hide-stop-pending>
    <template #pagination="{ page, setPage, perPage, totalRows }">
      <row-pagination-batch-downloads
        :per-page="perPage"
        :total-rows="totalRows"
        :model-value="page"
        @update:modelValue="setPage"
      />
    </template>
    <template #default="{ tasks, sort, order, updateSort, updateOrder, refresh, empty, loading }">
      <page-table-generic
        v-if="loading || !empty"
        :items="tasks"
        :fields="propertiesModelValueOptions"
        :sort="sort"
        :order="order"
        :loading="loading"
        @update:sort="updateSort"
        @update:order="updateOrder"
      >
        <template #cell(state)="{ item }">
          <display-status :value="item.state" />
        </template>
        <template #cell(name)="{ item }">
          <router-link-batch-download :item="item" />
        </template>
        <template #cell(projects)="{ item }">
          <display-project-list :values="getBatchDownloadRecord(item, 'projects')" />
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
            :value="getBatchDownloadRecord(item)"
            :toggle-details="detailsShowing"
            @update:toggle-details="toggleDetails"
            @refresh="refresh"
          />
        </template>
        <template #row-details="{ item }">
          <search-breadcrumb-uri :uri="getBatchDownloadRecord(item).uri" no-label class="ps-5" />
        </template>
      </page-table-generic>
    </template>
  </task-page>
</template>
