<script setup>
import FormActions from '@/components/FormActions/FormActions'
import IconButton from '@/components/IconButton'

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
    <icon-button v-if="!hideClearFilters" icon-left="eraser">
      {{ $t('searchBreadcrumbFooter.clearFilters') }}
    </icon-button>
    <icon-button v-if="!hideClearQueries" icon-left="x-circle">
      {{ $t('searchBreadcrumbFooter.clearQueries') }}
    </icon-button>
    <icon-button v-if="!hideClearFiltersAndQueries" icon-left="arrow-counter-clockwise">
      {{ $t('searchBreadcrumbFooter.clearFiltersAndQueries') }}
    </icon-button>
    <icon-button v-if="!hideSaveSearch" variant="outline-dark" icon-left="floppy-disk">
      {{ $t('searchBreadcrumbFooter.saveSearch') }}
    </icon-button>
    <icon-button v-if="!hideCreateAlert" variant="outline-dark" icon-left="siren">
      {{ $t('searchBreadcrumbFooter.createAlert') }}
    </icon-button>
  </form-actions>
</template>
