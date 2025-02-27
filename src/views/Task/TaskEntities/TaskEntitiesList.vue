<script setup>
import TaskPage from '@/views/Task/TaskPage'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayProgress from '@/components/Display/DisplayProgress'
import { useTaskSettings } from '@/composables/task-settings'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import { TASK_NAME } from '@/enums/taskNames'
import EntityButton from '@/components/Entity/EntityButton'
import { ENTITY_CATEGORY } from '@/enums/entityCategories'
import DisplayProjectList from '@/components/Display/DisplayProjectList'

const settingName = 'entities'
const { propertiesModelValueOptions } = useTaskSettings(settingName)
function isPipelineEmail(item) {
  return item.args.nlpPipeline === 'EMAIL'
}
function getProject(item) {
  return item.args.defaultProject
}
</script>

<template>
  <task-page
    v-slot="{ tasks, sort, order, updateSort, updateOrder, empty }"
    :task-filter="[TASK_NAME.EXTRACT_NLP, TASK_NAME.ENQUEUE_FROM_INDEX]"
    page-name="entities"
    show-add
  >
    <page-table-generic
      v-if="!empty"
      :items="tasks"
      :fields="propertiesModelValueOptions"
      :sort="sort"
      :order="order"
      @update:sort="updateSort"
      @update:order="updateOrder"
    >
      <template #cell(state)="{ item }"><display-status :value="item.state" /></template>
      <template #cell(entities-to-find)="{ item }">
        <div v-if="isPipelineEmail(item)" class="d-flex gap-2">
          <entity-button :entity="{ mention: 'Email', category: ENTITY_CATEGORY.EMAIL }" />
        </div>
        <div v-else class="d-flex gap-2">
          <entity-button :entity="{ mention: 'People', category: ENTITY_CATEGORY.PERSON }" />
          <entity-button :entity="{ mention: 'Organization', category: ENTITY_CATEGORY.ORGANIZATION }" />
          <entity-button :entity="{ mention: 'Location', category: ENTITY_CATEGORY.LOCATION }" /></div
      ></template>
      <template #cell(pipeline)="{ item }">{{ item.args.nlpPipeline }}</template>
      <template #cell(project)="{ item }"> <display-project-list :values="getProject(item)" /> </template>
      <template #cell(progress)="{ item }"><display-progress :value="item.progress" /></template>
      <template #cell(createdAt)="{ item }"> <display-datetime-from-now :value="item.createdAt" /> </template>
    </page-table-generic>
  </task-page>
</template>
