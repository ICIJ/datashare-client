<script setup>
import { computed } from 'vue'

import IconButton from '@/components/IconButton'

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
</script>

<template>
  <icon-button
    tooltip-placement="right"
    icon-left="sidebar-simple"
    square
    hide-label
    variant="primary"
    class="app-sidebar-toggler text-white"
    :title="title"
    :class="classList"
    @click="toggle"
  >
    {{ title }}
  </icon-button>
</template>
