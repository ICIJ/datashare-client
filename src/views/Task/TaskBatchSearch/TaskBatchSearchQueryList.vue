<script setup>
import { computed, ref, onBeforeMount } from 'vue'

import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import PageHeader from '@/components/PageHeader/PageHeader'
import BatchSearchCard from '@/components/BatchSearch/BatchSearchCard'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageToolbar from '@/components/PageToolbar/PageToolbar'
import { useUrlParam, useUrlParamsWithStore, useUrlParamWithStore } from '@/composables/url-params'
import { useAppStore } from '@/store/modules'
import { useCore } from '@/composables/core'
import TaskBatchSearchQueryLink from '@/components/Task/TaskBatchSearch/TaskBatchSearchQueryLink'
import { useTaskSettings } from '@/composables/task-settings'
import NavigationBreadcrumbLink from '@/components/NavigationBreadcrumb/NavigationBreadcrumbLink'
const props = defineProps({
  uuid: { type: String, required: true },
  indices: { type: [String, Object], required: true }
})

const appStore = useAppStore()
const settingView = 'batch-search-queries'
const settings = useTaskSettings(settingView)

const searchQuery = useUrlParam('q', '')
const page = useUrlParam('page', {
  transform: (value) => parseInt(value),
  initialValue: 1
})
const perPage = useUrlParamWithStore('perPage', {
  transform: (value) => Math.max(10, parseInt(value)),
  get: () => appStore.getSettings(settingView, 'perPage'),
  set: (value) => appStore.setSettings({ view: settingView, perPage: parseInt(value) })
})
const orderBy = useUrlParamsWithStore(['sort', 'order'], {
  get: () => appStore.getSettings(settingView, 'orderBy'),
  set: (sort, order) => appStore.setSettings({ view: settingView, orderBy: [sort, order] })
})
const sort = computed({
  get: () => orderBy.value?.[0],
  set: (value) => (orderBy.value = [value, order.value])
})

const order = computed({
  get: () => orderBy.value?.[1],
  set: (value) => (orderBy.value = [sort.value, value])
})
const { core } = useCore()
const queries = ref([])
const batchSearch = ref(null)
const nbQueriesWithoutResults = ref(0)
onBeforeMount(() => {
  getBatchSearchQueries(props.uuid)
  getBatchSearch(props.uuid)
})

async function getBatchSearch(batchId) {
  try {
    batchSearch.value = { ...(await core.api.getBatchSearch(batchId)), nbQueriesWithoutResults }
  } catch (error) {
    batchSearch.value = null
  }
}
async function getBatchSearchQueries(batchId) {
  try {
    const queriesObjects = await core.api.getBatchSearchQueries(batchId)
    queries.value = Object.keys(queriesObjects).map((k) => ({ query: k, nbHits: queriesObjects[k] }))
    nbQueriesWithoutResults.value = getNbQueriesWithoutResults()
  } catch (error) {
    queries.value = []
    nbQueriesWithoutResults.value = 0
  }
}
function getNbQueriesWithoutResults() {
  return queries.value.filter((q) => q.nbHits === 0).length
}
const title = computed(() => {
  return batchSearch.value?.name ?? props.uuid.split('-')[0]
})
const empty = computed(() => queries.value.length === 0)
</script>
<template>
  <page-container fluid deck class="task-batch-search-query-list">
    <page-header>
      <template #breadcrumb>
        <navigation-breadcrumb-link route-name="task" />
        <navigation-breadcrumb-link route-name="task.batch-search.list" />
        <navigation-breadcrumb-link route-name="task.batch-search-results.list" :title="title" />
        <navigation-breadcrumb-link route-name="task.batch-search-queries.list" />
        <navigation-breadcrumb-link route-name="task.batch-search-queries-results.list" />
      </template>
    </page-header>
    <b-row fluid class="gap-3">
      <b-col cols="8">
        <page-toolbar
          v-model:searchQuery="searchQuery"
          v-model:page="page"
          :per-page="perPage"
          filterable
          searchable
          paginable
        />

        <page-table-generic
          v-if="!empty"
          :items="queries"
          :fields="settings.propertiesModelValueOptions.value"
          :sort="sort"
          :order="order"
        >
          <template #cell(query)="{ item }">
            <task-batch-search-query-link :key="uuid" :indices="indices" :uuid="uuid" :query="item.query">{{
              item.query
            }}</task-batch-search-query-link>
          </template>
          <template #cell(documents)="{ item }"> {{ item.nbHits }} </template>

          <template #row-actions> Actions ! </template>
        </page-table-generic>
      </b-col>
      <b-col>
        <batch-search-card v-if="batchSearch" :batch-search="batchSearch" />
      </b-col>
    </b-row>
  </page-container>
</template>
