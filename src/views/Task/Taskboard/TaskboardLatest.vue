<script setup>
import { computed, ref } from 'vue'

import TaskList from '@/components/Task/TaskList'
import { useTaskPolling } from '@/composables/task-polling'
import DisplayProgress from '@/components/Display/DisplayProgress'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import ProjectLink from '@/components/Project/ProjectLink'
import DisplayUser from '@/components/Display/DisplayUser'

const nbTasks = 10
const { tasks: pollingTasks, isLoading } = useTaskPolling()
const columns = ref([
  {
    name: 'name',
    value: 'name',
    text: 'Task name',
    icon: 'rocket-launch'
  },
  {
    name: 'state',
    value: 'state',
    text: 'State',
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
  return pollingTasks.value?.slice(0, nbTasks)
})

function getAuthor(task) {
  if (task.args.batchDownload) {
    return task.args.batchDownload.user.id
  }
  return task.args.user.id
}
function getProjects(task) {
  if (task.args.batchDownload) {
    return task.args.batchDownload.projects
  }
  return [task.args.defaultProject]
}
</script>

<template>
  <b-card-body no-border class="task-all__latest no-border">
    <b-card-title class="pb-4"> <phosphor-icon name="rocket-launch" /> Latest tasks </b-card-title>
    <b-overlay rounded spinner-small opacity="0.6" :show="isLoading">
      <task-list :tasks="displayedTasks" :columns="columns">
        <template #cell(state)="{ item }"><display-status :value="item.state" /></template>
        <template #cell(createdAt)="{ item }"><display-datetime-from-now :value="item.createdAt" /></template>
        <template #cell(author)="{ item }"><display-user :value="getAuthor(item)" /></template>
        <template #cell(projects)="{ item }">
          <div class="d-flex gap-2">
            <project-link v-for="project in getProjects(item)" :key="project.name" :project="project" />
          </div>
        </template>
        <template #cell(progress)="{ item }"><display-progress :value="item.progress" /></template
      ></task-list>
    </b-overlay>
  </b-card-body>
</template>

<style scoped lang="scss"></style>
