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
      {{ $t('searchBreadcrumbFormFooter.clearFilters') }}
    </button-icon>
    <button-icon v-if="!hideClearQuery" icon-left="x-circle" @click="emit('clear:query')">
      {{ $t('searchBreadcrumbFormFooter.clearQuery') }}
    </button-icon>
    <button-icon v-if="!hideClearFiltersAndQuery" icon-left="arrow-counter-clockwise" @click="emit('clear:all')">
      {{ $t('searchBreadcrumbFormFooter.clearFiltersAndQuery') }}
    </button-icon>
    <button-icon v-if="!hideSaveSearch" variant="outline-dark" icon-left="floppy-disk" @click="emit('save:search')">
      {{ $t('searchBreadcrumbFormFooter.saveSearch') }}
    </button-icon>
    <button-icon v-if="!hideCreateAlert" variant="outline-dark" icon-left="siren" @click="emit('create:alert')">
      {{ $t('searchBreadcrumbFormFooter.createAlert') }}
    </button-icon>
  </form-actions>
</template>
