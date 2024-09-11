<script setup>
import { computed } from 'vue'

import { useBreakpoints } from '@/composables/breakpoints'
import ButtonIcon from '@/components/Button/ButtonIcon'
import { SIZE } from '@/enums/sizes'

const { breakpointDown } = useBreakpoints()

const active = defineModel('active', { type: Boolean })

const toggle = () => {
  active.value = !active.value
}

const title = computed(() => {
  return active.value ? 'Open sidebar' : 'Close sidebar'
})

const variant = computed(() => {
  return breakpointDown.value[SIZE.MD] ? 'primary' : 'light'
})
</script>

<template>
  <button-icon
    tooltip-placement="right"
    icon-left="x"
    square
    hide-label
    :variant="variant"
    class="app-sidebar-close"
    :title="title"
    @click="toggle"
  >
    {{ title }}
  </button-icon>
</template>

<style lang="scss" scoped>
.app-sidebar-close {
  &.btn-light {
    --bs-btn-bg: #fff;
  }
}
</style>
