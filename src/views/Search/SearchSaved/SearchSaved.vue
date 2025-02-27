<script setup>
import { computed, ref, toRef, watch } from 'vue'
import { useRoute } from 'vue-router'

import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import PageToolbar from '@/components/PageToolbar/PageToolbar'
import NavigationBreadcrumbLink from '@/components/NavigationBreadcrumb/NavigationBreadcrumbLink'
import SearchSavedEntries from '@/components/Search/SearchSavedEntries/SearchSavedEntries'
import { useUrlPageParam, useUrlParamWithStore, useUrlParamsWithStore } from '@/composables/url-params'
import { useAppStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

const events = ref([])
const pagination = ref({})

const appStore = useAppStore()
const page = useUrlPageParam()
const route = useRoute()

const perPage = useUrlParamWithStore('perPage', {
  transform: (value) => Math.max(10, parseInt(value)),
  get: () => appStore.getSettings('searchSaved', 'perPage'),
  set: (value) => {
    appStore.setSettings({ view: 'searchSaved', perPage: parseInt(value) })
    page.value = 1
  }
})

const offset = computed(() => {
  return (page.value - 1) * perPage.value
})

const orderBy = useUrlParamsWithStore(['sort', 'order'], {
  get: () => appStore.getSettings('searchSaved', 'orderBy'),
  set: (sort, order) => {
    appStore.setSettings({ view: 'searchSaved', orderBy: [sort, order] })
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
  const result = await api.getUserHistory('search', offset.value, perPage.value, sort.value, orderDesc.value)
  events.value = result.items.map((item) => ({ ...item }))
  pagination.value = result.pagination
}

watch(toRef(route, 'query'), fetch, { deep: true, immediate: true })
</script>

<template>
  <div class="search-saved">
    <page-container fluid deck>
      <page-header>
        <template #breadcrumb>
          <navigation-breadcrumb-link route-name="search" />
          <navigation-breadcrumb-link route-name="search.saved" no-caret />
        </template>
      </page-header>
      <page-toolbar
        :key="pagination?.total"
        v-model:page="page"
        paginable
        :per-page="perPage"
        :total-rows="pagination.total"
      />
    </page-container>
    <page-container fluid>
      <search-saved-entries 
        v-model:sort="sort" 
        v-model:order="order" 
        :events="events"
        @reload="fetch"
      />
    </page-container>
  </div>
</template>
