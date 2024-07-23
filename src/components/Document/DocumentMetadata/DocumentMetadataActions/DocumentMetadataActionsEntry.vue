<script setup>
import IconButton from '@/components/IconButton'

defineProps({
  icon: {
    type: String,
    required: true
  },
  iconWeight: {
    type: String,
    default: 'normal'
  },
  iconHoverWeight: {
    type: String,
    default: 'bold'
  },
  label: {
    type: String,
    required: true
  }
})
</script>

<template>
  <icon-button
    class="border-0"
    hide-label
    variant="outline-tertiary"
    square
    :label="label"
    :icon-left="icon"
    :icon-left-weight="iconWeight"
    :icon-left-hover-weight="iconHoverWeight"
  />
</template>
