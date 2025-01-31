<script setup>
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { getHumanTaskName } from '@/enums/taskNames'
import Task from '@/views/Task/Task'
import TaskList from '@/components/Task/TaskList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayProgress from '@/components/Display/DisplayProgress'
import DisplayDatetimeLong from '@/components/Display/DisplayDatetimeLong'
import { useTaskSettings } from '@/composables/task-settings'

const { t } = useI18n()
const store = useStore()
const settingName = 'entities'
const { propertiesModelValueOptions } = useTaskSettings(settingName, store, t)
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
      <template #cell(createdAt)="{ item }"><display-datetime-long :value="item.createdAt" /></template>
      <template #cell(progress)="{ item }"><display-progress :value="item.progress" /></template>
      <template #cell(name)="{ item }">{{ getHumanTaskName(item.name) }}</template>
    </task-list>
  </task>
</template>
