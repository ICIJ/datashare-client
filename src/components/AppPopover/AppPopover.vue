<script setup>
import { computed } from 'vue'

import AppPopoverHeader from './AppPopoverHeader.vue'

defineOptions({ name: 'AppPopover' })

const modelValue = defineModel({ type: Boolean, default: false })

defineProps({
  teleportTo: {
    type: String,
    default: 'body'
  },
  title: {
    type: String
  }
})

const visible = computed(() => !!modelValue.value)
const show = () => (modelValue.value = true)
const hide = () => (modelValue.value = false)
const toggle = () => (modelValue.value = !modelValue.value)
</script>

<template>
  <b-popover ref="popover" v-model="modelValue" class="app-popover" :teleport-to="teleportTo">
    <template #default>
      <app-popover-header :title="title" class="mb-3" @hide="hide">
        <slot name="title" v-bind="{ show, hide, toggle, visible }" />
        <template #close>
          <slot name="close" v-bind="{ show, hide, toggle, visible }" />
        </template>
      </app-popover-header>
      <slot v-bind="{ show, hide, toggle, visible }" />
    </template>
    <template #target>
      <slot name="target" v-bind="{ show, hide, toggle, visible }" />
    </template>
  </b-popover>
</template>
