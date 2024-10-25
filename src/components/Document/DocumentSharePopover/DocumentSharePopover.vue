<script setup>
import DocumentSharePopoverForm from './DocumentSharePopoverForm'

/**
 * Toggle value when the popover is open
 */
const modelValue = defineModel({ type: Boolean })

defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object
  }
})
</script>

<template>
  <b-popover v-model="modelValue" custom-class="document-share-popover" teleport-to="body">
    <document-share-popover-form :document="document" />
  </b-popover>
</template>

<style lang="scss">
.document-share-popover {
  --bs-popover-max-width: 500px;
}
</style>
