<script setup>
import { computed, ref } from 'vue'

import TaskList from '@/components/Task/TaskList'
import { useTaskPolling } from '@/composables/task-polling'
import DisplayProgress from '@/components/Display/DisplayProgress'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayUser from '@/components/Display/DisplayUser'
import ProjectLink from '@/components/Project/ProjectLink'
import { getHumanTaskName, TASK_NAME, TASK_NAME_ICON } from '@/enums/taskNames'
import ButtonIcon from '@/components/Button/ButtonIcon'

const nbTasks = ref(3)
const { tasks: pollingTasks, isLoading } = useTaskPolling()
const columns = ref([
  {
    name: 'name',
    value: 'name',
    text: 'Task',
    icon: 'rocket-launch'
  },
  {
    name: 'state',
    value: 'state',
    text: 'State',
    icon: ''
  },
  {
    name: 'title',
    value: 'title',
    text: 'Title',
    icon: ''
  },
  {
    name: 'projects',
    value: 'projects',
    text: 'Projects',
    icon: 'circles-three-plus'
  },
  {
    name: 'author',
    value: 'author',
    text: 'Author',
    icon: 'user'
  },
  {
    name: 'createdAt',
    value: 'createdAt',
    text: 'Creation date',
    icon: 'user'
  },
  {
    name: 'progress',
    value: 'progress',
    text: 'Progress',
    icon: 'user'
  }
])

const displayedTasks = computed(() => {
  return pollingTasks.value?.slice(0, nbTasks.value)
})
const more = 3
function showMore() {
  nbTasks.value += more
}
const hideShowMore = computed(() => {
  return !pollingTasks.value?.length || pollingTasks.value.length <= nbTasks.value
})

function getAuthor(item) {
  if (task.args?.batchDownload) {
    return item.args?.batchDownload.user.id
  }
  return item.args?.user.id
}
function getProjects(item) {
  switch (item.name) {
    case TASK_NAME.BATCH_DOWNLOAD:
      return item.args?.batchDownload.projects
    case TASK_NAME.BATCH_SEARCH:
      return item.args?.batchRecord?.projects
    case TASK_NAME.SCAN:
    case TASK_NAME.INDEX:
      return [item.args?.defaultProject]
    default:
      console.error('Unknown task', item)
      return []
  }
}

function getTitle(item) {
  switch (item.name) {
    case TASK_NAME.BATCH_DOWNLOAD:
      return item.args?.batchDownload?.name
    case TASK_NAME.BATCH_SEARCH:
      return item.args?.batchRecord?.name
    case TASK_NAME.SCAN:
      return 'Adding documents (SCAN)'
    case TASK_NAME.INDEX:
      return 'Adding documents (INDEX)'
    default:
      console.error('Unknown task', item)
      return []
  }
}
function getTaskIcon(item) {
  return TASK_NAME_ICON[item.name]
}
</script>

<template>
  <b-card-body no-border class="task-all__latest no-border mx-3">
    <b-card-title class="pb-4"> <phosphor-icon name="rocket-launch" /> Latest tasks </b-card-title>
    <b-overlay rounded spinner-small opacity="0.6" :show="isLoading" class="d-flex flex-column justify-content-center">
      <task-list :tasks="displayedTasks" :columns="columns">
        <template #cell(name)="{ item }"
          ><button-icon
            square
            size="sm"
            :icon-left="getTaskIcon(item)"
            variant="outline-tertiary"
            :label="getHumanTaskName(item.name)"
            hide-label
        /></template>
        <template #cell(state)="{ item }"><display-status size="sm" :value="item.state" /></template>
        <template #cell(title)="{ item }">{{ getTitle(item) }}</template>
        <template #cell(createdAt)="{ item }"><display-datetime-from-now :value="item.createdAt" /></template>
        <template #cell(author)="{ item }"><display-user :value="getAuthor(item)" /></template>
        <template #cell(projects)="{ item }">
          <div class="d-flex gap-2">
            <project-link v-for="project in getProjects(item)" :key="project.name" :project="project" />
          </div>
        </template>
        <template #cell(progress)="{ item }"><display-progress :value="item.progress" /></template
      ></task-list>
      <b-button v-if="!hideShowMore" variant="outline-secondary mx-auto" @click="showMore">Show more</b-button>
    </b-overlay>
  </b-card-body>
</template>

<style scoped lang="scss"></style>
