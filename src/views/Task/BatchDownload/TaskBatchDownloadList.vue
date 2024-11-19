<script setup>
import Task from '@/views/Task/Task'
import TaskList from '@/components/Task/TaskList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayProgress from '@/components/Display/DisplayProgress'
import { useTaskProperties } from '@/views/Task/task-properties'
const settingName = 'task'
const { propertiesModelValueOptions } = useTaskProperties(settingName)
</script>
<template>
  <task
    v-slot="{ tasks, sort, order, updateSort, updateOrder }"
    :task-filter="['org.icij.datashare.tasks.BatchDownloadRunner']"
    page-name="batch-download"
  >
    <task-list
      :tasks="tasks"
      :columns="propertiesModelValueOptions"
      :sort="sort"
      :order="order"
      @update:sort="updateSort"
      @update:order="updateOrder"
    >
      <template #cell(state)="{ item }"><display-status :value="item.state" /></template>
      <template #cell(createdAt)="{ item }"><display-datetime-from-now :value="item.createdAt" /></template>
      <template #cell(progress)="{ item }"><display-progress :value="item.progress" /></template>
    </task-list>
  </task>
</template>
