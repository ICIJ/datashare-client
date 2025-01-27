<template>
  <page-table v-model:sort="sort" v-model:order="order">
    <template #thead>
      <page-table-th
        v-for="field in columns"
        :key="field.name"
        :label="field.text"
        :icon="field.icon"
        sortable
        emphasis
        :name="field.value"
      />
    </template>
    <page-table-tr v-if="!tasks.length">
      <td :colspan="columns.length" class="text-center">
        <slot name="empty">{{ $t('task.noResults') }}</slot>
      </td>
    </page-table-tr>
    <page-table-tr v-for="(item, index) in tasks" :key="index">
      <td v-for="(column, i) in columns" :key="i">
        <slot :name="`cell(${column.value})`" v-bind="{ item, column }">{{ item[column.value] }}</slot>
      </td>
      <page-table-td-actions>
        <slot name="cell(action)" v-bind="{ item }"></slot>
      </page-table-td-actions>
    </page-table-tr>
  </page-table>
</template>

<script setup>
import PageTable from '@/components/PageTable/PageTable'
import PageTableTr from '@/components/PageTable/PageTableTr'
import PageTableTh from '@/components/PageTable/PageTableTh'
import PageTableTdActions from '@/components/PageTable/PageTableTdActions'

defineOptions({ name: 'TaskList' })
defineProps({
  /**
   * Object of tasks passed from the parent
   */
  tasks: {
    type: Array
  },
  columns: {
    type: Array,
    default: () => []
  },
  /**
   * Display a button to stop the task
   */
  stoppable: {
    type: Boolean
  }
})
/* const store = useStore() */
const sort = defineModel('sort', { type: String, default: null })
const order = defineModel('order', { type: String, default: 'desc' })

/* const sortedTasks = computed(() => {
  // Move running tasks on top
  const states = ['RUNNING']
  return sortBy(this.tasks, ({ state }) => -states.indexOf(state))
})
const showTasksFields = computed(() => {
  return this.tasks.length ? this.taskFields : []
})

function isBatchDownloadEncrypted(item) {
  return item.name.includes('BatchDownload') && item.args.batchDownload.encrypted
}
function hasZipSize(item) {
  return item.name.includes('BatchDownload') && item.state !== 'ERROR' && item.result?.size !== undefined
}
async function stopPendingTasks() {
  await store.dispatch('indexing/stopPendingTasks')
  await store.dispatch('indexing/getTasks')
}
async function stopTask(name) {
  await store.dispatch('indexing/stopTask', name)
  await store.dispatch('indexing/getTasks')
}
async function deleteDoneTasks() {
  await store.dispatch('indexing/deleteDoneTasks')
  await store.dispatch('indexing/getTasks')
} */
</script>
