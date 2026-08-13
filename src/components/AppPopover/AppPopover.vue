<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

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

// The element focused when the popover opened, so Escape can hand focus back.
const elementFocusedBeforeOpening = ref(null)

watch(modelValue, (isVisible) => {
  if (isVisible) {
    elementFocusedBeforeOpening.value = document.activeElement
  }
})

// The content is teleported into document.body, so focus may sit inside it when
// Escape is pressed. Closing would then strand focus on <body>, since the
// library does no focus management of its own.
const restoreFocus = () => {
  elementFocusedBeforeOpening.value?.focus?.()
  elementFocusedBeforeOpening.value = null
}

// The popover content is teleported to document.body, so a template-level
// @keydown here would never catch the key. bootstrap-vue-next's floating UI
// wires no keyboard handling at all, so Escape-to-close is added by hand.
const handleKeydown = (event) => {
  if (event.key === 'Escape' && visible.value) {
    hide()
    restoreFocus()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <b-popover
    ref="popover"
    v-model="modelValue"
    class="app-popover"
    :teleport-to="teleportTo"
  >
    <template #default>
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
    </template>
    <template #target>
      <slot
        name="target"
        v-bind="{ show, hide, toggle, visible }"
      />
    </template>
  </b-popover>
</template>
