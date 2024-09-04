<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

const props = defineProps({
  compact: {
    type: Boolean
  }
})

const emit = defineEmits(['toggle'])

const toggle = () => {
  emit('toggle', !props.compact)
}

const classList = computed(() => {
  return {
    'app-sidebar-toggler--compact': props.compact
  }
})

const title = computed(() => {
  return props.compact ? 'Extend sidebar' : 'Reduce sidebar'
})

const weight = computed(() => {
  return props.compact ? 'regular' : 'fill'
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
    class="app-sidebar-toggler text-white"
    :title="title"
    :class="classList"
    @click="toggle"
  >
    {{ title }}
  </button-icon>
</template>
