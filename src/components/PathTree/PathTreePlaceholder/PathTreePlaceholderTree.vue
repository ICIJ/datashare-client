<script setup>
import { computed } from 'vue'

import PathTreePlaceholderList from './PathTreePlaceholderList'

const { compact, entries, level } = defineProps({
  compact: {
    type: Boolean,
    default: false
  },
  entries: {
    type: Number,
    default: 1
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
