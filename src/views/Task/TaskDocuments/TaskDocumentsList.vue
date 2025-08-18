<script setup>
import { useI18n } from 'vue-i18n'

import tasksDocumentsEmpty from '@/assets/images/illustrations/tasks-documents-empty.svg'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete'
import ButtonRowActionStop from '@/components/Button/ButtonRowAction/ButtonRowActionStop'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayNumber from '@/components/Display/DisplayNumber'
import DisplayProgress from '@/components/Display/DisplayProgress'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import EmptyState from '@/components/EmptyState/EmptyState'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import { useTaskSettings } from '@/composables/useTaskSettings'
import { getHumanTaskName, TASK_NAME } from '@/enums/taskNames'
import { TASK_STATUS } from '@/enums/taskStatus'
import { useTaskStore } from '@/store/modules'
import TaskPage from '@/views/Task/TaskPage'
import { useConfirmModal } from '@/composables/useConfirmModal'
import { apiInstance as api } from '@/api/apiInstance'
import { useCore } from '@/composables/useCore'

const { afterConfirmation } = useConfirmModal()
const { toastedPromise } = useCore()
const taskStore = useTaskStore()
const settingName = 'documents'

const { propertiesModelValueOptions } = useTaskSettings(settingName)
const { t } = useI18n()

async function stopTask(uuid) {
  return taskStore.stopTask(uuid)
}

function remove(id) {
  return toastedPromise(api.removeTask(id), { successMessage: t('task.remove.success'),
    errorMessage: t('task.remove.error') })
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
    :task-filter="[TASK_NAME.INDEX, TASK_NAME.SCAN]"
    page-name="documents"
    show-add
  >
    <template #empty>
      <empty-state
        image-max-width="345px"
        :image="tasksDocumentsEmpty"
        :label="t('task.documents.list.emptyStateLabel')"
        :action-label="t('task.documents.list.emptyStateAction')"
        :action-to="{ name: 'task.documents.new' }"
      />
    </template>
    <template #default="{ tasks, sort, order, updateSort, updateOrder, empty, loading, refresh }">
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
          <display-number
            v-if="item?.result?.value && item.result.value[1]"
            :value="item.result.value[1]"
          />
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
          <button-row-action-stop
            :disabled="!isRunning(item)"
            @stop="stopTask(item.id)"
          />
          <button-row-action-delete
            @click="afterConfirmation(async ()=>{
              await remove(item.id)
              await refresh()})"
          />
        </template>
      </page-table-generic>
    </template>
  </task-page>
</template>
