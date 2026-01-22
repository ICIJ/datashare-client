<script setup>
import { ref, useTemplateRef, computed, nextTick } from 'vue'
import { useParentElement, whenever } from '@vueuse/core'

import DocumentSharePopoverForm from './DocumentSharePopoverForm'

import AppPopover from '@/components/AppPopover/AppPopover'

/**
 * Toggle value when the popover is open
 */
const modelValue = defineModel({ type: Boolean })

const props = defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object
  },
  /**
   * Lazy mount the popover only on first activation
   */
  lazy: {
    type: Boolean,
    default: true
  }
})

const popoverRef = useTemplateRef('popover')

// Lazy rendering: only mount the popover after it's been opened once
const activated = ref(false)
const mounted = computed(() => !props.lazy || activated.value)

// Activate when modelValue becomes true
whenever(modelValue, () => (activated.value = true), { once: true })

async function activate() {
  activated.value = true
  await nextTick()
  modelValue.value = true
}

defineExpose({
  popoverRef,
  hide() {
    popoverRef.value?.hide()
  },
  async show() {
    activated.value = true
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
