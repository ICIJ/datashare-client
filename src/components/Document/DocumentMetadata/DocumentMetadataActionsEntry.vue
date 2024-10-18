<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

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
  <button-icon
    class="border-0"
    hide-label
    variant="outline-secondary"
    square
    :label="label"
    :icon-left="icon"
    :icon-left-weight="iconWeight"
    :icon-left-hover-weight="iconHoverWeight"
  />
</template>
