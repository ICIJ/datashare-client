<script setup>
import { useTemplateRef } from 'vue'

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

const popoverRef = useTemplateRef('popover')

defineExpose({
  popoverRef,
  hide() {
    popoverRef.value.hide()
  },
  show() {
    popoverRef.value.show()
  }
})
</script>

<template>
  <b-popover ref="popover" v-model="modelValue" custom-class="document-share-popover" teleport-to="body">
    <document-share-popover-form :document="document" />
  </b-popover>
</template>

<style lang="scss">
.document-share-popover {
  --bs-popover-max-width: 500px;
}
</style>
