<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

defineProps({
  document: {
    type: Object,
    required: true
  },
  size: {
    type: [Number, String],
    default: 'sm'
  }
})
</script>

<template>
  <span class="document-thumbnail-placeholder">
    <phosphor-icon :name="document.contentTypeIcon" :size="String(size)" />
  </span>
</template>

<style lang="scss" scoped>
.document-thumbnail-placeholder {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bs-tertiary-bg-subtle);
}
</style>
