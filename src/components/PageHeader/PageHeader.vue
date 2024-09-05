<script setup>
import { computed } from 'vue'
import { TinyPagination } from '@icij/murmur-next'

import ButtonAdd from '@/components/Button/ButtonAdd'
import ButtonToggleFilters from '@/components/Button/ButtonToggleFilters'
import ButtonToggleSidebar from '@/components/Button/ButtonToggleSidebar'
import ButtonToggleSettings from '@/components/Button/ButtonToggleSettings'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import NavigationBreadcrumb from '@/components/NavigationBreadcrumb/NavigationBreadcrumb'
import { useCore } from '@/composables/core'
import { useBreakpoints } from '@/composables/breakpoints'
import { breakpointSizeValidator, SIZE } from '@/enums/sizes'

const searchQuery = defineModel('searchQuery', { type: String })
const page = defineModel('page', { type: Number, default: 1 })

const emit = defineEmits(['toggleFilters', 'toggleSettings', 'toggleAdd'])

const { core } = useCore()
const { breakpointDown } = useBreakpoints()

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
  activeSettings: {
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

const closedSidebar = computed({
  get: () => core?.store.state.app.sidebar.closed,
  set: (value) => core?.store.dispatch('app/toggleSidebarClosed', value)
})

const showSidebarToggle = computed(() => {
  return !props.noToggleSidebar && (closedSidebar.value || breakpointDown.value[props.sidebarTogglerBreakpoint])
})
</script>

<template>
  <div class="page-header d-flex flex-column gap-4 container-fluid py-3">
    <div class="d-flex justify-content-between gap-4">
      <slot name="toggle-sidebar">
        <button-toggle-sidebar v-if="showSidebarToggle" v-model:active="closedSidebar" class="flex-shrink-0" />
      </slot>
      <navigation-breadcrumb v-if="!noBreadcrumb" class="page-header__breadcrumb me-auto">
        <slot name="breadcrumb" />
      </navigation-breadcrumb>
      <div class="page-header__actions d-flex gap-4 ms-4">
        <slot name="action">
          <button-add v-if="toAdd" :to="toAdd" @click="emit('toggleAdd')" />
          <button-toggle-settings
            v-if="!noToggleSettings"
            :active="activeSettings"
            @toggle="emit('toggleSettings', $event)"
          />
        </slot>
      </div>
    </div>
    <div class="d-flex justify-content-between flex-wrap gap-3">
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
          :placeholder="searchPlaceholder ?? $t('pageHeader.searchPlaceholder')"
          class="page-header__search"
        />
      </slot>
    </div>
  </div>
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
