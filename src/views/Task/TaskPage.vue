<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import appBuilding from '@/assets/images/illustrations/app-building.svg'
import appBuildingDark from '@/assets/images/illustrations/app-building-dark.svg'
import DismissableAlert from '@/components/Dismissable/DismissableAlert'
import EmptyState from '@/components/EmptyState/EmptyState'
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

const { noTasks, getTasks, hasPendingTasks, hasDoneTasks, stopPendingTasks, removeDoneTasks, isLoading } =
  useTaskPolling({ names: props.taskFilter, searchQuery, sortBy })

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
  return getTasks()
}
</script>

<template>
  <div class="task-page">
    <page-header
      :key="totalRows"
      v-model:searchQuery="searchQuery"
      v-model:page="page"
      :add-to="showAdd ? addToRoute : null"
      :add-label="showAdd ? addLabel : null"
      :per-page="perPage"
      :search-placeholder="searchPlaceholder"
      :total-rows="totalRows"
      paginable
      searchable
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
        <template v-if="!isLoading && noTasks">
          <slot name="empty" :empty="noTasks">
            <empty-state :label="t(`task.empty`)" :image="appBuilding" :image-dark="appBuildingDark">
              <template #label>
                <span v-html="t(`task.${pageName}.list.empty`)"></span>
              </template>
            </empty-state>
          </slot>
        </template>
        <slot
          :tasks="tasks"
          :sort="sort"
          :order="order"
          :update-order="setOrder"
          :update-sort="setSort"
          :empty="noTasks"
          :refresh="refresh"
          :loading="isLoading"
        />
      </div>
    </page-container>
  </div>
</template>
