<script setup>
import { AppIcon } from '@icij/murmur-next'

defineProps({
  size: {
    type: String,
    default: 'sm'
  },
  icon: {
    type: [Object, Array, String],
    required: true
  }
})
</script>

<template>
  <span class="document-thumbnail-overlay">
    <app-icon
      :name="icon"
      :size="size"
    />
  </span>
</template>

<style lang="scss" scoped>
.document-thumbnail-overlay {
  position: absolute;
  left: 1px;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--bs-light-rgb), 0.5);
  color: var(--bs-secondary);
  display: none;
}
</style>
