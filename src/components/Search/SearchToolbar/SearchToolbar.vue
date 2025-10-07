<script setup>
import { computed, useTemplateRef, toRef } from 'vue'

import ButtonToggleFilters from '@/components/Button/ButtonToggleFilters'
import ButtonToggleSearchBreadcrumb from '@/components/Button/ButtonToggleSearchBreadcrumb'
import ButtonToggleSettings from '@/components/Button/ButtonToggleSettings'
import ButtonToggleSidebar from '@/components/Button/ButtonToggleSidebar'
import SearchBar from '@/components/Search/SearchBar/SearchBar'
import { useCompact } from '@/composables/useCompact'

const toggleSidebar = defineModel('toggleSidebar', { type: Boolean })
const toggleFilters = defineModel('toggleFilters', { type: Boolean })
const toggleSearchBreadcrumb = defineModel('toggleSearchBreadcrumb', { type: Boolean })
const toggleSettings = defineModel('toggleSettings', { type: Boolean })
const isFiltersClosed = defineModel('isFiltersClosed', { type: Boolean })

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
        class="search__main__search-bar flex-grow-1"
      />
      <button-toggle-settings
        v-model:active="toggleSettings"
        class="search__main__toggle-settings"
      />
    </div>
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
