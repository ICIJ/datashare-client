<script setup>
import ButtonTogglePin from '@/components/Button/ButtonTogglePin'

const pinned = defineModel('pinned', {
  type: Boolean,
  default: false
})
</script>

<template>
  <button-toggle-pin v-model:active="pinned" size="md" />
</template>
