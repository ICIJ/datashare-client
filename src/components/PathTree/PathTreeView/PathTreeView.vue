<script setup>
import { computed, provide, watch } from 'vue'

import PathTreeViewLabel from './PathTreeViewLabel'
import PathTreeViewSearch from './PathTreeViewSearch'

const props = defineProps({
  label: {
    type: String
  },
  icon: {
    type: String
  },
  query: {
    type: String
  },
  selectMode: {
    type: Boolean
  },
  compact: {
    type: Boolean
  },
  noLabel: {
    type: Boolean
  },
  noSearch: {
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
    'path-tree-view--compact': props.compact
  }
})
</script>

<template>
  <div class="path-view d-flex flex-column" :class="classList">
    <path-tree-view-label v-if="!noLabel" :label="label" :icon="icon" />
    <path-tree-view-search v-if="!noSearch" :model-value="query" @update:modelValue="$emit('update:query', $event)" />
    <div>
      <slot v-bind="{ selectMode }" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view {
  gap: $spacer-lg;

  &--compact {
    gap: $spacer;
  }
}
</style>
