<script setup>
import { computed, provide, watch } from 'vue'

import PathTreeViewLabel from './PathTreeViewLabel'
import PathTreeViewSearch from './PathTreeViewSearch'
import PathTreePlaceholder from '@/components/PathTree/PathTreePlaceholder/PathTreePlaceholder.vue'
import { LAYOUTS, layoutValidator } from '@/enums/pathTree'

const query = defineModel('query', { type: String })
const layout = defineModel('layout', { type: String, default: LAYOUTS.TREE, validator: layoutValidator })

const props = defineProps({
  label: {
    type: String
  },
  icon: {
    type: [String, Object, Array]
  },
  selectMode: {
    type: Boolean
  },
  compact: {
    type: Boolean
  },
  flat: {
    type: Boolean
  },
  level: {
    type: Number,
    default: 0
  },
  noLabel: {
    type: Boolean
  },
  noPlaceholder: {
    type: Boolean
  },
  noStats: {
    type: Boolean
  },
  noSearch: {
    type: Boolean
  },
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
