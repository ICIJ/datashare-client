<script setup>
import { computed } from 'vue'
import { ButtonIcon } from '@icij/murmur-next'

import { useBreakpoints } from '@/composables/useBreakpoints'
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
    hide-tooltip
    :variant="variant"
    class="app-sidebar-close"
    :label="title"
    @click="toggle"
  >
    {{ title }}
  </button-icon>
</template>

<style lang="scss" scoped>
.app-sidebar-close {
  &.btn-light {
    --bs-btn-bg: var(--bs-body-bg);
    --bs-btn-color: var(--bs-body-color);
  }

  &.btn-primary {
    --bs-btn-color: #fff;
    --bs-btn-hover-color: #fff;
  }
}
</style>
