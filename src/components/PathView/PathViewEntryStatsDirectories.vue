<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

import DisplayNumber from '@/components/Display/DisplayNumber'

defineProps({
  value: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <div class="path-view-entry-stats-directories px-2 py-1">
    <phosphor-icon name="folders" class="me-2" />
    <display-number :value="value" />
  </div>
</template>

<style lang="scss" scoped>
.path-view-entry-stats-directories {
  color: var(--bs-secondary-color);
  display: flex;
  align-items: center;

  @include media-breakpoint-down(sm) {
    display: none;
  }
}
</style>
