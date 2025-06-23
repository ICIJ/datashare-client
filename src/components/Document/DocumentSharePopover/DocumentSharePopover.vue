<script setup>
import { useTemplateRef } from 'vue'

import DocumentSharePopoverForm from './DocumentSharePopoverForm'

import AppPopover from '@/components/AppPopover/AppPopover'


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
  <app-popover ref="popover" v-model="modelValue" hide-header class="document-share-popover">
    <document-share-popover-form :document="document" />
  </app-popover>
</template>

<style lang="scss">
.document-share-popover {
  --bs-popover-max-width: min(90vw, 500px);
  width: 100%;
}
</style>
