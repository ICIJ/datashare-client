<script setup>
import { computed, provide, watch } from 'vue'

import PathTreeViewLabel from './PathTreeViewLabel'
import PathTreeViewSearch from './PathTreeViewSearch'

const query = defineModel('query', { type: String })
const nested = defineModel('nested', { type: Boolean })

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
  <div class="path-tree-view d-flex flex-column" :class="classList">
    <path-tree-view-label v-if="!noLabel" v-model:nested="nested" :label="label" :icon="icon" />
    <path-tree-view-search v-if="!noSearch" v-model="query" :shadow="!compact" />
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
