<script setup>
import get from 'lodash/get'
import { ref, onBeforeMount } from 'vue'

import TaskPage from '@/views/Task/TaskPage'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayProgress from '@/components/Display/DisplayProgress'
import { useTaskSettings } from '@/composables/task-settings'
import { TASK_NAME } from '@/enums/taskNames'
import DisplayNumber from '@/components/Display/DisplayNumber'
import DisplayUser from '@/components/Display/DisplayUser'
import DisplayVisibility from '@/components/Display/DisplayVisibility'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import { useCore } from '@/composables/core'
import LinkBatchSearch from '@/components/Link/LinkBatchSearch'
import BatchSearchActions from '@/components/BatchSearch/BatchSearchActions'
const { propertiesModelValueOptions } = useTaskSettings('batch-search')
const { core } = useCore()

function getProjects(item) {
  return getRecord(item, 'projects') ?? [core.getDefaultProject()]
}

function getRecord(item, key) {
  return get(item, `args.batchRecord.${key}`)
}
const me = ref({})
onBeforeMount(async () => {
  me.value = await core.auth.getUsername()
})
function userIsAuthorized(item) {
  return me.value === getRecord(item, 'user.id')
}
</script>
<template>
  <task-page
    v-slot="{ tasks, sort, order, updateSort, updateOrder, empty }"
    :task-filter="[TASK_NAME.BATCH_SEARCH]"
    page-name="batch-search"
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
      <template #cell(state)="{ item }">
        <display-status :value="item.state" />
      </template>
      <template #cell(privacy)="{ item }">
        <display-visibility :value="getRecord(item, 'published')" />
      </template>
      <template #cell(name)="{ item }">
        <link-batch-search :item="item" />
      </template>
      <template #cell(queries)="{ item }">
        <display-number :value="getRecord(item, 'nbQueries')" />
      </template>
      <template #cell(documents)="{ item }">
        <display-number :value="getRecord(item, 'nbResults')" />
      </template>
      <template #cell(projects)="{ item }">
        <display-project-list :values="getProjects(item)" />
      </template>

      <template #cell(author)="{ item }"><display-user :value="getRecord(item, 'user.id')" /></template>
      <template #cell(createdAt)="{ item }">
        <display-datetime-from-now :value="item.createdAt" />
      </template>
      <template #cell(progress)="{ item }">
        <display-progress :value="item.progress" />
      </template>
      <template #row-actions="{ item }"
        ><batch-search-actions v-if="userIsAuthorized(item)" :uuid="item.id"
      /></template>
    </page-table-generic>
  </task-page>
</template>
