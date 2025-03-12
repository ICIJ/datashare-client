<script setup>
import { computed, toRef, ref, onBeforeMount, watch } from 'vue'
import { useRoute } from 'vue-router'

import ButtonRowActionSearch from '@/components/Button/ButtonRowAction/ButtonRowActionSearch'
import BatchSearchCard from '@/components/BatchSearch/BatchSeachCard/BatchSearchCard'
import NavigationBreadcrumbLink from '@/components/NavigationBreadcrumb/NavigationBreadcrumbLink'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import PageToolbar from '@/components/PageToolbar/PageToolbar'
import { useCore } from '@/composables/core'
import { useBatchSearchQueryProperties } from '@/composables/batch-search-query-properties'
import { useUrlParam, useUrlParamWithStore } from '@/composables/url-params'
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
const { fields } = useBatchSearchQueryProperties()

const settingsView = 'batch-search-queries'
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
  set: (value) => appStore.setSettings({ view: settingsView, perPage: parseInt(value) })
})

const from = computed(() => (page.value - 1) * perPage.value)

const visibleFields = computed(() => {
  return fields.filter((field) => {
    return appStore.getSettings(settingsView, 'properties').includes(field.key)
  })
})

const batchSearchName = computed(() => batchSearch.value?.name)
const empty = computed(() => queries.value.length === 0)

async function fetchBatchSearch() {
  // Fetch the task for this batch search
  taskStore.tasks.push(await core.api.getTask(props.uuid))
  // Then fetch the batch search record
  batchSearch.value = await core.api.getBatchSearch(props.uuid)
}

async function fetchBatchSearchQueries() {
  const records = await core.api.getBatchSearchQueries(props.uuid, from.value, perPage.value, searchQuery.value)
  // The queries are returned in an object
  queries.value = Object.entries(records).map(([query, count]) => ({ query, count }))
}

onBeforeMount(fetchBatchSearch)
watch(toRef(route, 'query'), fetchBatchSearchQueries, { deep: true, immediate: true })
</script>

<template>
  <page-container fluid deck class="task-batch-search-query-list">
    <page-header>
      <template #breadcrumb>
        <navigation-breadcrumb-link route-name="task" />
        <navigation-breadcrumb-link route-name="task.batch-search.list" />
        <navigation-breadcrumb-link route-name="task.batch-search-queries.list" :title="batchSearchName" />
      </template>
    </page-header>
    <b-row>
      <b-col lg="8" cols="12">
        <page-toolbar
          v-model:searchQuery="searchQuery"
          v-model:page="page"
          :per-page="perPage"
          :total-rows="batchSearch?.nbQueries ?? 0"
          paginable
          searchable
        />
        <page-table-generic v-if="!empty" :items="queries" :fields="visibleFields">
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
        </page-table-generic>
      </b-col>
      <b-col lg="4" cols="12">
        <batch-search-card v-if="batchSearch" :batch-search="batchSearch" />
      </b-col>
    </b-row>
  </page-container>
</template>
