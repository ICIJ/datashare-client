<script setup>
import { computed, ref, watch, toValue, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'

import searchEmpty from '@/assets/images/illustrations/search-empty-light.svg'
import searchEmptyDark from '@/assets/images/illustrations/search-empty-dark.svg'
import DocumentModal from '@/components/Document/DocumentModal'
import EmptyState from '@/components/EmptyState/EmptyState'
import PageContainer from '@/components/PageContainer/PageContainer'
import SearchToolbar from '@/components/Search/SearchToolbar/SearchToolbar'
import SearchBreadcrumb from '@/views/Search/SearchBreadcrumb'
import SearchCarousel from '@/views/Search/SearchCarousel'
import SearchSelection from '@/views/Search/SearchSelection'
import SearchNav from '@/views/Search/SearchNav'
import DocumentEntries from '@/components/Document/DocumentEntries/DocumentEntries'
import Hook from '@/components/Hook/Hook'
import settings from '@/utils/settings'
import { useDocument } from '@/composables/useDocument'
import { whenIsRoute } from '@/composables/whenIsRoute'
import { useUrlPageFromWithStore } from '@/composables/useUrlPageFromWithStore'
import { replaceUrlParam } from '@/composables/replaceUrlParam'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useSearchBreadcrumb } from '@/composables/useSearchBreadcrumb'
import { useViews } from '@/composables/useViews'
import { LAYOUTS } from '@/enums/layouts'
import { useAppStore, useSearchStore } from '@/store/modules'

const { toggleSettings, toggleFilters, toggleSidebar, isFiltersClosed } = useViews()
const { provideDocumentViewFloatingId, documentRoute } = useDocument()
const { refreshRoute, refreshSearchFromRoute, resetSearchResponse, watchIndices, watchFilters } = useSearchFilter()
const { count: searchBreadcrumbCounter, anyFilters } = useSearchBreadcrumb()

const entriesRef = useTemplateRef('entries')
const appStore = useAppStore()
const searchStore = useSearchStore()
const route = useRoute()

// The size query parameter is replaced by the perPage query parameter
replaceUrlParam({ from: 'size', to: 'perPage' })
// This function replaces a unique sort query parameter with a pair of sort and order query parameters
// based on the search properties. This way we can ensure retro-compatibility with
// the former sort query parameter which used to contain both the sort field and the order.
replaceUrlParam({
  from: 'sort',
  to: (name) => {
    const { property: sort = null, desc } = find(settings.legacySearchSortFields, { name }) ?? {}
    const order = desc ? 'desc' : 'asc'
    // Only redirect if the sort field is found
    return sort ? { sort, order } : null
  }
})

const entries = computed(() => searchStore.response.hits)
const properties = computed(() => appStore.getSettings('search', 'properties'))
const layout = computed(() => appStore.getSettings('search', 'layout'))
const isLoading = computed(() => !searchStore.isReady)
const isListLayout = computed(() => toValue(layout) === LAYOUTS.LIST)
const isEmpty = computed(() => route.name === 'search' && !isLoading.value && !total.value && !anyFilters.value)

const selection = ref([])
const toggleSearchBreadcrumb = ref(false)
const selectMode = ref(false)

// The modal is displayed only if there is enough space to display the document view.
// In this function, it's important we refresh the route before assigning the value to the
// enoughtFloatingSpace ref in order to avoid a brief flicker of the document view in the modal.
const toggleDocumentModal = async (enoughSpace) => {
  if (documentRoute.value && (!enoughSpace || !isListLayout.value || route.query.modal)) {
    await refreshRoute()
  }

  enoughtFloatingSpace.value = enoughSpace
}

// The "floating space" is the right side of the list layout, which display the document view.
const enoughtFloatingSpace = ref(false)
// In list view, if the floating space is not enough, the document view is displayed in a modal.
// User can also force the document view to be displayed in a modal by adding the "modal" query parameter.
const renderDocumentInModal = computed(() => !enoughtFloatingSpace.value || !isListLayout.value || route.query.modal)

const total = computed(() => parseInt(searchStore.response.total))
const perPage = computed(() => parseInt(appStore.getSettings('search', 'perPage')))
const page = useUrlPageFromWithStore({
  perPage: toValue(perPage),
  // The "from" query parameter is updated to reflect the current state
  // which while force the route to redirect to "search".
  to: 'search',
  // The value of the "from" query parameter is directly taken from the store
  get: () => searchStore.from,
  // The value of the "from" query parameter is mutated with the store
  set: (value) => (searchStore.from = value)
})

const documentViewFloatingId = provideDocumentViewFloatingId()

const resetEntriesListSize = () => toValue(entriesRef)?.resetListSize?.()
// The user might have resized the entries list or the document view. When the search is updated
// or a new document is loaded, we need to reset original size to ensure that they are displayed.
watch(() => route.query, whenIsRoute('search', resetEntriesListSize), { deep: true, immediate: true })
// Reset the search response when the component is mounted to ensure that the displayed search result
// are always up-to-date with the current route query. This is important because the search response
// can still be populated with the previous search results.
resetSearchResponse()
// Refresh search when route query changes. Among all the watcher of this view, it probably
// the most important one. It will trigger the search API call when the route query changes
// which mean that only route change can trigger a search.
watch(() => JSON.stringify(route.query), whenIsRoute('search', refreshSearchFromRoute), { immediate: true })
// Refresh route query when a filter changes (either their values or if they are excluded)
watchFilters(refreshRoute)
// Refresh route query when projects change
watchIndices(refreshRoute)
</script>

<template>
  <page-container class="search" fluid>
    <hook name="search:before" />
    <div class="search__main d-flex">
      <slot name="filters" />
      <div class="search__main__content flex-grow-1 flex-truncate">
        <search-toolbar
          v-model:toggleSidebar="toggleSidebar"
          v-model:toggleFilters="toggleFilters"
          v-model:toggleSearchBreadcrumb="toggleSearchBreadcrumb"
          v-model:toggleSettings="toggleSettings"
          v-model:isFiltersClosed="isFiltersClosed"
          :search-breadcrumb-counter="searchBreadcrumbCounter"
        />
        <search-breadcrumb v-model:visible="toggleSearchBreadcrumb" />
        <div class="search__main__results">
          <empty-state
            v-if="isEmpty"
            :image="searchEmpty"
            :image-dark="searchEmptyDark"
            :label="$t('search.emptyStateLabel')"
            :action-label="$t('search.emptyStateAction')"
            :action-to="{ name: 'task.documents.new', query: { project: searchStore.index } }"
          />
          <document-entries
            v-else
            ref="entries"
            v-model:page="page"
            v-model:select-mode="selectMode"
            :entries="entries"
            :selection="selection"
            :properties="properties"
            :layout="layout"
            :total="total"
            :per-page="perPage"
            :loading="isLoading"
            @update:enoughtSpace="toggleDocumentModal"
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
            <router-view v-slot="{ Component }">
              <document-modal v-if="renderDocumentInModal" :model-value="!!Component" @hide="refreshRoute">
                <search-carousel />
                <component :is="Component" />
              </document-modal>
              <component :is="Component" v-else>
                <template #nav>
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
