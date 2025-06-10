<script setup>
import { useI18n } from 'vue-i18n'

import FormActions from '@/components/Form/FormActions/FormActions'
import ButtonIcon from '@/components/Button/ButtonIcon'

defineProps({
  disabledClearFilters: {
    type: Boolean
  },
  disabledClearQuery: {
    type: Boolean
  },
  disabledClearFiltersAndQuery: {
    type: Boolean
  },
  disabledSaveSearch: {
    type: Boolean
  },
  disabledCreateAlert: {
    type: Boolean
  }
})
const { t } = useI18n()
const emit = defineEmits(['clear:filters', 'clear:query', 'clear:all', 'save:search', 'create:alert'])
</script>

<template>
  <form-actions class="search-breadcrumb-form-footer" variant="link" end>
    <button-icon :disabled="disabledClearFilters" icon-left="eraser" @click="emit('clear:filters')">
      {{ t('searchBreadcrumbFormFooter.clearFilters') }}
    </button-icon>
    <button-icon :disabled="disabledClearQuery" icon-left="x-circle" @click="emit('clear:query')">
      {{ t('searchBreadcrumbFormFooter.clearQuery') }}
    </button-icon>
    <button-icon
      :disabled="disabledClearFiltersAndQuery"
      icon-left="arrow-counter-clockwise"
      @click="emit('clear:all')"
    >
      {{ t('searchBreadcrumbFormFooter.clearFiltersAndQuery') }}
    </button-icon>
    <button-icon
      :disabled="disabledSaveSearch"
      variant="outline-dark"
      icon-left="floppy-disk-back"
      @click="emit('save:search')"
    >
      {{ t('searchBreadcrumbFormFooter.saveSearch') }}
    </button-icon>
    <button-icon
      v-if="false /* Disabled until the feature is implemented */"
      :disabled="!disabledCreateAlert"
      variant="outline-dark"
      icon-left="siren"
      @click="emit('create:alert')"
    >
      {{ t('searchBreadcrumbFormFooter.createAlert') }}
    </button-icon>
  </form-actions>
</template>
