<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import FormActions from '@/components/Form/FormActions/FormActions'

defineProps({
  cancelDisabled: {
    type: Boolean
  },
  cancelTitle: {
    type: String
  },
  cancelVariant: {
    type: String
  },
  okDisabled: {
    type: Boolean
  },
  okOnly: {
    type: Boolean
  },
  okTitle: {
    type: String
  },
  okVariant: {
    type: String,
    default: 'action'
  }
})
const { t } = useI18n()
</script>

<template>
  <form-actions
    class="app-modal-footer"
    end
  >
    <slot>
      <button-icon
        v-if="!okOnly"
        :disabled="cancelDisabled"
        :variant="cancelVariant"
        @click="$emit('cancel')"
      >
        {{ cancelTitle || t('appModalFooter.cancelTitle') }}
      </button-icon>
      <button-icon
        :disabled="okDisabled"
        :variant="okVariant"
        @click="$emit('ok')"
      >
        {{ okTitle || t('appModalFooter.okTitle') }}
      </button-icon>
    </slot>
  </form-actions>
</template>
