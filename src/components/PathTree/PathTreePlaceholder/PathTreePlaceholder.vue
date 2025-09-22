<script setup>
import { computed } from 'vue'

import { LAYOUTS, layoutValidator } from '@/enums/pathTree'
import PathTreePlaceholderGrid from './PathTreePlaceholderGrid'
import PathTreePlaceholderList from './PathTreePlaceholderList'
import PathTreePlaceholderTree from './PathTreePlaceholderTree'

const { layout } = defineProps({
  layout: {
    type: String,
    default: LAYOUTS.TREE,
    validator: layoutValidator
  },
  compact: {
    type: Boolean,
    default: false
  },
  entries: {
    type: Number,
    default: 3
  },
  flat: {
    type: Boolean,
    default: false
  },
  level: {
    type: Number,
    default: 0
  },
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
