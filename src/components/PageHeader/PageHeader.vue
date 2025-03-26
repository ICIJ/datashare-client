<script setup>
import { breakpointSizeValidator, SIZE } from '@/enums/sizes'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeaderNav from '@/components/PageHeader/PageHeaderNav'
import PageHeaderToolbar from '@/components/PageHeader/PageHeaderToolbar'

defineProps({
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
  }
})
</script>

<template>
  <page-container deck fluid>
    <page-header-nav
      :no-breadcrumb="noBreadcrumb"
      :no-toggle-sidebar="noToggleSidebar"
      :no-toggle-settings="noToggleSettings"
      :to-add="toAdd"
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
      :filterable="filterable"
      :searchable="searchable"
      :search-placeholder="searchPlaceholder"
      :paginable="paginable"
      :per-page="perPage"
      :total-rows="totalRows"
      :active-filters="activeFilters"
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
      <template #pagination>
        <slot name="pagination" />
      </template>
      <template #search>
        <slot name="search" />
      </template>
    </page-header-toolbar>
  </page-container>
</template>
