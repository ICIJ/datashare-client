<script setup>
import { useTemplateRef, computed } from 'vue'

import DocumentSharePopoverForm from './DocumentSharePopoverForm'

import AppPopover from '@/components/AppPopover/AppPopover'
import { useParentElement } from '@vueuse/core'

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

// Teleport only if the popover is inside a modal
const teleportTo = computed(() => {
  const parent = useParentElement(popoverRef)
  const closest = parent.value?.closest('.modal')
  return closest ?? undefined
})
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
  --bs-popover-max-width: min(70vw, 460px);
  width: 100%;
}
</style>
