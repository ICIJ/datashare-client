<script setup>
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
  <div class="search-breadcrumb-footer text-end d-flex justify-content-end flex-wrap">
    <icon-button v-if="!hideClearFilters" variant="link" icon-left="eraser" class="ms-3">
      {{ $t('searchBreadcrumbFooter.clearFilters') }}
    </icon-button>
    <icon-button v-if="!hideClearQueries" variant="link" icon-left="x-circle" class="ms-3">
      {{ $t('searchBreadcrumbFooter.clearQueries') }}
    </icon-button>
    <icon-button v-if="!hideClearFiltersAndQueries" variant="link" icon-left="arrow-counter-clockwise" class="ms-3">
      {{ $t('searchBreadcrumbFooter.clearFiltersAndQueries') }}
    </icon-button>
    <div class="d-block d-md-inline-block">
      <icon-button v-if="!hideSaveSearch" variant="outline-dark" icon-left="floppy-disk" class="ms-3">
        {{ $t('searchBreadcrumbFooter.saveSearch') }}
      </icon-button>
      <icon-button v-if="!hideCreateAlert" variant="outline-dark" icon-left="siren" class="ms-3">
        {{ $t('searchBreadcrumbFooter.createAlert') }}
      </icon-button>
    </div>
  </div>
</template>
