<script setup>
import { computed, ref, toRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import ButtonClearHistory from '@/components/Button/ButtonClearHistory'
import NavigationBreadcrumbLink from '@/components/NavigationBreadcrumb/NavigationBreadcrumbLink'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import PageToolbar from '@/components/PageToolbar/PageToolbar'
import RowPaginationDocuments from '@/components/RowPagination/RowPaginationDocuments'
import SearchHistoryEntries from '@/components/Search/SearchHistoryEntries/SearchHistoryEntries'
import { useConfirmModal } from '@/composables/useConfirmModal'
import { useCore } from '@/composables/useCore'
import { useHistoryEvents } from '@/composables/useHistoryEvents'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore'
import { useUrlPageParam } from '@/composables/useUrlPageParam'
import { useWait } from '@/composables/useWait'
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
const { removeAll } = useHistoryEvents('DOCUMENT')
const { isLoading, wait } = useWait()
const view = 'searchHistoryList'

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

const fetch = wait(async () => {
  const result = await api.getHistoryEvents('DOCUMENT', offset.value, perPage.value, sort.value, orderDesc.value)
  events.value = result?.items.map((item) => ({ ...item })) ?? []
  pagination.value = result.pagination
})

async function showRemoveAllModal() {
  if (await showConfirmModal()) {
    await removeAll()
    await fetch()
    toast.success(t('searchHistoryList.allRemoved'))
  }
}

watch(toRef(route, 'query'), fetch, { deep: true, immediate: true })
</script>

<template>
  <div class="search-history-list d-flex flex-column">
    <page-container fluid deck>
      <page-header>
        <template #breadcrumb>
          <navigation-breadcrumb-link route-name="search" title="Search" />
          <navigation-breadcrumb-link route-name="search.history.list" no-caret />
        </template>
        <template #actions>
          <button-clear-history @click="showRemoveAllModal" />
        </template>
      </page-header>
      <page-toolbar
        :key="pagination?.total"
        v-model:page="page"
        paginable
        :per-page="perPage"
        :total-rows="pagination.total"
      >
        <template #pagination="{ totalRows }">
          <row-pagination-documents v-model="page" :total-rows="totalRows" :per-page="perPage" />
        </template>
      </page-toolbar>
    </page-container>
    <page-container fluid class="flex-grow-1 overflow-auto">
      <search-history-entries :events="events" :loading-events="isLoading" />
      <div v-if="!events.length && !isLoading" class="text-center text-secondary">
        {{ t('searchHistoryList.empty') }}
      </div>
    </page-container>
  </div>
</template>

<style lang="scss" scoped>
.search-history-list {
  max-height: 100vh;
}
</style>
