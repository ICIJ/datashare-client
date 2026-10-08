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

  // Takes the row's remaining width and sits at its end, so every row's size
  // reads against the same right edge instead of starting wherever the
  // variable-width directory count happens to end. A value too long for the
  // space left then overflows towards the gap on its left rather than pushing
  // the right edge out of line (icij/datashare#2432).
  flex: 1 1 auto;
  min-width: 0;
  justify-content: flex-end;

  @include media-breakpoint-down(sm) {
    display: none;
  }
}
</style>
