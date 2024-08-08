<script setup>
import FormActions from '@/components/Form/FormActions/FormActions'
import ButtonIcon from '@/components/Button/ButtonIcon'

defineProps({
  hideClearFilters: {
    type: Boolean
  },
  hideClearQueries: {
    type: Boolean
  },
  hideClearFiltersAndQueries: {
    type: Boolean
  },
  hideSaveSearch: {
    type: Boolean
  },
  hideCreateAlert: {
    type: Boolean
  }
})
</script>

<template>
  <form-actions class="search-breadcrumb-footer" variant="link">
    <button-icon v-if="!hideClearFilters" icon-left="eraser">
      {{ $t('searchBreadcrumbFooter.clearFilters') }}
    </button-icon>
    <button-icon v-if="!hideClearQueries" icon-left="x-circle">
      {{ $t('searchBreadcrumbFooter.clearQueries') }}
    </button-icon>
    <button-icon v-if="!hideClearFiltersAndQueries" icon-left="arrow-counter-clockwise">
      {{ $t('searchBreadcrumbFooter.clearFiltersAndQueries') }}
    </button-icon>
    <button-icon v-if="!hideSaveSearch" variant="outline-dark" icon-left="floppy-disk">
      {{ $t('searchBreadcrumbFooter.saveSearch') }}
    </button-icon>
    <button-icon v-if="!hideCreateAlert" variant="outline-dark" icon-left="siren">
      {{ $t('searchBreadcrumbFooter.createAlert') }}
    </button-icon>
  </form-actions>
</template>
