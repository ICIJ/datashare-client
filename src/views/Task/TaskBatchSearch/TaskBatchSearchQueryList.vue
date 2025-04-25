<script setup>
import { computed, toRef, ref, onBeforeMount, watch } from 'vue'
import { useRoute } from 'vue-router'
import get from 'lodash/get.js'

import ButtonRowActionSearch from '@/components/Button/ButtonRowAction/ButtonRowActionSearch'
import BatchSearchCard from '@/components/BatchSearch/BatchSeachCard/BatchSearchCard'
import NavigationBreadcrumbLink from '@/components/NavigationBreadcrumb/NavigationBreadcrumbLink'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import PageHeaderToolbar from '@/components/PageHeader/PageHeaderToolbar'
import RowPaginationQueries from '@/components/RowPagination/RowPaginationQueries'
import { useCore } from '@/composables/useCore'
import { useBatchSearchQueryProperties } from '@/composables/useBatchSearchQueryProperties'
import { useUrlParam } from '@/composables/useUrlParam'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore'
import { useWait } from '@/composables/useWait'
import { useAppStore, useTaskStore } from '@/store/modules'

const props = defineProps({
  uuid: {
    type: String,
    required: true
  },
  indices: {
    type: String,
    required: true
  }
})

const route = useRoute()
const appStore = useAppStore()
const taskStore = useTaskStore()
const { core } = useCore()
const { waitFor, isLoading } = useWait()
const { fields } = useBatchSearchQueryProperties()

const settingsView = 'batchSearchQueries'
const queries = ref([])
const batchSearch = ref(null)

const searchQuery = useUrlParam('q', '')

const page = useUrlParam('page', {
  transform: (value) => parseInt(value),
  initialValue: 1
})

const perPage = useUrlParamWithStore('perPage', {
  transform: (value) => Math.max(10, parseInt(value)),
  get: () => appStore.getSettings(settingsView, 'perPage'),
  set: (value) => appStore.setSettings(settingsView, { perPage: parseInt(value) })
})

const orderBy = useUrlParamsWithStore(['sort', 'order'], {
  get: () => appStore.getSettings(settingsView, 'orderBy'),
  set: (sort, order) => appStore.setSettings(settingsView, { orderBy: [sort, order] })
})

const sort = computed({
  get: () => orderBy.value?.[0],
  set: (value) => (orderBy.value = [value, order.value])
})

const order = computed({
  get: () => orderBy.value?.[1],
  set: (value) => (orderBy.value = [sort.value, value])
})

const from = computed(() => (page.value - 1) * perPage.value)

const visibleFields = computed(() => {
  return fields.filter((field) => {
    return appStore.getSettings(settingsView, 'properties').includes(field.key)
  })
})

const batchSearchName = computed(() => batchSearch.value?.name)
function getBatchSearchRecord(item) {
  return get(item, ['args', 'batchRecord'].join('.'))
}
function getBatchSearchUser(item) {
  return get(item, ['args', 'user'].join('.'))
}
async function fetchBatchSearch() {
  // eslint-disable-next-line no-unused-vars
  const [taskBatchSearch, _oldBatchSearch] = await Promise.all([
    core.api.getTask(props.uuid),
    core.api.getBatchSearch(props.uuid)
  ])
  const batchSearchRecord = getBatchSearchRecord(taskBatchSearch)
  const batchSearchUser = getBatchSearchUser(taskBatchSearch)
  // Then fetch the batch search record
  batchSearch.value = {
    uuid: batchSearchRecord.uuid,
    name: batchSearchRecord.name,
    nbResults: batchSearchRecord.nbResults,
    nbQueriesWithoutResults: batchSearchRecord.nbQueriesWithoutResults,
    nbQueries: batchSearchRecord.nbQueries,
    state: batchSearchRecord.state,
    date: batchSearchRecord.date,
    userId: batchSearchUser.id,
    published: batchSearchRecord.published,
    phraseMatches: batchSearchRecord.phraseMatches,
    fuzziness: batchSearchRecord.fuzziness,
    projects: batchSearchRecord.projects,
    description: batchSearchRecord.description,
    uri: batchSearchRecord.uri
  }
}

const fetchBatchSearchQueries = waitFor(async () => {
  const records = await core.api.getBatchSearchQueries(
    props.uuid,
    from.value,
    perPage.value,
    searchQuery.value,
    sort.value,
    order.value
  )
  // The queries are returned in an object
  queries.value = Object.entries(records).map(([query, count]) => ({ query, count }))
})

onBeforeMount(fetchBatchSearch)
watch(toRef(route, 'query'), fetchBatchSearchQueries, { deep: true, immediate: true })
</script>

<template>
  <page-header>
    <template #breadcrumb>
      <navigation-breadcrumb-link :to="{ name: 'task' }" />
      <navigation-breadcrumb-link :to="{ name: 'task.batch-search.list' }" />
      <navigation-breadcrumb-link :to="{ name: 'task.batch-search-queries.list' }" :title="batchSearchName" />
    </template>
  </page-header>
  <page-container fluid class="pb-3">
    <b-row>
      <b-col lg="8" cols="12">
        <page-header-toolbar
          v-model:searchQuery="searchQuery"
          v-model:page="page"
          :per-page="perPage"
          :total-rows="batchSearch?.nbQueries ?? 0"
          class="p-0"
          paginable
          searchable
        >
          <template #pagination="{ totalRows }">
            <row-pagination-queries v-model="page" :total-rows="totalRows" :per-page="perPage" />
          </template>
        </page-header-toolbar>
        <page-table-generic
          v-model:sort="sort"
          v-model:order="order"
          :items="queries"
          :fields="visibleFields"
          :loading="isLoading"
        >
          <template #cell(query)="{ item }">
            <router-link :to="{ name: 'task.batch-search-queries.show', params: { query: item.query } }">
              {{ item.query }}
            </router-link>
          </template>
          <template #cell(count)="{ item }">
            {{ item.count }}
          </template>
          <template #row-actions="{ item }">
            <button-row-action-search :to="{ name: 'search', query: { indices, q: item.query } }" />
          </template>
          <template #empty>
            {{ $t('task.batch-search-queries.list.noMatches') }}
          </template>
        </page-table-generic>
      </b-col>
      <b-col lg="4" cols="12">
        <batch-search-card v-if="batchSearch" :batch-search="batchSearch" />
      </b-col>
    </b-row>
  </page-container>
</template>
