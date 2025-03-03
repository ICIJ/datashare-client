<script setup>
import { computed, ref, onBeforeMount } from 'vue'

import NavigationBreadcrumbEntry from '@/components/NavigationBreadcrumb/NavigationBreadcrumbEntry'
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
const props = defineProps({
  uuid: { type: String, required: true },
  indices: { type: [String, Object], required: true },
  query: { type: String, required: true }
})

const appStore = useAppStore()
const settingView = 'batch-search-queries-results'
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
const settings = useTaskSettings(settingView)

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
  queries: [props.query],
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

const empty = computed(() => hits.value.length === 0)
</script>
<template>
  <page-container fluid deck class="task-batch-search-query-list">
    <page-header>
      <template #breadcrumb>
        <navigation-breadcrumb-link route-name="task" />
        <navigation-breadcrumb-link route-name="task.batch-search.list" />
        <navigation-breadcrumb-link route-name="task.batch-search-queries" />
        <navigation-breadcrumb-link route-name="task.batch-search-queries-results.list" />
        <navigation-breadcrumb-entry> "{{ query }}" </navigation-breadcrumb-entry>
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
      :fields="settings.propertiesModelValueOptions.value"
      :sort="sort"
      :order="order"
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
