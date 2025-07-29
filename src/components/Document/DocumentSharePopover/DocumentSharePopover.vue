<script setup>
import { useTemplateRef } from 'vue'

import DocumentSharePopoverForm from './DocumentSharePopoverForm'

import AppPopover from '@/components/AppPopover/AppPopover'
import { useScrollParent } from '@/composables/useScrollParent'

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
const teleportTo = useScrollParent()
</script>

<template>
  <app-popover
    ref="popover"
    v-model="modelValue"
    hide-header
    class="document-share-popover"
    :teleport-to="teleportTo"
  >
    <template #target="binding">
      <slot
        name="target"
        v-bind="binding"
      />
    </template>
    <document-share-popover-form :document="document" />
  </app-popover>
</template>

<style lang="scss">
.document-share-popover {
  --bs-popover-max-width: min(90vw, 500px);
  width: 100%;
}
</style>
