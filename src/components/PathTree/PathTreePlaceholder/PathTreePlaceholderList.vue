<script setup>
import { computed } from 'vue'

import PathTreePlaceholderListEntry from './PathTreePlaceholderListEntry.vue'

const props = defineProps({
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
  nested: {
    type: Boolean,
    default: false
  },
  noStats: {
    type: Boolean,
    default: false
  },
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
