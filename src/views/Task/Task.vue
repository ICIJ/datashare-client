<script setup>
import { computed, provide, toRef } from 'vue'

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
const sort = computed({
  get: () => sortBy.value.modelValue?.[0],
  set: (value) => (sortBy.value.modelValue = [value, order.value])
})

const order = computed({
  get: () => sortBy.value.modelValue?.[1],
  set: (value) => (sortBy.value.modelValue = [sort.value, value])
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
    <dismissable-alert variant="info">{{ $t(`task.${pageName}.list.info`) }}</dismissable-alert>
    <slot
      :tasks="displayedTasks"
      :sort="sort"
      :order="order"
      :update-order="(v) => (order = v)"
      :update-sort="(v) => (sort = v)"
    >
    </slot>
  </page-container>
</template>
