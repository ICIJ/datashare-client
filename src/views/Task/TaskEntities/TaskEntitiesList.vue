<script setup>
import { useI18n } from 'vue-i18n'

import tasksEntitiesEmpty from '@/assets/images/illustrations/tasks-entities-empty.svg'
import { useTaskSettings } from '@/composables/useTaskSettings'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayProgress from '@/components/Display/DisplayProgress'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import EmptyState from '@/components/EmptyState/EmptyState'
import EntityButton from '@/components/Entity/EntityButton'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import { ENTITY_CATEGORY } from '@/enums/entityCategories'
import { TASK_NAME } from '@/enums/taskNames'
import TaskPage from '@/views/Task/TaskPage'
import ButtonRowActionStop from '@/components/Button/ButtonRowAction/ButtonRowActionStop.vue'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete.vue'
import { apiInstance as api } from '@/api/apiInstance.js'
import { TASK_STATUS } from '@/enums/taskStatus.js'
import { useConfirmModal } from '@/composables/useConfirmModal.js'
import { useCore } from '@/composables/useCore.js'

const settingName = 'entities'
const { propertiesModelValueOptions } = useTaskSettings(settingName)
const { afterConfirmation } = useConfirmModal()
const { toastedPromise } = useCore()

const { t } = useI18n()
function isPipelineEmail(item) {
  return item.args.nlpPipeline === 'EMAIL'
}

function getProject(item) {
  return item.args.defaultProject
}

function remove(id) {
  return toastedPromise(api.removeTask(id), { successMessage: t('task.remove.success'),
    errorMessage: t('task.remove.error') })
}

function isRunning(item) {
  return item.state === TASK_STATUS.RUNNING
}
</script>

<template>
  <task-page
    :task-filter="[TASK_NAME.EXTRACT_NLP, TASK_NAME.ENQUEUE_FROM_INDEX]"
    page-name="entities"
    show-add
  >
    <template #empty>
      <empty-state
        :image="tasksEntitiesEmpty"
        :label="t('task.entities.list.emptyStateLabel')"
        :action-label="t('task.entities.list.emptyStateAction')"
        :action-to="{ name: 'task.entities.new' }"
      />
    </template>
    <template #default="{ tasks, sort, order, updateSort, updateOrder, loading, empty, refresh }">
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
        <template #cell(entitiesToFind)="{ item }">
          <div
            v-if="isPipelineEmail(item)"
            class="d-flex gap-2"
          >
            <entity-button :entity="{ mention: 'Email', category: ENTITY_CATEGORY.EMAIL }" />
          </div>
          <div
            v-else
            class="d-flex gap-2"
          >
            <entity-button :entity="{ mention: 'People', category: ENTITY_CATEGORY.PERSON }" />
            <entity-button :entity="{ mention: 'Organization', category: ENTITY_CATEGORY.ORGANIZATION }" />
            <entity-button :entity="{ mention: 'Location', category: ENTITY_CATEGORY.LOCATION }" />
          </div>
        </template>
        <template #cell(pipeline)="{ item }">
          {{ item.args.nlpPipeline }}
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
