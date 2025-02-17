<script setup>
import { useStore } from 'vuex'

import TaskPage from '@/views/Task/TaskPage'
import TaskList from '@/components/Task/TaskList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayProgress from '@/components/Display/DisplayProgress'
import { getHumanTaskName, TASK_NAME } from '@/enums/taskNames'
import ButtonIcon from '@/components/Button/ButtonIcon'
import { useTaskSettings } from '@/composables/task-settings'

const store = useStore()
const settingName = 'documents'

const { propertiesModelValueOptions } = useTaskSettings(settingName)
async function stopTask(name) {
  await store.dispatch('indexing/stopTask', name)
  await store.dispatch('indexing/getTasks')
}
</script>
<template>
  <task-page
    v-slot="{ tasks, sort, order, updateSort, updateOrder, empty }"
    :task-filter="[TASK_NAME.INDEX, TASK_NAME.SCAN]"
    page-name="documents"
    show-add
  >
    <task-list
      v-if="!empty"
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
      <template #cell(name)="{ item }">{{ getHumanTaskName(item.name) }}</template>
      <template #cell(action)="{ item }">
        <button-icon
          variant="outline-secondary"
          square
          hide-label
          size="sm"
          icon-left="trash"
          class="border-0"
          @click="stopTask(item.id)"
        />
      </template>
    </task-list>
  </task-page>
</template>
