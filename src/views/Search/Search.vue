<script setup>
import { computed, ref, watch, toValue, useTemplateRef } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

import PageContainer from '@/components/PageContainer/PageContainer'
import ButtonToggleFilters from '@/components/Button/ButtonToggleFilters'
import ButtonToggleSearchBreadcrumb from '@/components/Button/ButtonToggleSearchBreadcrumb'
import ButtonToggleSettings from '@/components/Button/ButtonToggleSettings'
import ButtonToggleSidebar from '@/components/Button/ButtonToggleSidebar'
import SearchBar from '@/components/Search/SearchBar/SearchBar'
import SearchBreadcrumb from '@/views/Search/SearchBreadcrumb'
import SearchSelection from '@/views/Search/SearchSelection'
import SearchCarousel from '@/views/Search/SearchCarousel'
import SearchNav from '@/views/Search/SearchNav'
import DocumentEntries from '@/components/Document/DocumentEntries/DocumentEntries'
import Hook from '@/components/Hook'
import settings from '@/utils/settings'
import { useDocument } from '@/composables/document'
import { replaceUrlParam, useUrlPageFromWithStore, whenIsRoute } from '@/composables/url-params'
import { useSearchFilter } from '@/composables/search-filter'
import { useSearchBreadcrumb } from '@/composables/search-breadcrumb'
import { useViews } from '@/composables/views'
import { LAYOUTS } from '@/enums/layouts'

const { toggleSettings, toggleFilters, toggleSidebar, isFiltersClosed } = useViews()
const { provideDocumentViewFloatingId, watchDocument } = useDocument()
const { refreshRoute, refreshSearchFromRoute, resetSearchResponse, watchIndices } = useSearchFilter()
const { count: searchBreadcrumbCounter } = useSearchBreadcrumb()
const entriesRef = useTemplateRef('entries')
const store = useStore()
const route = useRoute()

// The size query parameter is replaced by the perPage query parameter
replaceUrlParam({ from: 'size', to: 'perPage' })
// This function replaces a unique sort query parameter with a pair of sort and order query parameters
// based on the settings's searchSortFields. This way we can ensure retro-compatibility with
// the former sort query parameter which used to contain both the sort field and the order.
replaceUrlParam({
  from: 'sort',
  to: (name) => {
    const { field: sort = null, desc } = find(settings.searchSortFields, { name }) ?? {}
    const order = desc ? 'desc' : 'asc'
    // Only redirect if the sort field is found
    return sort ? { sort, order } : null
  }
})

const entries = computed(() => store.state.search.response.hits)
const properties = computed(() => store.getters['app/getSettings']('search', 'properties'))
const layout = computed(() => store.getters['app/getSettings']('search', 'layout'))
const loading = computed(() => !store.state.search.isReady)
const hasNav = computed(() => toValue(layout) === LAYOUTS.LIST)
const hasDocumentInModal = computed(() => layout.value !== LAYOUTS.LIST)

const selection = ref([])
const toggleSearchBreadcrumb = ref(false)
const selectMode = ref(false)

const total = computed(() => parseInt(store.state.search.response.total))
const perPage = computed(() => parseInt(store.getters['app/getSettings']('search', 'perPage')))
const page = useUrlPageFromWithStore({
  perPage: toValue(perPage),
  // The "from" query parameter is updated to reflect the current state
  // which while force the route to redirect to "search".
  to: 'search',
  // The value of the "from" query parameter is directly taken from the store state
  get: () => store.state.search.from,
  // The value of the "from" query parameter is mutated with the store commit "search/from"
  set: 'search/from'
})

const documentViewFloatingId = provideDocumentViewFloatingId()

const resetEntriesListSize = () => toValue(entriesRef)?.resetListSize?.()
const resetDocumentSize = () => toValue(entriesRef)?.resetDocumentSize?.()

// The user might have resized the entries list or the document view. When the search is updated
// or a new document is loaded, we need to reset original size to ensure that they are displayed.
watch(() => route.query, whenIsRoute('search', resetEntriesListSize), { deep: true, immediate: true })
watchDocument(resetDocumentSize)

// Reset the search response when the component is mounted to ensure that the displayed search result
// are always up-to-date with the current route query. This is important because the search response
// can still be populated with the previous search results.
resetSearchResponse()

// Refresh search when route query changes. Among all the watcher of this view, it probably
// the most important one. It will trigger the search API call when the route query changes
// which mean that only route change can trigger a search.
watch(() => route.query, whenIsRoute('search', refreshSearchFromRoute), { deep: true, immediate: true })

// Refresh route query when filter values change
watch(() => store.state.search.values, refreshRoute, { deep: true })
// Refresh route query when reversed filters change
watch(() => store.state.search.excludeFilters, refreshRoute, { deep: true })
// Refresh route query when projects change
watchIndices(refreshRoute)
</script>

<template>
  <page-container class="search" fluid>
    <hook name="search:before" />
    <div class="search__main d-flex">
      <slot name="filters" />
      <div class="search__main__content flex-grow-1">
        <div class="d-flex gap-3 py-3">
          <button-toggle-sidebar v-if="!toggleSidebar" v-model:active="toggleSidebar" class="flex-shrink-0" />
          <button-toggle-filters
            v-if="isFiltersClosed"
            v-model:active="toggleFilters"
            class="search__main__toggle-filters"
          />
          <button-toggle-search-breadcrumb
            v-model:active="toggleSearchBreadcrumb"
            :counter="searchBreadcrumbCounter"
            class="search__main__toggle-search-breadcrumb"
          />
          <div class="flex-grow-1">
            <search-bar class="search__main__search-bar" />
          </div>
          <button-toggle-settings v-model:active="toggleSettings" class="search__main__toggle-settings" />
        </div>
        <search-breadcrumb v-model:visible="toggleSearchBreadcrumb" />
        <div class="search__main__results">
          <document-entries
            ref="entries"
            v-model:page="page"
            v-model:select-mode="selectMode"
            :entries="entries"
            :selection="selection"
            :properties="properties"
            :layout="layout"
            :total="total"
            :per-page="perPage"
            :loading="loading"
          >
            <template #header="{ compact }">
              <search-selection
                v-if="selectMode"
                v-model:selection="selection"
                :entries="entries"
                :select-mode="selectMode"
                :compact="compact"
              />
            </template>
            <template #floating>
              <div :id="documentViewFloatingId"></div>
            </template>
            <template #carousel>
              <search-carousel />
            </template>
            <router-view v-slot="{ Component }">
              <component :is="Component" :modal="hasDocumentInModal">
                <template v-if="hasNav" #nav>
                  <search-nav />
                </template>
              </component>
            </router-view>
          </document-entries>
        </div>
      </div>
    </div>
    <hook name="search:after" />
  </page-container>
</template>
