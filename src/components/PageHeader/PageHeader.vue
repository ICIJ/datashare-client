<script setup>
import { computed } from 'vue'

import { breakpointSizeValidator, SIZE } from '@/enums/sizes'
import PageHeaderNav from '@/components/PageHeader/PageHeaderNav'
import PageHeaderToolbar from '@/components/PageHeader/PageHeaderToolbar'

const searchQuery = defineModel('searchQuery', { type: String })
const page = defineModel('page', { type: Number, default: 1 })

const props = defineProps({
  noBreadcrumb: {
    type: Boolean
  },
  noToggleSidebar: {
    type: Boolean
  },
  noToggleSettings: {
    type: Boolean
  },
  addLabel: {
    type: String
  },
  addTo: {
    type: Object
  },
  sidebarTogglerBreakpoint: {
    type: String,
    default: SIZE.MD,
    validator: breakpointSizeValidator
  },
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
    type: [Number, String],
    default: 25
  },
  totalRows: {
    type: Number,
    default: 0
  },
  activeFilters: {
    type: Boolean
  },
  sticky: {
    type: Boolean,
    default: false
  }
})

const hasToolbar = computed(() => {
  return props.filterable || props.searchable || props.paginable
})
</script>

<template>
  <page-header-nav
    :no-breadcrumb="noBreadcrumb"
    :no-toggle-sidebar="noToggleSidebar"
    :no-toggle-settings="noToggleSettings"
    :add-to="addTo"
    :add-label="addLabel"
    :sidebar-toggler-breakpoint="sidebarTogglerBreakpoint"
  >
    <template #toggle-sidebar>
      <slot name="toggle-sidebar" />
    </template>
    <template #breadcrumb>
      <slot name="breadcrumb" />
    </template>
    <template #actions>
      <slot name="actions" />
    </template>
  </page-header-nav>
  <page-header-toolbar
    v-if="hasToolbar"
    v-model:search-query="searchQuery"
    v-model:page="page"
    :filterable="filterable"
    :searchable="searchable"
    :search-placeholder="searchPlaceholder"
    :paginable="paginable"
    :per-page="perPage"
    :total-rows="totalRows"
    :active-filters="activeFilters"
    :sticky="sticky"
  >
    <template #start>
      <slot name="toolbar-start" />
    </template>
    <template #end>
      <slot name="toolbar-end" />
    </template>
    <template #toggle-filters>
      <slot name="toggle-filters>" />
    </template>
    <template #pagination="bindings">
      <slot name="pagination" v-bind="bindings" />
    </template>
    <template #search>
      <slot name="search" />
    </template>
  </page-header-toolbar>
</template>
