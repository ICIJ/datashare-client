<script setup>
import Task from '@/views/Task/Task'
import TaskList from '@/components/Task/TaskList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayProgress from '@/components/Display/DisplayProgress'
import { useTaskSettings } from '@/composables/task-settings'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'

const settingName = 'entities'
const { propertiesModelValueOptions } = useTaskSettings(settingName)
</script>

<template>
  <task
    v-slot="{ tasks, sort, order, updateSort, updateOrder, empty }"
    :task-filter="['org.icij.datashare.tasks.ExtractNlpTask', 'org.icij.datashare.tasks.EnqueueFromIndexTask']"
    page-name="entities"
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
      <template #cell(entities-to-find)>NA</template>
      <template #cell(pipeline)="{ item }">{{ item.args.nlpPipeline }}</template>
      <template #cell(project)="{ item }">{{ item.args.defaultProject }}</template>
      <template #cell(progress)="{ item }"><display-progress :value="item.progress" /></template>
      <template #cell(createdAt)="{ item }"> <display-datetime-from-now :value="item.createdAt" /> </template>
    </task-list>
  </task>
</template>
