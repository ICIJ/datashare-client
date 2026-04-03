<script setup>
import { ButtonIcon } from '@icij/murmur-next'

defineProps({
  icon: {
    type: [String, Object, Array],
    required: true
  },
  iconHover: {
    type: [String, Object, Array],
    default: null
  }
})
</script>

<template>
  <button-icon
    class="border-0"
    hide-label
    variant="outline-secondary"
    :icon-left="icon"
    :icon-left-hover="iconHover"
  />
</template>
