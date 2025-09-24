<script setup>
import DisplayContentLength from '@/components/Display/DisplayContentLength'

defineProps({
  /**
   * Size of the entry in bytes
   */
  value: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <div class="path-tree-view-entry-stats-size px-2 py-1">
    <display-content-length :value="value" />
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view-entry-stats-size {
  display: flex;
  align-items: center;

  @include media-breakpoint-down(sm) {
    display: none;
  }
}
</style>
