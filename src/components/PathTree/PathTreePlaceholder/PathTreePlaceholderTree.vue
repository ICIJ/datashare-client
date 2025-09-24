<script setup>
import { computed } from 'vue'

import PathTreePlaceholderList from './PathTreePlaceholderList'

const { compact, entries, level } = defineProps({
  /**
   * Whether to render in compact mode (no gaps between entries)
   */
  compact: {
    type: Boolean,
    default: false
  },
  /**
   * Number of entries to render (including breadcrumb if level is 0)
   */
  entries: {
    type: Number,
    default: 1
  },
  /**
   * Whether to render as a flat list (no indentation)
   */
  flat: {
    type: Boolean,
    default: false
  },
  /**
   * Current nesting level (0 = root)
   */
  level: {
    type: Number,
    default: 0
  },
  /**
   * Whether to hide the stats (size, date) on each entry
   */
  noStats: {
    type: Boolean,
    default: false
  }
})

const classList = computed(() => {
  return {
    'path-tree-placeholder-list--compact': compact
  }
})
</script>

<template>
  <div
    class="path-tree-placeholder-tree"
    :class="classList"
  >
    <path-tree-placeholder-list
      :compact="compact"
      :entries="entries"
      :flat="flat"
      :level="level"
      :no-stats="noStats"
      nested
    />
  </div>
</template>
