<script setup>
import FormActions from '@/components/Form/FormActions/FormActions'
import ButtonIcon from '@/components/Button/ButtonIcon'

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
</script>

<template>
  <form-actions class="app-modal-footer" end>
    <slot>
      <button-icon v-if="!okOnly" :disabled="cancelDisabled" :variant="cancelVariant" @click="$emit('cancel')">
        {{ cancelTitle || $t('appModalFooter.cancelTitle') }}
      </button-icon>
      <button-icon :disabled="okDisabled" :variant="okVariant" @click="$emit('ok')">
        {{ okTitle || $t('appModalFooter.okTitle') }}
      </button-icon>
    </slot>
  </form-actions>
</template>
