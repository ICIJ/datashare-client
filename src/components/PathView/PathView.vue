<script setup>
import { computed, provide, watch } from 'vue'

import PathViewLabel from './PathViewLabel'
import PathViewSearch from './PathViewSearch'

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
    'path-view--compact': props.compact
  }
})
</script>

<template>
  <div class="path-view d-flex flex-column" :class="classList">
    <path-view-label v-if="!noLabel" :label="label" :icon="icon" />
    <path-view-search v-if="!noSearch" :model-value="query" @update:modelValue="$emit('update:query', $event)" />
    <div>
      <slot v-bind="{ selectMode }" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.path-view {
  gap: $spacer-lg;

  &--compact {
    gap: $spacer;
  }
}
</style>
