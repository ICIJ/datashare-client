<script setup>
import { useI18n } from 'vue-i18n'

import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete'
import ButtonRowActionStop from '@/components/Button/ButtonRowAction/ButtonRowActionStop'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayNumber from '@/components/Display/DisplayNumber'
import DisplayProgress from '@/components/Display/DisplayProgress'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import { useTaskSettings } from '@/composables/useTaskSettings'
import { getHumanTaskName, TASK_NAME } from '@/enums/taskNames'
import { TASK_STATUS } from '@/enums/taskStatus'
import { useTaskStore } from '@/store/modules'
import TaskPage from '@/views/Task/TaskPage'

const taskStore = useTaskStore()
const settingName = 'documents'

const { propertiesModelValueOptions } = useTaskSettings(settingName)
const { t } = useI18n()

async function stopTask(uuid) {
  return taskStore.stopTask(uuid)
}

function getProject(item) {
  return item.args.defaultProject
}

function isRunning(item) {
  return item.state === TASK_STATUS.RUNNING
}
</script>

<template>
  <task-page
    v-slot="{ tasks, sort, order, updateSort, updateOrder, empty, loading }"
    :task-filter="[TASK_NAME.INDEX, TASK_NAME.SCAN]"
    page-name="documents"
    show-add
  >
    <page-table-generic
      v-if="loading || !empty"
      :items="tasks"
      :fields="propertiesModelValueOptions"
      :sort="sort"
      :order="order"
      :loading="loading"
      @update:sort="updateSort"
      @update:order="updateOrder"
    >
      <template #cell(state)="{ item }">
        <display-status :value="item.state" />
      </template>
      <template #cell(name)="{ item }">
        {{ t(getHumanTaskName(item.name)) }}
      </template>
      <template #cell(documents)="{ item }">
        <display-number v-if="item?.result?.value && item.result.value[1]" :value="item.result.value[1]" />
      </template>
      <template #cell(project)="{ item }">
        <display-project-list :values="getProject(item)" />
      </template>
      <template #cell(progress)="{ item }">
        <display-progress :value="item.progress" />
      </template>
      <template #cell(createdAt)="{ item }">
        <display-datetime-from-now :value="item.createdAt" />
      </template>
      <template #row-actions="{ item }">
        <button-row-action-stop :disabled="!isRunning(item)" @stop="stopTask(item.id)" />
        <button-row-action-delete @delete="taskStore.removeTask(item.id)" />
      </template>
    </page-table-generic>
  </task-page>
</template>
