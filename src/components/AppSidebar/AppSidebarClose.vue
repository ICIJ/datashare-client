<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

const props = defineProps({
  closed: {
    type: Boolean
  }
})

const emit = defineEmits(['toggle'])

const toggle = () => {
  emit('toggle', !props.compact)
}

const classList = computed(() => {
  return {
    'app-sidebar-toggler--closed': props.compact
  }
})

const title = computed(() => {
  return props.closed ? 'Open sidebar' : 'Close sidebar'
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
    :class="classList"
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
