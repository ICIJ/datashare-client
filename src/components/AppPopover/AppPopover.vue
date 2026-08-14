<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useEventListener } from '@vueuse/core'

import AppPopoverHeader from './AppPopoverHeader.vue'

defineOptions({ name: 'AppPopover' })

const modelValue = defineModel({ type: Boolean, default: false })

defineProps({
  teleportTo: {
    type: [String, Object],
    default: 'body'
  },
  title: {
    type: String
  },
  hideHeader: {
    type: Boolean
  }
})

const visible = computed(() => !!modelValue.value)
const show = () => (modelValue.value = true)
const hide = () => (modelValue.value = false)
const toggle = () => (modelValue.value = !modelValue.value)

// The element focused when the popover opened, so that closing it can hand
// focus back no matter how it was closed (Escape, a click outside or the
// header close button).
const elementFocusedBeforeOpening = ref(null)
const content = useTemplateRef('content')

// Focus is only handed back when closing would otherwise strand it, either on
// <body> or inside the teleported content about to be removed. A click on
// another control outside the popover keeps focus where the user just put it.
const isFocusStranded = () => {
  const { activeElement } = document
  return activeElement === document.body || !!content.value?.contains(activeElement)
}

const restoreFocus = () => {
  if (isFocusStranded()) {
    elementFocusedBeforeOpening.value?.focus?.()
  }
  elementFocusedBeforeOpening.value = null
}

// The watcher is immediate so a popover mounted already open still captures
// its opener.
watch(
  modelValue,
  (isVisible) => {
    if (isVisible) {
      elementFocusedBeforeOpening.value = document.activeElement
    }
    else {
      restoreFocus()
    }
  },
  { immediate: true }
)

// The popover content is teleported to document.body, so a template-level
// @keydown here would never catch the key. bootstrap-vue-next's floating UI
// wires no keyboard handling at all, so Escape-to-close is added by hand.
// The listener runs in capture phase to consume the key before the
// element-scoped Escape handler of a surrounding modal, which would
// otherwise close the modal at the same time as the popover.
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    event.stopPropagation()
    hide()
  }
}

// The document-wide listener is only attached while the popover is open, so
// pages with many mounted popovers do not stack idle listeners.
useEventListener(() => (visible.value ? document : null), 'keydown', handleKeydown, { capture: true })
</script>

<template>
  <b-popover
    ref="popover"
    v-model="modelValue"
    class="app-popover"
    :teleport-to="teleportTo"
  >
    <template #default>
      <div ref="content">
        <app-popover-header
          v-if="!hideHeader"
          :title="title"
          class="mb-3"
          @hide="hide"
        >
          <slot
            name="title"
            v-bind="{ show, hide, toggle, visible }"
          />
          <template #close>
            <slot
              name="close"
              v-bind="{ show, hide, toggle, visible }"
            />
          </template>
        </app-popover-header>
        <slot v-bind="{ show, hide, toggle, visible }" />
      </div>
    </template>
    <template #target>
      <slot
        name="target"
        v-bind="{ show, hide, toggle, visible }"
      />
    </template>
  </b-popover>
</template>
