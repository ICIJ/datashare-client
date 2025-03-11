<script setup>
import { computed, ref, onBeforeMount } from 'vue'

import ButtonRowActionSearch from '@/components/Button/ButtonRowAction/ButtonRowActionSearch'
import BatchSearchCard from '@/components/BatchSearch/BatchSeachCard/BatchSearchCard'
import NavigationBreadcrumbLink from '@/components/NavigationBreadcrumb/NavigationBreadcrumbLink'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import PageToolbar from '@/components/PageToolbar/PageToolbar'
import { useCore } from '@/composables/core'
import { useTaskSettings } from '@/composables/task-settings'
import { useUrlParam, useUrlParamsWithStore, useUrlParamWithStore } from '@/composables/url-params'
import { useAppStore } from '@/store/modules'

const props = defineProps({
  uuid: { type: String, required: true },
  indices: { type: [String, Object], required: true }
})

const { core } = useCore()
const appStore = useAppStore()
const settingView = 'batch-search-queries'
const settings = useTaskSettings(settingView)
const queries = ref([])
const batchSearch = ref(null)
const nbQueriesWithoutResults = ref(0)

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

const title = computed(() => batchSearch.value?.name ?? props.uuid.split('-')[0])
const empty = computed(() => queries.value.length === 0)

async function getBatchSearch() {
  try {
    batchSearch.value = { ...(await core.api.getBatchSearch(props.uuid)), nbQueriesWithoutResults }
  } catch (error) {
    batchSearch.value = null
  }
}

async function getBatchSearchQueries() {
  try {
    const queriesObjects = await core.api.getBatchSearchQueries(props.uuid)
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

onBeforeMount(getBatchSearchQueries)
onBeforeMount(getBatchSearch)
</script>

<template>
  <page-container fluid deck class="task-batch-search-query-list">
    <page-header>
      <template #breadcrumb>
        <navigation-breadcrumb-link route-name="task" />
        <navigation-breadcrumb-link route-name="task.batch-search.list" />
        <navigation-breadcrumb-link route-name="task.batch-search-queries.list" :title="title" />
      </template>
    </page-header>
    <b-row>
      <b-col lg="8" cols="12">
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
            <router-link :to="{ name: 'task.batch-search-queries.show', params: { query: item.query } }">
              {{ item.query }}
            </router-link>
          </template>
          <template #cell(documents)="{ item }"> {{ item.nbHits }} </template>
          <template #row-actions="{ item }">
            <button-row-action-search :to="{ name: 'search', query: { indices, q: item.query } }" />
          </template>
        </page-table-generic>
      </b-col>
      <b-col lg="4" cols="12">
        <batch-search-card v-if="batchSearch" :batch-search="batchSearch" />
      </b-col>
    </b-row>
  </page-container>
</template>
