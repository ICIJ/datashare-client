<script setup>
import get from 'lodash/get'

import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import { useTaskSettings } from '@/composables/task-settings'
import DisplayNumber from '@/components/Display/DisplayNumber'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import { useCore } from '@/composables/core'
const { propertiesModelValueOptions } = useTaskSettings('batch-search')
const { core } = useCore()

function getProjects(item) {
  return getRecord(item, 'projects') ?? [core.getDefaultProject()]
}

function getRecord(item, key) {
  return get(item, `args.batchRecord.${key}`)
}
</script>
<template>
  <page-table-generic
    v-if="!empty"
    :items="queries"
    :columns="propertiesModelValueOptions"
    :sort="sort"
    :order="order"
    @update:sort="updateSort"
    @update:order="updateOrder"
  >
    <template #cell(query)="{ item }">
      {{ item.query }}
    </template>
    <template #cell(documents)="{ item }">
      <display-number :value="getRecord(item, 'nbResults')" />
    </template>
    <template #cell(projects)="{ item }">
      <display-project-list :values="getProjects(item)" />
    </template>

    <template #cell(action)="{ item }"> Actions ! {{ item }} </template>
  </page-table-generic>
</template>
