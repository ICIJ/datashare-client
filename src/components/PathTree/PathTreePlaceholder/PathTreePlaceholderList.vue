<script setup>
import { computed } from 'vue'

import PathTreePlaceholderListEntry from './PathTreePlaceholderListEntry.vue'

const props = defineProps({
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
   * Whether the list is nested inside another list (adds a left border)
   */
  nested: {
    type: Boolean,
    default: false
  },
  /**
   * Whether to hide the stats (size, date) on each entry
   */
  noStats: {
    type: Boolean,
    default: false
  },
  /**
   * Whether to render entries without a gap between them
   */
  flush: {
    type: Boolean,
    default: false
  }
})

const classList = computed(() => {
  return {
    'path-tree-placeholder-list--compact': props.compact
  }
})

const hasBreadcrumb = computed(() => {
  return props.level === 0
})

const childEntries = computed(() => {
  if (hasBreadcrumb.value) {
    return Math.max(0, props.entries - 1)
  }
  return props.entries
})

const childLevel = computed(() => {
  if (hasBreadcrumb.value) {
    return props.level + 1
  }
  return props.level
})
</script>

<template>
  <div
    class="path-tree-placeholder-list"
    :class="classList"
  >
    <path-tree-placeholder-list-entry
      v-if="hasBreadcrumb.value"
      :nested="nested"
      :compact="compact"
      :level="level"
      :no-stats="noStats"
      :flat="flat"
      open
    />
    <path-tree-placeholder-list-entry
      v-for="i in childEntries"
      :key="i"
      :compact="compact"
      :flush="flush"
      :level="childLevel"
      :nested="nested"
      :no-stats="noStats"
      :flat="flat"
    />
  </div>
</template>

<style lang="scss" scoped>
.path-tree-placeholder-list {
  --path-tree-placeholder-list-gap: 1px;

  display: flex;
  flex-direction: column;
  gap: var(--path-tree-placeholder-list-gap);

  &--compact {
    --path-tree-placeholder-list-gap: 0;
  }
}
</style>
