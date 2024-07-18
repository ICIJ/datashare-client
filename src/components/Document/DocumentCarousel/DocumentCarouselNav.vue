<script setup>
import IconButton from '@/components/IconButton'

defineProps({
  icon: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  }
})
</script>

<template>
  <icon-button
    class="document-carousel-bar border-0"
    square
    variant="outline-light"
    :icon-left="icon"
    hide-label
    :label="label"
  />
</template>
