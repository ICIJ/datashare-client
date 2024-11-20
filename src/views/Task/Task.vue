<script setup>
import { toRef } from 'vue'

import { useTaskHeader } from './task-header'
import { useTaskPolling } from './task-polling'

import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskActions from '@/components/Task/TaskActions'
import DismissableAlert from '@/components/Dismissable/DismissableAlert'

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

const { toAddRoute, searchQuery, page, perPage, searchPlaceholder, displayedTasks, totalRows, sortBy } = useTaskHeader(
  props.pageName,
  props.showAdd,
  pollingTasks
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
    <dismissable-alert variant="info">{{ $t(`task.${pageName}.list.info`) }}</dismissable-alert>
    <slot :tasks="displayedTasks" :sort-by="sortBy"> </slot>
  </page-container>
</template>
