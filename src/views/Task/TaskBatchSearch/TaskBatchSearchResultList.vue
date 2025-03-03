<script setup>
import { computed, ref, onBeforeMount } from 'vue'

import NavigationBreadcrumbLink from '@/components/NavigationBreadcrumb/NavigationBreadcrumbLink'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import PageHeader from '@/components/PageHeader/PageHeader'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageToolbar from '@/components/PageToolbar/PageToolbar'
import { useUrlParam, useUrlParamsWithStore, useUrlParamWithStore } from '@/composables/url-params'
import { useAppStore } from '@/store/modules'
import { useCore } from '@/composables/core'
import { useTaskSettings } from '@/composables/task-settings'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import DisplayContentLength from '@/components/Display/DisplayContentLength'
import DisplayContentType from '@/components/Display/DisplayContentType'
import DisplayDocumentLink from '@/components/Display/DisplayDocumentLink'
import SearchLink from '@/components/Task/TaskBatchSearch/SearchLink'
const props = defineProps({
  uuid: { type: String, required: true },
  indices: { type: [String, Object], required: true }
})

const appStore = useAppStore()
const settingView = 'batch-search-results'
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

const contentType = useUrlParamsWithStore(['contentType'], {
  get: () => appStore.getSettings(settingView, 'contentType'),
  set: (value) => appStore.setSettings({ view: settingView, contentTypes: value.join(',') })
})
const { propertiesModelValueOptions } = useTaskSettings(settingView)

const { core } = useCore()
const emptyHits = computed(() => ({
  items: [],
  pagination: { count: 0, from: page.value, size: perPage.value, total: 0 }
}))
const hits = ref(emptyHits.value)
const batchSearch = ref(null)
onBeforeMount(() => {
  getBatchSearch(props.uuid)
  getBatchSearchResults(payload)
})

async function getBatchSearch(batchId) {
  try {
    batchSearch.value = await core.api.getBatchSearch(batchId)
  } catch (error) {
    batchSearch.value = null
  }
}
const payload = {
  batchId: props.uuid,
  from: page.value,
  size: perPage.value,
  queries: [],
  queriesExcluded: false,
  sort: sort.value,
  order: order.value,
  contentTypes: contentType.value
}
async function getBatchSearchResults() {
  try {
    hits.value = await core.api.getBatchSearchResults(
      payload.batchId,
      payload.from,
      payload.size,
      payload.queries,
      payload.sort,
      payload.order,
      payload.contentTypes,
      payload.queriesExcluded
    )
  } catch (e) {
    hits.value = emptyHits.value
  }
}
const title = computed(() => {
  return batchSearch.value?.name ?? props.uuid.split('-')[0]
})

const empty = computed(() => hits.value.length === 0)
</script>
<template>
  <page-container fluid deck class="task-batch-search-query-list">
    <page-header>
      <template #breadcrumb>
        <navigation-breadcrumb-link route-name="task" />
        <navigation-breadcrumb-link route-name="task.batch-search.list" />
        <navigation-breadcrumb-link route-name="task.batch-search-queries.list" :title="title" />
        <navigation-breadcrumb-link route-name="task.batch-search-results.list" title="All documents" />
      </template>
    </page-header>

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
      :items="hits.items"
      :fields="propertiesModelValueOptions"
      :sort="sort"
      :order="order"
    >
      <template #cell(query)="{ item }">
        <search-link :key="uuid" :indices="indices" :uuid="uuid" :query="item.query">{{
          item.query
        }}</search-link></template
      >
      <template #cell(rank)="{ item }"> {{ item.documentNumber }}</template>
      <template #cell(documentName)="{ item }"> <display-document-link :value="item" /></template>
      <template #cell(contentLength)="{ item }"><display-content-length :value="item.contentLength" /> </template>
      <template #cell(contentType)="{ item }"> <display-content-type :value="item.contentType" /></template>
      <template #cell(project)="{ item }"><display-project-list :values="item.project" /></template>
      <template #row-actions> Actions !</template>
    </page-table-generic>
  </page-container>
</template>
