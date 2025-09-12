<script setup>
import { ref } from 'vue'

import { useConfig } from '@/composables/useConfig'
import PathTree from '@/components/PathTree/PathTree'

/**
 * A placeholder widget for the insights page. This widget is not intended to be used directly.
 */
defineProps({
  /**
   * The widget definition object.
   */
  widget: {
    type: Object
  },
  /**
   * The project name.
   */
  project: {
    type: String,
    required: true
  }
})

const config = useConfig()
const path = ref(config.get('mountedDataDir') || config.get('dataDir'))
</script>

<template>
  <div class="widget widget--paths p-5">
    <path-tree
      v-model:path="path"
      :projects="[project]"
      no-label
      nested
    />
  </div>
</template>

<style lang="scss" scoped>
.widget--paths, .widget--paths > * {
  width: 100%;
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: auto;
}
</style>
