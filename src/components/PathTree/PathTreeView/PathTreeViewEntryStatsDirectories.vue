<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

import DisplayNumber from '@/components/Display/DisplayNumber'

defineProps({
  /**
   * Number of directories in the entry
   */
  value: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <div class="path-tree-view-entry-stats-directories px-2 py-1">
    <phosphor-icon
      :name="PhFolders"
      class="me-2"
    />
    <display-number :value="value" />
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view-entry-stats-directories {
  display: flex;
  align-items: center;

  @include media-breakpoint-down(sm) {
    display: none;
  }
}
</style>
