<script setup>
import { castArray, compact } from 'lodash'
import { computed, onBeforeMount, ref, toRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import batchSearchResultsEmpty from '@/assets/images/illustrations/batch-search-results-empty.svg'
import AppSpinner from '@/components/AppSpinner/AppSpinner'
import DisplayNumber from '@/components/Display/DisplayNumber'
import DisplayContentLength from '@/components/Display/DisplayContentLength'
import DisplayContentType from '@/components/Display/DisplayContentType'
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import EmptyState from '@/components/EmptyState/EmptyState'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import ProjectButton from '@/components/Project/ProjectButton'
import RouterLinkBatchSearchResult from '@/components/RouterLink/RouterLinkBatchSearchResult'
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

const { t } = useI18n()
const appStore = useAppStore()
const route = useRoute()
const core = useCore()
const { fields } = useBatchSearchResultProperties()
const { waitFor, isLoading } = useWait()
const batchSearch = ref(null)
const settingsView = 'batchSearchResults'
const hits = ref(null)

const searchQuery = useUrlParam('q', '')

const page = useUrlParam('page', {
  transform: value => parseInt(value),
  initialValue: 1
})

const perPage = useUrlParamWithStore('perPage', {
  transform: value => Math.max(10, parseInt(value)),
  get: () => appStore.getSettings(settingsView, 'perPage'),
  set: value => appStore.setSettings(settingsView, { perPage: parseInt(value) })
})

const orderBy = useUrlParamsWithStore(['sort', 'order'], {
  get: () => appStore.getSettings(settingsView, 'orderBy'),
  set: (sort, order) => appStore.setSettings(settingsView, { orderBy: [sort, order] })
})

const sort = computed({
  get: () => orderBy.value?.[0],
  set: value => (orderBy.value = [value, order.value])
})

const order = computed({
  get: () => orderBy.value?.[1],
  set: value => (orderBy.value = [sort.value, value])
})

const from = computed(() => (page.value - 1) * perPage.value)

const breadcrumbRoutes = computed(() => {
  return [
    {
      name: 'task'
    },
    {
      name: 'task.batch-search.list'
    },
    {
      name: 'task.batch-search-queries.list'
    },
    {
      name: props.query ? 'task.batch-search-queries.show' : 'task.batch-search-results.list'
    }
  ]
})

const visibleFields = computed(() => {
  return fields.filter((field) => {
    return appStore.getSettings(settingsView, 'properties').includes(field.key)
  })
})

const isEmpty = computed(() => !isLoading.value && !hits.value.items?.length)

const fetchBatchSearchResults = waitFor(async () => {
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
  <!-- eslint-disable vue/valid-v-slot -->
  <page-header
    v-model:search-query="searchQuery"
    v-model:page="page"
    :breadcrumb-routes="breadcrumbRoutes"
    :per-page="perPage"
    :total-rows="hits?.pagination?.total ?? 0"
    paginable
    sticky
  >
    <template #entry-label(task.batch-search-queries.list)>
      <template v-if="batchSearch">
        {{ batchSearch.name }}
      </template>
      <app-spinner v-else />
    </template>
    <template #entry-label(task.batch-search-queries.show)>
      {{ query }}
    </template>
    <template #entry-label(task.batch-search-results.list)>
      {{ t('task.batch-search-results.list.title') }}
    </template>
  </page-header>
  <page-container fluid>
    <slot
      v-if="isEmpty"
      name="empty"
    >
      <empty-state
        :label="t('task.batch-search-results.show.emptyStateLabel')"
        :image="batchSearchResultsEmpty"
      />
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
        <router-link-batch-search-result
          :item="item"
          class="text-nowrap"
          modal
        />
      </template>
      <template #cell(project)="{ item }">
        <project-button :project="item.project" />
      </template>
      <template #cell(contentType)="{ item }">
        <display-content-type
          :value="item.contentType"
          class="text-nowrap"
        />
      </template>
      <template #cell(contentLength)="{ item }">
        <display-content-length
          :value="item.contentLength"
          class="text-nowrap"
        />
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
