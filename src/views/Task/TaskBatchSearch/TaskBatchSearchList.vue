<script setup>
import get from 'lodash/get'
import { useI18n } from 'vue-i18n'

import tasksBatchSearchesEmpty from '@/assets/images/illustrations/tasks-batch-searches-empty.svg'
import BatchSearchActions from '@/components/BatchSearch/BatchSearchActions/BatchSearchActions'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayNumber from '@/components/Display/DisplayNumber'
import DisplayProgress from '@/components/Display/DisplayProgress'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import DisplayUser from '@/components/Display/DisplayUser'
import DisplayVisibility from '@/components/Display/DisplayVisibility'
import EmptyState from '@/components/EmptyState/EmptyState'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import RouterLinkBatchSearch from '@/components/RouterLink/RouterLinkBatchSearch'
import RowPaginationBatchSearches from '@/components/RowPagination/RowPaginationBatchSearches'
import { useTaskSettings } from '@/composables/useTaskSettings'
import { useAuth } from '@/composables/useAuth'
import { TASK_NAME } from '@/enums/taskNames'
import TaskPage from '@/views/Task/TaskPage'
import TaskStatus from '@/views/Task/TaskStatus.vue'

const { t } = useI18n()
const { propertiesModelValueOptions } = useTaskSettings('batch-search')
const { username } = useAuth()

function getBatchSearchRecord(item, key, defaultValue = null) {
  return get(item, ['args', 'batchRecord', key].join('.'), defaultValue)
}

function getBatchSearchProjects(item) {
  return getBatchSearchRecord(item, 'projects', [])
}

function canManageBatchSearch(item) {
  return getBatchSearchRecord(item, 'user.id') === username.value
}
</script>

<template>
  <task-page
    :task-filter="[TASK_NAME.BATCH_SEARCH, TASK_NAME.BATCH_SEARCH_PROXY]"
    page-name="batch-search"
    show-add
    searchable
    hide-clear-done
    hide-stop-pending
  >
    <template #empty="{ searchQuery }">
      <empty-state
        v-if="!searchQuery"
        image-max-width="195px"
        :image="tasksBatchSearchesEmpty"
        :label="t('task.batch-search.list.emptyStateLabel')"
        :action-label="t('task.batch-search.list.emptyStateAction')"
        :action-to="{ name: 'task.batch-search.new' }"
      />
    </template>
    <template #pagination="{ page, setPage, perPage, totalRows }">
      <row-pagination-batch-searches
        :per-page="perPage"
        :total-rows="totalRows"
        :model-value="page"
        @update:modelValue="setPage"
      />
    </template>
    <template #default="{ tasks, sort, order, updateSort, updateOrder, refresh, searchQuery, empty, loading }">
      <page-table-generic
        v-if="!loading && (!empty || searchQuery)"
        :items="tasks"
        :fields="propertiesModelValueOptions"
        :sort="sort"
        :order="order"
        :loading="loading"
        @update:sort="updateSort"
        @update:order="updateOrder"
      >
        <template #empty>
          <p class="text-secondary text-center m-3">
            {{ t('task.batch-search.list.noMatches') }}
          </p>
        </template>
        <template #cell(state)="{ item }">
          <task-status :status="item.state" />
        </template>
        <template #cell(privacy)="{ item }">
          <display-visibility :value="getBatchSearchRecord(item, 'published')" />
        </template>
        <template #cell(name)="{ item }">
          <router-link-batch-search :item="item" />
        </template>
        <template #cell(queries)="{ item }">
          <display-number :value="getBatchSearchRecord(item, 'nbQueries')" />
        </template>
        <template #cell(documents)="{ item }">
          <display-number :value="item.result?.value ?? 0" />
        </template>
        <template #cell(projects)="{ item }">
          <display-project-list :values="getBatchSearchProjects(item)" />
        </template>
        <template #cell(author)="{ item }">
          <display-user :value="getBatchSearchRecord(item, 'user.id')" class="text-nowrap" />
        </template>
        <template #cell(createdAt)="{ item }">
          <display-datetime-from-now :value="item.createdAt" />
        </template>
        <template #cell(progress)="{ item }">
          <display-progress :value="item.progress" />
        </template>
        <template #row-actions="{ item }">
          <batch-search-actions
            v-if="canManageBatchSearch(item)"
            :batch-search="item.args.batchRecord"
            hide-labels
            @refresh="refresh"
          />
        </template>
      </page-table-generic>
    </template>
  </task-page>
</template>
