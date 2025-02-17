<script setup>
import TaskPage from '@/views/Task/TaskPage'
import TaskList from '@/components/Task/TaskList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayProgress from '@/components/Display/DisplayProgress'
import { useTaskSettings } from '@/composables/task-settings'
import { TASK_NAME } from '@/enums/taskNames'
const { propertiesModelValueOptions } = useTaskSettings('batch-search')

function getBatchSearchName(task) {
  return task.batchRecord.name
}
</script>
<template>
  <task-page
    v-slot="{ tasks, sort, order, updateSort, updateOrder, empty }"
    :task-filter="[TASK_NAME.BATCH_SEARCH]"
    page-name="batch-search"
    show-add
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
      <template #cell(id)="{ item: { id: uuid } }">
        <router-link :to="{ name: 'task.batch-search.view.results', params: { indices: 'local-datashare', uuid } }">
          {{ uuid }}
        </router-link>
      </template>
      <template #cell(state)="{ item }">
        <display-status :value="item.state" />
      </template>
      <template #cell(name)="{ item }">
        {{ getBatchSearchName(item) }}
      </template>
      <template #cell(createdAt)="{ item }">
        <display-datetime-from-now :value="item.createdAt" />
      </template>
      <template #cell(progress)="{ item }">
        <display-progress :value="item.progress" />
      </template>
    </task-list>
  </task-page>
</template>
