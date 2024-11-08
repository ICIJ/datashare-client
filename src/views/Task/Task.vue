<script setup>
import { toRef } from 'vue'

import { useTaskHeader } from './task-header'
import { useTaskPolling } from './task-polling'

import PageHeader from '@/components/PageHeader/PageHeader'
import TaskActions from '@/components/Task/TaskActions'
import { useTaskProperties } from '@/views/Task/task-properties'
const props = defineProps({
  taskFilter: {
    type: Array,
    required: true
  },
  pageName: {
    type: String,
    required: true
  }
})
const taskNames = toRef(props, 'taskFilter')
const { tasks, hasPendingTasks, hasDoneTasks, stopPendingTasks, deleteDoneTasks } = useTaskPolling(taskNames)
const { fields } = useTaskProperties(props.taskFilter)
const { toAddRoute, searchQuery, page, perPage, searchPlaceholder, displayedTasks, totalRows } = useTaskHeader(
  props.pageName,
  true,
  tasks
)
</script>

<template>
  <page-header
    :key="totalRows"
    v-model:searchQuery="searchQuery"
    v-model:page="page"
    :per-page="perPage"
    :total-rows="totalRows"
    :to-add="toAddRoute"
    searchable
    paginable
    :search-placeholder="searchPlaceholder"
  >
    <template #end>
      <task-actions
        :has-done-tasks="hasDoneTasks"
        :has-pending-tasks="hasPendingTasks"
        @stop-pending="stopPendingTasks"
        @delete-done="deleteDoneTasks"
      />
    </template>
  </page-header>
  <page-container fluid>
    <task-list :tasks="displayedTasks" :task-fields="fields" :stoppable="true" />
  </page-container>
</template>
