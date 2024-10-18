<script setup>
import { computed } from 'vue'
import { TinyPagination } from '@icij/murmur-next'

import ButtonAdd from '@/components/Button/ButtonAdd'
import ButtonToggleFilters from '@/components/Button/ButtonToggleFilters'
import ButtonToggleSidebar from '@/components/Button/ButtonToggleSidebar'
import ButtonToggleSettings from '@/components/Button/ButtonToggleSettings'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import NavigationBreadcrumb from '@/components/NavigationBreadcrumb/NavigationBreadcrumb'
import PageContainer from '@/components/PageContainer/PageContainer'
import { useViews } from '@/composables/views'
import { useBreakpoints } from '@/composables/breakpoints'
import { breakpointSizeValidator, SIZE } from '@/enums/sizes'

const searchQuery = defineModel('searchQuery', { type: String })
const page = defineModel('page', { type: Number, default: 1 })

const emit = defineEmits(['toggleFilters'])

const { breakpointDown } = useBreakpoints()
const { toggleSettings, toggleSidebar } = useViews()

const props = defineProps({
  filterable: {
    type: Boolean
  },
  searchable: {
    type: Boolean
  },
  searchPlaceholder: {
    type: String,
    default: null
  },
  paginable: {
    type: Boolean
  },
  perPage: {
    type: Number,
    default: 25
  },
  totalRows: {
    type: Number,
    default: 0
  },
  activeFilters: {
    type: Boolean
  },
  pageRow: {
    type: Boolean
  },
  noBreadcrumb: {
    type: Boolean
  },
  noToggleSidebar: {
    type: Boolean
  },
  noToggleSettings: {
    type: Boolean
  },
  toAdd: {
    type: Object
  },
  sidebarTogglerBreakpoint: {
    type: String,
    default: SIZE.MD,
    validator: breakpointSizeValidator
  }
})

const showToggleSidebar = computed(() => {
  return !props.noToggleSidebar && (!toggleSidebar.value || breakpointDown.value[props.sidebarTogglerBreakpoint])
})
</script>

<template>
  <page-container fluid class="page-header d-flex flex-column gap-4 py-3">
    <div class="d-flex justify-content-between gap-4">
      <slot name="toggle-sidebar">
        <button-toggle-sidebar v-if="showToggleSidebar" v-model:active="toggleSidebar" class="flex-shrink-0" />
      </slot>
      <navigation-breadcrumb v-if="!noBreadcrumb" class="page-header__breadcrumb me-auto">
        <slot name="breadcrumb" />
      </navigation-breadcrumb>
      <div class="page-header__actions d-flex gap-4 ms-4">
        <slot name="action">
          <button-add v-if="toAdd" :to="toAdd" />
          <button-toggle-settings v-if="!noToggleSettings" v-model:active="toggleSettings" />
        </slot>
      </div>
    </div>
    <div v-if="filterable || paginable || searchable" class="d-flex justify-content-between flex-wrap gap-3">
      <slot name="toggle-filters">
        <button-toggle-filters
          v-if="filterable"
          class="page-header__toggle-filters"
          :active="activeFilters"
          @toggle="emit('toggleFilters', $event)"
        />
      </slot>
      <slot name="pagination">
        <div v-if="paginable" class="page-header__pagination">
          <tiny-pagination v-model="page" :row="pageRow" :total-rows="totalRows" :per-page="perPage" />
        </div>
      </slot>
      <slot name="search">
        <form-control-search
          v-if="searchable"
          v-model="searchQuery"
          autofocus
          :placeholder="searchPlaceholder ?? $t('pageHeader.searchPlaceholder')"
          class="page-header__search ms-auto"
        />
      </slot>
    </div>
  </page-container>
</template>

<style lang="scss" scoped>
.page-header {
  @include media-breakpoint-down(md) {
    &__pagination {
      order: 1;
      width: 100%;
      flex-grow: 1;
    }

    &__search {
      flex-grow: 1;
    }
  }
}
</style>
