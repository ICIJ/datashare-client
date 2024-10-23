<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

const active = defineModel('active', { type: Boolean })

const toggle = () => {
  active.value = !active.value
}

const title = computed(() => {
  return active.value ? 'Open sidebar' : 'Close sidebar'
})

const weight = computed(() => {
  return active.value ? 'regular' : 'fill'
})
</script>

<template>
  <button-icon
    tooltip-placement="right"
    icon-left="sidebar-simple"
    :icon-left-weight="weight"
    square
    hide-label
    variant="primary"
    class="button-toggler-sidebar text-white"
    :title="title"
    @click="toggle"
  >
    {{ title }}
  </button-icon>
</template>
