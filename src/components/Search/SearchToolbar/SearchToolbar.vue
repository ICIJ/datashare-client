<script setup>
import { computed, defineAsyncComponent, ref, useTemplateRef, toRef, watchEffect } from 'vue'

import ButtonToggleAdvancedSearch from '@/components/Button/ButtonToggleAdvancedSearch'
import ButtonToggleFilters from '@/components/Button/ButtonToggleFilters'
import ButtonToggleSearchBreadcrumb from '@/components/Button/ButtonToggleSearchBreadcrumb'
import ButtonToggleSettings from '@/components/Button/ButtonToggleSettings'
import ButtonToggleSidebar from '@/components/Button/ButtonToggleSidebar'
import SearchBar from '@/components/Search/SearchBar/SearchBar'
import { useCompact } from '@/composables/useCompact'
import { useSearchStore } from '@/store/modules/search'

const SearchAdvancedModal = defineAsyncComponent(() => import('@/components/Search/SearchAdvancedModal/SearchAdvancedModal'))

const toggleSidebar = defineModel('toggleSidebar', { type: Boolean })
const toggleFilters = defineModel('toggleFilters', { type: Boolean })
const toggleSearchBreadcrumb = defineModel('toggleSearchBreadcrumb', { type: Boolean })
const toggleSettings = defineModel('toggleSettings', { type: Boolean })
const isFiltersClosed = defineModel('isFiltersClosed', { type: Boolean })

const showAdvancedSearch = ref(false)
const searchStore = useSearchStore()

// Defer mounting (and thus loading) the advanced search modal's chunk until
// it's opened for the first time, then keep it mounted so in-progress form
// input isn't lost if the user closes without submitting.
const hasOpenedAdvancedSearch = ref(false)
watchEffect(() => {
  if (showAdvancedSearch.value) {
    hasOpenedAdvancedSearch.value = true
  }
})

// Forwarded to the parent view rather than run here: an advanced search must
// go through the router like every other search, and only the view owns the
// navigation. Running it from the store here would leave the URL behind, and
// the next route round-trip (pagination, sort, perPage) would then overwrite
// the store with the URL's stale query.
const emit = defineEmits(['advancedSearch'])

const props = defineProps({
  searchBreadcrumbCounter: {
    type: Number
  },
  compactThreshold: {
    type: Number,
    default: 770
  },
  noSearchFilters: {
    type: Boolean,
    default: false
  }
})

const elementRef = useTemplateRef('element')
const threshold = toRef(props, 'compactThreshold')
const { compact } = useCompact(elementRef, { threshold })
const classList = computed(() => {
  return {
    'search-toolbar--compact': compact.value,
    'search-toolbar--no-search-filters': props.noSearchFilters
  }
})
</script>

<template>
  <div
    ref="element"
    class="search-toolbar"
    :class="classList"
  >
    <button-toggle-sidebar
      v-if="!toggleSidebar && !compact"
      v-model:active="toggleSidebar"
    />
    <div class="search-toolbar__filters">
      <button-toggle-filters
        v-if="isFiltersClosed"
        v-model:active="toggleFilters"
        class="search-toolbar__filters__toggle-filters"
      />
      <button-toggle-search-breadcrumb
        v-model:active="toggleSearchBreadcrumb"
        :counter="searchBreadcrumbCounter"
        class="search-toolbar__filters__toggle-search-breadcrumb"
      />
    </div>
    <div class="search-toolbar__form">
      <button-toggle-sidebar
        v-if="!toggleSidebar && compact"
        v-model:active="toggleSidebar"
      />
      <search-bar
        :compact="compact"
        :show-submit="!compact"
        class="search__main__search-bar flex-grow-1"
      />
      <button-toggle-advanced-search
        v-model:active="showAdvancedSearch"
        :reduced="compact"
        class="search-toolbar__toggle-advanced-search"
      />
      <button-toggle-settings
        v-model:active="toggleSettings"
        class="search__main__toggle-settings"
      />
    </div>
    <search-advanced-modal
      v-if="hasOpenedAdvancedSearch"
      v-model="showAdvancedSearch"
      :initial-query="searchStore.q"
      :initial-field="searchStore.field"
      @search="emit('advancedSearch', $event)"
    />
  </div>
</template>

<style scoped lang="scss">
.search-toolbar {
  flex-wrap: nowrap;
  padding-top: $spacer;
  display: flex;
  gap: $spacer;
  align-items: flex-start;
  position: relative;
  z-index: 100;

  &__filters {
    order: 0;
    display: flex;
    gap: $spacer;
    flex-shrink: 0;
  }

  &__form {
    order: 0;
    display: flex;
    gap: $spacer;
    flex-grow: 1;
  }

  &--compact {
    flex-wrap: wrap;

    .search-toolbar__filters {
      order: 1;
      width: 100%;
      justify-content: space-between;
    }
  }

  &--no-search-filters {
    padding-bottom: 0;

    .search-toolbar__filters {
      display: none;
    }
  }
}
</style>
