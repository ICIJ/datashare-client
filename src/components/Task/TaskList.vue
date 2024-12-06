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
    <page-table-tr v-if="tasks.length === 0"
      ><td :colspan="columns.length" class="text-center">
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
  <!--      <template #empty>
           <slot name="empty">
             <p class="text-center m-0" v-html="$t('tasksList.empty')"></p>
           </slot>
         </template>
         <template #cell(state)="{ item }">
           <slot name="status" v-bind="{ item }">
             <ellipse-status :status="item.state" :progress="item.progress * 100" horizontal />
           </slot>
         </template>
        <template #cell(name)="{ item }">
           <div class="tasks-list__tasks__item__name m-0 fw-bold">
             <slot v-bind="{ item }">
               {{ item.name }}
             </slot>
           </div>
           <div class="d-flex align-items-center">
             <b-badge variant="tertiary" class="tasks-list__tasks__item__id my-1">
               {{ item.id }}
             </b-badge>
             <template v-if="item.state === 'RUNNING' && stoppable">
               <span class="px-1"> – </span>
               <b-button
                 variant="link"
                 size="sm"
                 class="tasks-list__tasks__item__stop text-danger p-0"
                 @click="stopTask(item.id)"
               >
                 {{ $t('tasksList.stop') }}
               </b-button>
             </template>
           </div>
           <div v-if="isBatchDownloadEncrypted(item)" class="font-italic tasks-list__tasks__item__encrypted">
             {{ $t('tasksList.encrypted') }}
           </div>
           <div v-if="hasZipSize(item)" class="tasks-list__tasks__item__size m-0 fw-bold">
             {{ humanSize(item.result.size, false, $tm('human.size')) }}
           </div>
         </template>
       </b-table>
     </div>-->
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
