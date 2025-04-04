<script setup>
import { computed, ref, toRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import ButtonClearSavedSearches from '@/components/Button/ButtonClearSavedSearches'
import NavigationBreadcrumbLink from '@/components/NavigationBreadcrumb/NavigationBreadcrumbLink'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import RowPaginationSearches from '@/components/RowPagination/RowPaginationSearches'
import SearchSavedEntries from '@/components/Search/SearchSavedEntries/SearchSavedEntries'
import { useConfirmModal } from '@/composables/useConfirmModal'
import { useCore } from '@/composables/useCore'
import { useHistoryEvents } from '@/composables/useHistoryEvents'
import { useSearchNav } from '@/composables/useSearchNav'
import { useUrlPageParam } from '@/composables/useUrlPageParam'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore'
import { useAppStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

const events = ref([])
const pagination = ref({})

const appStore = useAppStore()
const page = useUrlPageParam()
const route = useRoute()
const { t } = useI18n()
const { toast } = useCore()
const { confirm: showConfirmModal } = useConfirmModal()
const { removeAll } = useHistoryEvents('SEARCH')
const { searchRoute } = useSearchNav()

const view = 'searchSavedList'
const perPage = useUrlParamWithStore('perPage', {
  transform: (value) => Math.max(10, parseInt(value)),
  get: () => appStore.getSettings(view, 'perPage'),
  set: (value) => {
    appStore.setSettings({ view, perPage: parseInt(value) })
    page.value = 1
  }
})

const offset = computed(() => {
  return (page.value - 1) * perPage.value
})

const orderBy = useUrlParamsWithStore(['sort', 'order'], {
  get: () => appStore.getSettings(view, 'orderBy'),
  set: (sort, order) => {
    appStore.setSettings({ view, orderBy: [sort, order] })
    page.value = 1
  }
})

const sort = computed({
  get: () => orderBy.value?.[0],
  set: (value) => (orderBy.value = [value, order.value])
})

const order = computed({
  get: () => orderBy.value?.[1],
  set: (value) => (orderBy.value = [sort.value, value])
})

const orderDesc = computed(() => order.value === 'desc')

async function fetch() {
  const result = await api.getHistoryEvents('search', offset.value, perPage.value, sort.value, orderDesc.value)
  events.value = result?.items?.map((item) => ({ ...item })) ?? []
  pagination.value = result?.pagination
}

async function showRemoveAllModal() {
  if (await showConfirmModal()) {
    await removeAll()
    await fetch()
    toast.success(t('searchSavedList.allRemoved'))
  }
}

watch(toRef(route, 'query'), fetch, { deep: true, immediate: true })
</script>

<template>
  <div class="search-saved-list">
    <page-header
      :key="pagination?.total"
      v-model:page="page"
      paginable
      sticky
      :per-page="perPage"
      :total-rows="pagination?.total ?? 0"
    >
      <template #breadcrumb>
        <navigation-breadcrumb-link :to="searchRoute" :title="t('appSidebar.search')" />
        <navigation-breadcrumb-link :to="{ name: 'search.saved.list' }" no-caret />
      </template>
      <template #actions>
        <button-clear-saved-searches @click="showRemoveAllModal" />
      </template>
      <template #pagination="{ totalRows }">
        <row-pagination-searches v-model="page" :total-rows="totalRows" :per-page="perPage" />
      </template>
    </page-header>
    <page-container fluid>
      <search-saved-entries v-model:sort="sort" v-model:order="order" :events="events" @reload="fetch" />
    </page-container>
  </div>
</template>
