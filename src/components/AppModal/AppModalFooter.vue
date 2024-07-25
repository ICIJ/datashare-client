<script setup>
import FormActions from '@/components/FormActions/FormActions'
import IconButton from '@/components/IconButton'

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
    type: String
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
  <form-actions class="app-modal-footer">
    <slot>
      <icon-button v-if="!okOnly" :disabled="cancelDisabled" :variant="cancelVariant" @click="$emit('cancel')">
        {{ cancelTitle || $t('appModalFooter.cancelTitle') }}
      </icon-button>
      <icon-button :disabled="okDisabled" :variant="okVariant" @click="$emit('ok')">
        {{ okTitle || $t('appModalFooter.okTitle') }}
      </icon-button>
    </slot>
  </form-actions>
</template>
