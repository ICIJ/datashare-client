<script setup>
import Task from '@/views/Task/Task'
import TaskList from '@/components/Task/TaskList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayProgress from '@/components/Display/DisplayProgress'
</script>
<template>
  <task
    v-slot="{ tasks, columns }"
    :task-filter="['org.icij.datashare.tasks.BatchDownloadRunner']"
    page-name="batch-download"
  >
    <task-list :tasks="tasks" :columns="columns" :stoppable="true">
      <template #cell(state)="{ item }"><display-status :value="item.state" /></template>
      <template #cell(createdAt)="{ item }"><display-datetime-from-now :value="item.createdAt" /></template>
      <template #cell(progress)="{ item }"><display-progress :value="item.progress" /></template>
    </task-list>
  </task>
</template>
