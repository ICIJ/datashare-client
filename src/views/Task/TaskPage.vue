<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DismissableAlert from '@/components/Dismissable/DismissableAlert'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskActions from '@/components/Task/TaskActions'
import RowPaginationTasks from '@/components/RowPagination/RowPaginationTasks'
import { useTaskHeader } from '@/composables/useTaskHeader'
import { useTaskPolling } from '@/composables/useTaskPolling'

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
  },
  searchable: {
    type: Boolean,
    default: false
  },
  hideStopPending: {
    type: Boolean,
    default: false
  },
  hideClearDone: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()

const { addToRoute, addLabel, searchQuery, page, perPage, sortBy, searchPlaceholder, tasks, totalRows } = useTaskHeader(
  props.pageName
)

const { noTasks, fetchTasks, hasPendingTasks, hasDoneTasks, stopPendingTasks, removeDoneTasks, isLoading } =
  useTaskPolling({ names: props.taskFilter, searchQuery, sortBy, page, perPage })

const setSort = (value) => (sort.value = value)

const sort = computed({
  get: () => sortBy?.value?.[0],
  set: (value) => (sortBy.value = [value, order.value])
})

const setOrder = (value) => (order.value = value)

const order = computed({
  get: () => sortBy?.value?.[1],
  set: (value) => (sortBy.value = [sort.value, value])
})

function refresh() {
  return fetchTasks()
}
</script>

<template>
  <div class="task-page">
    <page-header
      :key="totalRows"
      v-model:search-query="searchQuery"
      v-model:page="page"
      :add-to="showAdd ? addToRoute : null"
      :add-label="showAdd ? addLabel : null"
      :per-page="perPage"
      :search-placeholder="searchPlaceholder"
      :total-rows="totalRows"
      :searchable="searchable"
      paginable
    >
      <template #toolbar-end>
        <task-actions
          :has-done-tasks="hasDoneTasks"
          :has-pending-tasks="hasPendingTasks"
          :hide-clear-done="hideClearDone"
          :hide-stop-pending="hideStopPending"
          @stop-pending="stopPendingTasks()"
          @delete-done="removeDoneTasks()"
        />
      </template>
      <template #pagination="{ setPage }">
        <slot name="pagination" v-bind="{ page, setPage, perPage, totalRows }">
          <row-pagination-tasks v-model="page" :per-page="perPage" :total-rows="totalRows" />
        </slot>
      </template>
    </page-header>
    <page-container fluid>
      <div>
        <dismissable-alert variant="info" persist :name="`task.${pageName}.list.info`">
          {{ t(`task.${pageName}.list.info`) }}
        </dismissable-alert>
        <slot name="taskFailedModal"></slot>
        <template v-if="!isLoading && noTasks">
          <slot
            name="empty"
            :empty="noTasks"
            :loading="isLoading"
            :order="order"
            :refresh="refresh"
            :search-query="searchQuery"
            :sort="sort"
            :tasks="tasks"
            :update-order="setOrder"
            :update-sort="setSort"
          />
        </template>
        <slot
          :empty="noTasks"
          :loading="isLoading"
          :order="order"
          :refresh="refresh"
          :search-query="searchQuery"
          :sort="sort"
          :tasks="tasks"
          :update-order="setOrder"
          :update-sort="setSort"
        />
      </div>
    </page-container>
  </div>
</template>
