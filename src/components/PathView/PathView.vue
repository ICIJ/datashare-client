<script setup>
import { provide, watch } from 'vue'

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
  }
})

watch(
  () => props.selectMode,
  (selectMode) => {
    provide('selectMode', selectMode)
  },
  { immediate: true }
)
</script>

<template>
  <div class="path-view d-flex flex-column gap-4">
    <path-view-label :label="label" :icon="icon" />
    <path-view-search :model-value="query" @update:modelValue="$emit('update:query', $event)" />
    <div>
      <slot v-bind="{ selectMode }" />
    </div>
  </div>
</template>
