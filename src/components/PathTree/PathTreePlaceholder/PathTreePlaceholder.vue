<script setup>
import { computed } from 'vue'

import { LAYOUTS, layoutValidator } from '@/enums/pathTree'
import PathTreePlaceholderGrid from './PathTreePlaceholderGrid'
import PathTreePlaceholderList from './PathTreePlaceholderList'
import PathTreePlaceholderTree from './PathTreePlaceholderTree'

const { layout } = defineProps({
  /**
   * Layout to use for rendering the placeholder
   */
  layout: {
    type: String,
    default: LAYOUTS.TREE,
    validator: layoutValidator
  },
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
    default: 3
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

const is = computed(() => {
  switch (layout) {
    case LAYOUTS.GRID:
      return PathTreePlaceholderGrid
    case LAYOUTS.LIST:
      return PathTreePlaceholderList
  }
  return PathTreePlaceholderTree
})
</script>

<template>
  <component
    :is="is"
    :compact="compact"
    :flat="flat"
    :level="level"
    :entries="entries"
    :no-stats="noStats"
  />
</template>
