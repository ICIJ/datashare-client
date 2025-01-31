<script setup>
import Task from '@/views/Task/Task'
import TaskList from '@/components/Task/TaskList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayProgress from '@/components/Display/DisplayProgress'
import { useTaskSettings } from '@/composables/task-settings'

const { propertiesModelValueOptions } = useTaskSettings('batch-search')
</script>
<template>
  <task
    v-slot="{ tasks, sort, order, updateSort, updateOrder, empty }"
    :task-filter="['org.icij.datashare.tasks.BatchSearchRunner']"
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
      <template #cell(createdAt)="{ item }">
        <display-datetime-from-now :value="item.createdAt" />
      </template>
      <template #cell(progress)="{ item }">
        <display-progress :value="item.progress" />
      </template>
    </task-list>
  </task>
</template>
