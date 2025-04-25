<script setup>
import get from 'lodash/get'
import { ref, reactive, onBeforeMount } from 'vue'

import tasksBatchSearchesEmpty from '@/assets/images/illustrations/tasks-batch-searches-empty.svg'
import BatchSearchActions from '@/components/BatchSearch/BatchSearchActions/BatchSearchActions'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayNumber from '@/components/Display/DisplayNumber'
import DisplayProgress from '@/components/Display/DisplayProgress'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayUser from '@/components/Display/DisplayUser'
import DisplayVisibility from '@/components/Display/DisplayVisibility'
import EmptyState from '@/components/EmptyState/EmptyState'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import RouterLinkBatchSearch from '@/components/RouterLink/RouterLinkBatchSearch'
import RowPaginationBatchSearches from '@/components/RowPagination/RowPaginationBatchSearches'
import { useTaskSettings } from '@/composables/useTaskSettings'
import { useCore } from '@/composables/useCore'
import { TASK_NAME } from '@/enums/taskNames'
import TaskPage from '@/views/Task/TaskPage'
import BatchSearchErrorModal from '@/components/BatchSearch/BatchSearchErrorModal.vue'
import TaskStatus from '@/views/Task/TaskStatus.vue'

const { propertiesModelValueOptions } = useTaskSettings('batch-search')
const { core } = useCore()

function getBatchSearchRecord(item, key) {
  return get(item, ['args', 'batchRecord', key].join('.'))
}

function getBatchSearchProjects(item) {
  return getBatchSearchRecord(item, 'projects', [])
}

function canManageBatchSearch(item) {
  return getBatchSearchRecord(item, 'user.id') === me.value
}

const me = ref('')

async function fetchMe() {
  me.value = await core.auth.getUsername()
}

const show = ref(false)
const batchSearchError = reactive({
  okTitle: 'Ok',
  errorTitle: 'The error is',
  description: `The system encountered a problem. It can be a syntax error that you made in your CSV or another error. Please refer to <a href="/">this help page</a> where most common errors are described.`,
  errorMessage: '',
  query: ''
})
function showError({ errorMessage, errorQuery }) {
  batchSearchError.errorMessage = errorMessage
  batchSearchError.query = errorQuery
  show.value = true
}
onBeforeMount(fetchMe)
</script>

<template>
  <task-page
    :task-filter="[TASK_NAME.BATCH_SEARCH]"
    page-name="batch-search"
    show-add
    searchable
    hide-clear-done
    hide-stop-pending
  >
    <template #taskFailedModal><batch-search-error-modal v-model="show" v-bind="batchSearchError" /></template>
    <template #empty="{ searchQuery }">
      <empty-state
        v-if="!searchQuery"
        image-max-width="195px"
        :image="tasksBatchSearchesEmpty"
        :label="$t('task.batch-search.list.emptyStateLabel')"
        :action-label="$t('task.batch-search.list.emptyStateAction')"
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
            {{ $t('task.batch-search.list.noMatches') }}
          </p>
        </template>
        <template #cell(state)="{ item }">
          <task-status :status="item.state" @error="showError" />
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
          <display-number :value="getBatchSearchRecord(item, 'nbResults')" />
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
          <batch-search-actions v-if="canManageBatchSearch(item)" :uuid="item.id" hide-labels @refresh="refresh" />
        </template>
      </page-table-generic>
    </template>
  </task-page>
</template>
