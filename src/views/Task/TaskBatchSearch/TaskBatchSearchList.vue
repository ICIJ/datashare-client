<script setup>
import get from 'lodash/get'
import { ref, onBeforeMount } from 'vue'

import BatchSearchActions from '@/components/BatchSearch/BatchSearchActions/BatchSearchActions'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayNumber from '@/components/Display/DisplayNumber'
import DisplayProgress from '@/components/Display/DisplayProgress'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayUser from '@/components/Display/DisplayUser'
import DisplayVisibility from '@/components/Display/DisplayVisibility'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import RouterLinkBatchSearch from '@/components/RouterLink/RouterLinkBatchSearch'
import { useTaskSettings } from '@/composables/task-settings'
import { useCore } from '@/composables/core'
import { TASK_NAME } from '@/enums/taskNames'
import TaskPage from '@/views/Task/TaskPage'

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

onBeforeMount(fetchMe)
</script>

<template>
  <task-page
    v-slot="{ tasks, sort, order, updateSort, updateOrder, refresh, empty }"
    :task-filter="[TASK_NAME.BATCH_SEARCH]"
    page-name="batch-search"
    show-add
    hide-clear-done
    hide-stop-pending
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
        <display-user :value="getBatchSearchRecord(item, 'user.id')" />
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
  </task-page>
</template>
