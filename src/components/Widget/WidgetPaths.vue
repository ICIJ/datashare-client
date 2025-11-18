<script setup>
import { computed, ref } from 'vue'

import { useInsightsStore } from '@/store/modules'
import PathTree from '@/components/PathTree/PathTree'
import PathTreeLayouts from '@/components/PathTree/PathTreeLayouts/PathTreeLayouts'
import { useConfig } from '@/composables/useConfig'
import { useCore } from '@/composables/useCore'
import { LAYOUTS } from '@/enums/pathTree'

/**
 * A placeholder widget for the insights page. This widget is not intended to be used directly.
 */
defineProps({
  /**
   * The widget definition object.
   */
  widget: {
    type: Object
  }
})

const insightsStore = useInsightsStore()
const core = useCore()
const { sourcePath } = core.findProject(insightsStore.project)
const config = useConfig()
const dataDir = config.get('mountedDataDir') || config.get('dataDir')
const defaultPath = sourcePath ? decodeURI(sourcePath.split('//').pop()) : dataDir
const path = ref(defaultPath)
const layout = ref(LAYOUTS.GRID)
const projects = computed(() => [insightsStore.project])
const flush = computed(() => layout.value === LAYOUTS.GRID)
</script>

<template>
  <div class="widget widget--paths p-5">
    <path-tree
      v-model:path="path"
      v-model:layout="layout"
      :default-path="defaultPath"
      :projects="projects"
      :flush="flush"
      no-label
    >
      <template #before>
        <path-tree-layouts
          v-model="layout"
          class="ms-auto"
        />
      </template>
    </path-tree>
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
