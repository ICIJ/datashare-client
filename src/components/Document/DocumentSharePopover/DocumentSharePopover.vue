<script setup>
import { ref, useTemplateRef, computed, nextTick } from 'vue'

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

// Lazy rendering: only mount the popover after it's been opened once
const mounted = ref(false)

async function activate() {
  mounted.value = true
  await nextTick()
  modelValue.value = true
}

defineExpose({
  popoverRef,
  hide() {
    popoverRef.value?.hide()
  },
  async show() {
    mounted.value = true
    await nextTick()
    popoverRef.value?.show()
  }
})

// Teleport only if the popover is inside a modal
const teleportTo = computed(() => {
  if (!popoverRef.value) return undefined
  const parent = useParentElement(popoverRef)
  const closest = parent.value?.closest('.modal')
  return closest ?? undefined
})
</script>

<template>
  <app-popover
    v-if="mounted"
    ref="popover"
    v-model="modelValue"
    hide-header
    class="document-share-popover"
    :teleport-to="teleportTo"
  >
    <template #target>
      <slot name="target" />
    </template>
    <document-share-popover-form :document="document" />
  </app-popover>
  <!-- Render target independently when popover not yet mounted -->
  <span
    v-else
    @click="activate"
  >
    <slot name="target" />
  </span>
</template>

<style lang="scss">
.document-share-popover {
  --bs-popover-max-width: min(70vw, 460px);
  width: 100%;
}
</style>
