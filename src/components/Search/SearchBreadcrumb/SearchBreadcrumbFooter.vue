<script setup>
import FormActions from '@/components/Form/FormActions/FormActions'
import ButtonIcon from '@/components/Button/ButtonIcon'

defineProps({
  hideClearFilters: {
    type: Boolean
  },
  hideClearQuery: {
    type: Boolean
  },
  hideClearFiltersAndQuery: {
    type: Boolean
  },
  hideSaveSearch: {
    type: Boolean
  },
  hideCreateAlert: {
    type: Boolean
  }
})

const emit = defineEmits(['clear:filters', 'clear:query', 'clear:all', 'save:search', 'create:alert'])
</script>

<template>
  <form-actions class="search-breadcrumb-footer" variant="link" end>
    <button-icon v-if="!hideClearFilters" icon-left="eraser" @click="emit('clear:filters')">
      {{ $t('searchBreadcrumbFooter.clearFilters') }}
    </button-icon>
    <button-icon v-if="!hideClearQuery" icon-left="x-circle" @click="emit('clear:query')">
      {{ $t('searchBreadcrumbFooter.clearQuery') }}
    </button-icon>
    <button-icon v-if="!hideClearFiltersAndQuery" icon-left="arrow-counter-clockwise" @click="emit('clear:all')">
      {{ $t('searchBreadcrumbFooter.clearFiltersAndQuery') }}
    </button-icon>
    <button-icon v-if="!hideSaveSearch" variant="outline-dark" icon-left="floppy-disk" @click="emit('save:search')">
      {{ $t('searchBreadcrumbFooter.saveSearch') }}
    </button-icon>
    <button-icon v-if="!hideCreateAlert" variant="outline-dark" icon-left="siren" @click="emit('create:alert')">
      {{ $t('searchBreadcrumbFooter.createAlert') }}
    </button-icon>
  </form-actions>
</template>
