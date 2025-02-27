<script setup>
import get from 'lodash/get'

import TaskPage from '@/views/Task/TaskPage'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayProgress from '@/components/Display/DisplayProgress'
import { useTaskSettings } from '@/composables/task-settings'
import { TASK_NAME } from '@/enums/taskNames'
import DisplayNumber from '@/components/Display/DisplayNumber'
import DisplayUser from '@/components/Display/DisplayUser'
import DisplayVisibility from '@/components/Display/DisplayVisibility'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import { useCore } from '@/composables/core'
import TaskBatchSearchLink from '@/components/Task/TaskBatchSearch/TaskBatchSearchLink'
const { propertiesModelValueOptions } = useTaskSettings('batch-search')
const { core } = useCore()

function getProjects(item) {
  return getRecord(item, 'projects') ?? [core.getDefaultProject()]
}

function getRecord(item, key) {
  return get(item, `args.batchRecord.${key}`)
}
</script>
<template>
  <task-page
    v-slot="{ tasks, sort, order, updateSort, updateOrder, empty }"
    :task-filter="[TASK_NAME.BATCH_SEARCH]"
    page-name="batch-search"
    show-add
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
        <display-visibility :value="getRecord(item, 'published')" />
      </template>
      <template #cell(name)="{ item }">
        <task-batch-search-link :item="item" />
      </template>
      <template #cell(queries)="{ item }">
        <display-number :value="getRecord(item, 'nbQueries')" />
      </template>
      <template #cell(documents)="{ item }">
        <display-number :value="getRecord(item, 'nbResults')" />
      </template>
      <template #cell(projects)="{ item }">
        <display-project-list :values="getProjects(item)" />
      </template>

      <template #cell(author)="{ item }"><display-user :value="getRecord(item, 'user.id')" /></template>
      <template #cell(createdAt)="{ item }">
        <display-datetime-from-now :value="item.createdAt" />
      </template>
      <template #cell(progress)="{ item }">
        <display-progress :value="item.progress" />
      </template>
    </page-table-generic>
  </task-page>
</template>
