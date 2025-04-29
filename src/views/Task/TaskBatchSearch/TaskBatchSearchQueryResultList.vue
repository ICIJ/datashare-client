<script setup>
import { castArray, compact } from 'lodash'
import { computed, onBeforeMount, ref, toRef, watch } from 'vue'
import { useRoute } from 'vue-router'

import batchSearchResultsEmpty from '@/assets/images/illustrations/batch-search-results-empty.svg'
import DisplayNumber from '@/components/Display/DisplayNumber'
import DisplayContentLength from '@/components/Display/DisplayContentLength'
import DisplayContentType from '@/components/Display/DisplayContentType'
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import EmptyState from '@/components/EmptyState/EmptyState'
import NavigationBreadcrumbLink from '@/components/NavigationBreadcrumb/NavigationBreadcrumbLink'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import ProjectButton from '@/components/Project/ProjectButton'
import RouterLinkBatchSearchResult from '@/components/RouterLink/RouterLinkBatchSearchResult'
import RowPaginationDocuments from '@/components/RowPagination/RowPaginationDocuments'
import { useAppStore } from '@/store/modules'
import { useBatchSearchResultProperties } from '@/composables/useBatchSearchResultProperties'
import { useCore } from '@/composables/useCore'
import { useUrlParam } from '@/composables/useUrlParam'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore'
import { useWait } from '@/composables/useWait'

const props = defineProps({
  uuid: {
    type: String,
    required: true
  },
  indices: {
    type: String,
    required: true
  },
  query: {
    type: String
  }
})

const appStore = useAppStore()
const route = useRoute()
const { core } = useCore()
const { fields } = useBatchSearchResultProperties()
const { waitFor, isLoading } = useWait()
const settingsView = 'batchSearchResults'
const hits = ref(null)
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

const isEmpty = computed(() => !isLoading.value && !hits.value.items?.length)

const fetchBatchSearchResults = waitFor(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  hits.value = await core.api.getBatchSearchResults(
    props.uuid,
    from.value,
    perPage.value,
    compact(castArray(props.query)),
    sort.value,
    order.value
  )
})

async function fetchBatchSearch() {
  batchSearch.value = await core.api.getBatchSearch(props.uuid)
}

onBeforeMount(fetchBatchSearch)
watch(toRef(route, 'query'), fetchBatchSearchResults, { deep: true, immediate: true })
</script>

<template>
  <page-header
    v-model:searchQuery="searchQuery"
    v-model:page="page"
    :per-page="perPage"
    :total-rows="hits?.pagination?.total ?? 0"
    paginable
    sticky
  >
    <template #breadcrumb>
      <navigation-breadcrumb-link :to="{ name: 'task' }" />
      <navigation-breadcrumb-link :to="{ name: 'task.batch-search.list' }" />
      <navigation-breadcrumb-link :to="{ name: 'task.batch-search-queries.list' }" :title="batchSearchName" />
      <navigation-breadcrumb-link
        v-if="query"
        :to="{ name: 'task.batch-search-queries.show' }"
        :title="query"
        no-icon
      />
      <navigation-breadcrumb-link
        v-else
        :to="{ name: 'task.batch-search-results.list' }"
        :title="$t('task.batch-search-results.list.title')"
        no-icon
      />
    </template>
    <template #pagination="{ totalRows }">
      <row-pagination-documents v-model="page" :total-rows="totalRows" :per-page="perPage" />
    </template>
  </page-header>
  <page-container fluid>
    <slot v-if="isEmpty" name="empty">
      <empty-state :label="$t('task.batch-search-results.show.emptyStateLabel')" :image="batchSearchResultsEmpty" />
    </slot>
    <page-table-generic
      v-else
      v-model:sort="sort"
      v-model:order="order"
      :items="hits?.items"
      :fields="visibleFields"
      :loading="isLoading"
    >
      <template #cell(query)="{ item }">
        <cite class="text-secondary fst-normal text-nowrap">
          {{ item.query }}
        </cite>
      </template>
      <template #cell(documentNumber)="{ item }">
        <display-number :value="item.documentNumber" />
      </template>
      <template #cell(documentName)="{ item }">
        <router-link-batch-search-result :item="item" class="text-nowrap" modal />
      </template>
      <template #cell(project)="{ item }">
        <project-button :project="item.project" />
      </template>
      <template #cell(contentType)="{ item }">
        <display-content-type :value="item.contentType" class="text-nowrap" />
      </template>
      <template #cell(contentLength)="{ item }">
        <display-content-length :value="item.contentLength" class="text-nowrap" />
      </template>
      <template #cell(documentPath)="{ item }">
        {{ item.documentPath }}
      </template>
      <template #cell(creation_date)="{ item }">
        <display-datetime :value="item.creationDate" />
      </template>
    </page-table-generic>
  </page-container>
</template>
