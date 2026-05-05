<template>
  <form-actions end>
    <button-icon
      variant="outline-secondary"
      @click="$emit('cancel')"
    >
      {{ t('searchAdvancedModal.cancel') }}
    </button-icon>
    <button-icon
      variant="outline-secondary"
      @click="$emit('reset')"
    >
      {{ t('searchAdvancedModal.reset') }}
    </button-icon>
    <button-icon
      variant="action"
      :disabled="searchDisabled"
      @click="$emit('search')"
    >
      {{ t('searchAdvancedModal.search') }}
    </button-icon>
  </form-actions>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import FormActions from '@/components/Form/FormActions/FormActions.vue'

defineProps({
  searchDisabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['cancel', 'reset', 'search'])

const { t } = useI18n()
</script>
