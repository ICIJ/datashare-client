<script setup>
import { computed, ref, watch, toValue, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import searchEmpty from '@/assets/images/illustrations/search-empty-light.svg'
import searchEmptyDark from '@/assets/images/illustrations/search-empty-dark.svg'
import searchError from '@/assets/images/illustrations/app-modal-alert-naming-light.svg'
import searchErrorDark from '@/assets/images/illustrations/app-modal-alert-naming-dark.svg'
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
import { useDocument } from '@/composables/useDocument'
import { whenIsRoute } from '@/composables/whenIsRoute'
import { useUrlPageFromWithStore } from '@/composables/useUrlPageFromWithStore'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useSearchBreadcrumb } from '@/composables/useSearchBreadcrumb'
import { useSearchNav } from '@/composables/useSearchNav'
import { useViews } from '@/composables/useViews'
import { LAYOUTS } from '@/enums/layouts'
import { MODE_NAME } from '@/mode'
import { useAppStore, useSearchStore } from '@/store/modules'

const { toggleSettings, toggleFilters, toggleSidebar, isFiltersClosed } = useViews()
const { provideDocumentViewFloatingId, documentRoute } = useDocument()
const {
  refreshRoute,
  refreshRouteFromStart,
  refreshSearchFromRoute,
  refreshSearchFromRouteStart,
  watchIndices,
  watchFilters,
  onAfterRouteQueryUpdate,
  onAfterRouteQueryFromUpdate
} = useSearchFilter()
const { count: searchBreadcrumbCounter, anyFilters } = useSearchBreadcrumb()
const { hasEntries, hasCarousel } = useSearchNav()

const { t } = useI18n()
const entriesRef = useTemplateRef('entries')
const appStore = useAppStore()
const searchStore = useSearchStore()
const route = useRoute()

const entries = computed(() => searchStore.response.hits)
const properties = computed(() => appStore.getSettings('search', 'properties'))
const layout = computed(() => appStore.getSettings('search', 'layout'))
const isListLayout = computed(() => toValue(layout) === LAYOUTS.LIST)
const isLoading = computed(() => !searchStore.isReady)
const isSearchRoute = computed(() => route.name === 'search')
const isErroed = computed(() => !isLoading.value && !!searchStore.error)
const isEmpty = computed(() => isSearchRoute.value && !isLoading.value && !total.value && !anyFilters.value)

const selection = ref([])
const toggleSearchBreadcrumb = ref(false)
const selectMode = ref(false)

// The modal is displayed only if there is enough space to display the document view.
// In this function, it's important we refresh the route before assigning the value to the
// enoughFloatingSpace ref in order to avoid a brief flicker of the document view in the modal.
const toggleDocumentModal = async (enoughSpace) => {
  if (documentRoute.value && hasEntries.value && (!enoughSpace || !isListLayout.value || route.query.modal)) {
    await refreshRoute()
  }

  enoughFloatingSpace.value = enoughSpace
}

// The "floating space" is the right side of the list layout, which display the document view.
const enoughFloatingSpace = ref(false)
// In list view, if the floating space is not enough, the document view is displayed in a modal.
// User can also force the document view to be displayed in a modal by adding the "modal" query parameter.
const renderDocumentInModal = computed(() => !enoughFloatingSpace.value || !isListLayout.value || route.query.modal)

const total = computed(() => parseInt(searchStore.response.total))
const perPage = computed(() => parseInt(appStore.getSettings('search', 'perPage')))
const page = useUrlPageFromWithStore({
  perPage: toValue(perPage),
  // The "to" parameter is used to ensure that when the page is changed, the route query is updated
  // to be on a given route. Here we use the store's `toRouteQuery` to ensure that the route query is updated
  // with the current search parameters. This allows us to navigate from child routes where the query parameters
  // are not the same as the search route.
  to: () => {
    const name = 'search'
    const { toRouteQuery: query } = searchStore
    return { name, query }
  },
  // The value of the "from" query parameter is directly taken from the store
  get: () => searchStore.from,
  // The value of the "from" query parameter is mutated with the store
  set: value => (searchStore.from = value)
})

const documentViewFloatingId = provideDocumentViewFloatingId()

const resetEntriesListSize = () => toValue(entriesRef)?.resetListSize?.()
// The user might have resized the entries list or the document view. When the search is updated
// or a new document is loaded, we need to reset original size to ensure that they are displayed.
watch(() => route.query, whenIsRoute('search', resetEntriesListSize), { deep: true, immediate: true })

// Refresh route query when a filter changes (either their values or if they are excluded)
watchFilters(refreshRouteFromStart)
// Refresh route query when projects change
watchIndices(refreshRouteFromStart)
// Refresh search when route query changes. Among all the "watcher" (it's a post-navigation filter)
// of this view, it probably the most important one. It will trigger the search API call
// when the route query changes which mean that **only route changes** can trigger a search. This
// particular one will also change the "from" query parameter to the first page.
onAfterRouteQueryUpdate(refreshSearchFromRouteStart)
// Refresh search when route query "from" parameter changes. This is different from the previous watcher
// because it will only trigger the search API call when the "from" parameter changes and therefore, will not
// change the "from" query parameter to the first page. If the current route is the search route, it
// will also trigger the search API call immediately.
onAfterRouteQueryFromUpdate(refreshSearchFromRoute, { immediate: route.name === 'search' })
</script>

<template>
  <page-container
    class="search"
    fluid
  >
    <hook name="search:before" />
    <div class="search__main d-flex gap-3">
      <slot name="filters" />
      <div class="search__main__content flex-grow-1 flex-truncate">
        <search-toolbar
          v-model:toggle-sidebar="toggleSidebar"
          v-model:toggle-filters="toggleFilters"
          v-model:toggle-search-breadcrumb="toggleSearchBreadcrumb"
          v-model:toggle-settings="toggleSettings"
          v-model:is-filters-closed="isFiltersClosed"
          :search-breadcrumb-counter="searchBreadcrumbCounter"
        />
        <search-breadcrumb v-model:visible="toggleSearchBreadcrumb" />
        <div class="search__main__results">
          <empty-state
            v-if="isErroed"
            :image="searchError"
            :image-dark="searchErrorDark"
            :label="t('search.errorStateLabel')"
          />
          <empty-state
            v-else-if="isEmpty"
            :image="searchEmpty"
            :image-dark="searchEmptyDark"
            :label="t('search.emptyStateLabel')"
            :action-label="t('search.emptyStateAction')"
            :action-to="{ name: 'task.documents.new', query: { project: searchStore.index } }"
            :action-modes="[MODE_NAME.LOCAL, MODE_NAME.EMBEDDED]"
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
            @update:enough-space="toggleDocumentModal"
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
              <div :id="documentViewFloatingId" />
            </template>
            <router-view v-slot="{ Component }">
              <template v-if="!isSearchRoute">
                <document-modal
                  v-if="renderDocumentInModal"
                  :model-value="!!Component"
                  @hide="refreshRoute"
                >
                  <search-carousel v-if="hasCarousel" />
                  <component :is="Component" />
                </document-modal>
                <component
                  :is="Component"
                  v-else
                >
                  <template #nav>
                    <search-nav />
                  </template>
                </component>
              </template>
            </router-view>
          </document-entries>
        </div>
      </div>
    </div>
    <hook name="search:after" />
  </page-container>
</template>
