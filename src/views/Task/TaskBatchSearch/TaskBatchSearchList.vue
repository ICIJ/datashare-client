<script setup>
import TaskPage from '@/views/Task/TaskPage'
import TaskList from '@/components/Task/TaskList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayProgress from '@/components/Display/DisplayProgress'
import { useTaskSettings } from '@/composables/task-settings'
import { TASK_NAME } from '@/enums/taskNames'
import DisplayNumber from '@/components/Display/DisplayNumber'
import ProjectLink from '@/components/Project/ProjectLink'
import DisplayUser from '@/components/Display/DisplayUser'
const { propertiesModelValueOptions } = useTaskSettings('batch-search')

function getProjects(item) {
  return item.args.batchRecord.projects ?? []
}
function getLink(item) {
  return {
    name: 'task.batch-search.view',
    params: { uuid: item.args.batchRecord?.uuid, indices: getProjects(item).join(',') }
  }
}
function accessIcon(item) {
  return item.args.batchRecord?.published ? 'eye' : 'eye-slash'
}
function accessText(item) {
  return item.args.batchRecord?.published ? 'Shared' : 'Private to you'
}
</script>
<template>
  <task-page
    v-slot="{ tasks, sort, order, updateSort, updateOrder, empty }"
    :task-filter="[TASK_NAME.BATCH_SEARCH]"
    page-name="batch-search"
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
      <template #cell(state)="{ item }">
        <display-status :value="item.state" />
      </template>
      <template #cell(access)="{ item }">
        <phosphor-icon :title="accessText(item)" :name="accessIcon(item)" />
      </template>
      <template #cell(name)="{ item }">
        <router-link :to="getLink(item)"> {{ item.args.batchRecord?.name }}</router-link>
      </template>
      <template #cell(queries)="{ item }"> <display-number :value="item.args.batchRecord.nbQueries" /> </template>
      <template #cell(documents)="{ item }"> <display-number :value="item.args.batchRecord.nbResults" /> </template>
      <template #cell(projects)="{ item }">
        <div class="d-flex gap-2">
          <project-link v-for="project in getProjects(item)" :key="project.name" :project="project" />
        </div>
      </template>

      <template #cell(author)="{ item }"><display-user :value="item.args.batchRecord?.user.id" /></template>
      <template #cell(createdAt)="{ item }">
        <display-datetime-from-now :value="item.createdAt" />
      </template>
      <template #cell(progress)="{ item }">
        <display-progress :value="item.progress" />
      </template>
    </task-list>
  </task-page>
</template>
