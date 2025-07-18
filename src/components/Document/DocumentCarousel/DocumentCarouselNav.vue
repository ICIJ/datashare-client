<script setup>
import { ButtonIcon } from '@icij/murmur-next'

defineProps({
  icon: {
    type: [String, Object, Array],
    required: true
  },
  label: {
    type: String,
    required: true
  }
})
</script>

<template>
  <button-icon
    class="document-carousel-bar border-0"
    square
    variant="outline-tertiary"
    :icon-left="icon"
    hide-label
    hide-tooltip
    :label="label"
  />
</template>
