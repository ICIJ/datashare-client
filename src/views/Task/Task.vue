<script setup>
import { computed, toRef } from 'vue'

import { useTaskHeader } from './task-header'
import { useTaskPolling } from './task-polling'

import PageHeader from '@/components/PageHeader/PageHeader'
import TaskActions from '@/components/Task/TaskActions'
import { useTaskProperties } from '@/views/Task/task-properties'
const props = defineProps({
  taskFilter: {
    type: Array,
    default: () => []
  },
  pageName: {
    type: String,
    required: true
  },
  showAdd: {
    type: Boolean,
    default: false
  }
})
const taskNames = toRef(props, 'taskFilter')
const {
  tasks: pollingTasks,
  hasPendingTasks,
  hasDoneTasks,
  stopPendingTasks,
  deleteDoneTasks
} = useTaskPolling(taskNames)
const { toAddRoute, searchQuery, page, perPage, searchPlaceholder, displayedTasks, totalRows } = useTaskHeader(
  props.pageName,
  props.showAdd,
  pollingTasks
)

const settingName = 'task'
const { properties } = useTaskProperties(settingName)
const shownProperties = computed(() => {
  return properties.value.options.filter((p) => properties.value.modelValue.includes(p.value))
})
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
    <slot :tasks="displayedTasks" :columns="shownProperties">
      <task-list :tasks="displayedTasks" :columns="shownProperties" :stoppable="true" />
    </slot>
  </page-container>
</template>
