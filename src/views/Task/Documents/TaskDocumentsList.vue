<script setup>
import { useStore } from 'vuex'

import Task from '@/views/Task/Task'
import TaskList from '@/components/Task/TaskList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayProgress from '@/components/Display/DisplayProgress'
import { useTaskProperties } from '@/views/Task/task-properties'
import { getHumanTaskName } from '@/enums/taskNames'
import ButtonIcon from '@/components/Button/ButtonIcon'
const settingName = 'task'
const { propertiesModelValueOptions } = useTaskProperties(settingName)
const store = useStore()
async function stopTask(name) {
  await store.dispatch('indexing/stopTask', name)
  await store.dispatch('indexing/getTasks')
}
</script>
<template>
  <task
    v-slot="{ tasks, sortBy }"
    :task-filter="['org.icij.datashare.tasks.EnqueueFromIndexTask', 'org.icij.datashare.tasks.ScanTask']"
    page-name="documents"
    show-add
  >
    <task-list
      v-model:sort="sortBy.modelValue[0]"
      v-model:order="sortBy.modelValue[1]"
      :tasks="tasks"
      :columns="propertiesModelValueOptions"
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
      /></template>
    </task-list>
  </task>
</template>
