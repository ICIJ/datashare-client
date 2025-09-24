<script setup>
import { computed, provide, watch } from 'vue'

import PathTreeViewLabel from './PathTreeViewLabel'
import PathTreeViewSearch from './PathTreeViewSearch'
import PathTreePlaceholder from '@/components/PathTree/PathTreePlaceholder/PathTreePlaceholder.vue'
import { LAYOUTS, layoutValidator } from '@/enums/pathTree'

const query = defineModel('query', { type: String })
const layout = defineModel('layout', { type: String, default: LAYOUTS.TREE, validator: layoutValidator })

const props = defineProps({
  /**
   * Optional label to display above the tree
   */
  label: {
    type: String
  },
  /**
   * Optional icon to display next to the label (string name or icon object)
   */
  icon: {
    type: [String, Object, Array]
  },
  /**
   * Whether to enable select mode (checkboxes next to entries)
   */
  selectMode: {
    type: Boolean
  },
  /**
   * Use compact mode (no gaps between entries)
   */
  compact: {
    type: Boolean
  },
  /**
   * Whether to render as a flat list (no indentation)
   */
  flat: {
    type: Boolean
  },
  /**
   * Current nesting level (0 = root)
   */
  level: {
    type: Number,
    default: 0
  },
  /**
   * Whether to hide the label
   */
  noLabel: {
    type: Boolean
  },
  /**
   * Whether to hide the placeholder when loading
   */
  noPlaceholder: {
    type: Boolean
  },
  /**
   * Whether to hide the search box
   */
  noStats: {
    type: Boolean
  },
  /**
   * Whether to hide the search box
   */
  noSearch: {
    type: Boolean
  },
  /**
   * Whether the tree is currently loading (shows placeholder if true)
   */
  isLoading: {
    type: Boolean
  }
})

watch(
  () => props.selectMode,
  (selectMode) => {
    provide('selectMode', selectMode)
  },
  { immediate: true }
)

watch(
  () => props.compact,
  (compact) => {
    provide('compact', compact)
  },
  { immediate: true }
)

const classList = computed(() => {
  return {
    'path-tree-view--compact': props.compact,
    [`path-tree-view--${props.layout}`]: true
  }
})
</script>

<template>
  <div
    class="path-tree-view d-flex flex-column"
    :class="classList"
  >
    <path-tree-view-label
      v-if="!noLabel"
      v-model:layout="layout"
      :label="label"
      :icon="icon"
    />
    <path-tree-view-search
      v-if="!noSearch"
      v-model="query"
      :shadow="!compact"
    />
    <slot name="before" />
    <div v-if="isLoading && !noPlaceholder">
      <path-tree-placeholder
        :compact="compact"
        :layout="layout"
        :flat="flat"
        :level="1"
        :no-stats="noStats"
      />
    </div>
    <div v-else>
      <slot v-bind="{ selectMode }" />
    </div>
    <slot name="after" />
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view {
  gap: $spacer-lg;

  &--compact {
    gap: $spacer-sm;
  }
}
</style>
