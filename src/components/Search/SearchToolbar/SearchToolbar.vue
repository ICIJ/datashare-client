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
  }
})

const elementRef = useTemplateRef('element')
const threshold = toRef(props, 'compactThreshold')
const { compact } = useCompact(elementRef, { threshold })
const classList = computed(() => ({ 'search-toolbar--compact': compact.value }))
</script>

<template>
  <div
    ref="element"
    class="search-toolbar d-flex gap-3 py-3 align-items-start"
    :class="classList"
  >
    <button-toggle-sidebar
      v-if="!toggleSidebar && !compact"
      v-model:active="toggleSidebar"
    />
    <div class="search-toolbar__filters d-flex gap-3">
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
    </div>
    <div class="search-toolbar__form d-flex gap-3 flex-grow-1">
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

  &__filters {
    order: 0;
  }
  &__form {
    order: 0;
  }

  &--compact {
    flex-wrap: wrap;

    .search-toolbar__filters {
      order: 1;
      width: 100%;
      justify-content: space-between;
    }
  }
}
</style>
