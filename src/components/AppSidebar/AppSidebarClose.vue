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
</script>

<template>
  <button-icon
    tooltip-placement="right"
    icon-left="x"
    square
    hide-label
    variant="light"
    class="app-sidebar-close"
    :title="title"
    @click="toggle"
  >
    {{ title }}
  </button-icon>
</template>

<style lang="scss" scoped>
.app-sidebar-close {
  --bs-btn-bg: #fff;
}
</style>
