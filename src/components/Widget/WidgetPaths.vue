<script setup>
import { computed, ref, watch } from 'vue'
import trimEnd from 'lodash/trimEnd'
import uniq from 'lodash/uniq'

import { useInsightsStore } from '@/store/modules'
import PathTree from '@/components/PathTree/PathTree'
import PathTreeLayouts from '@/components/PathTree/PathTreeLayouts/PathTreeLayouts'
import { useConfig } from '@/composables/useConfig'
import { useCore } from '@/composables/useCore'
import { usePath } from '@/composables/usePath'
import { useUrlParam } from '@/composables/useUrlParam'
import { LAYOUTS, layoutValidator } from '@/enums/pathTree'

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

// A folder is only worth sharing if the URL carries it, so the three pieces of
// navigation state live in the query string rather than in local refs.
// An empty or absent ?path= falls back to the project's default folder: rooting
// the tree at "" would aggregate every document in the index.
const urlPath = useUrlParam('path', {
  initialValue: defaultPath,
  transform: value => trimEnd(value, config.get('pathSeparator', '/')) || defaultPath
})

// An unknown layout renders nothing at all, so a junk value falls back to the
// default instead of showing an empty widget.
const layout = useUrlParam('layout', {
  initialValue: LAYOUTS.GRID,
  transform: value => (layoutValidator(value) ? value : LAYOUTS.GRID)
})

const query = useUrlParam('q', { initialValue: '' })

const isTree = computed(() => layout.value === LAYOUTS.TREE)

// In tree layout the tree stays rooted at the default folder and the URL
// carries the last expanded one instead, see the openPaths handling below.
const path = computed({
  get: () => (isTree.value ? defaultPath : urlPath.value),
  set: value => (urlPath.value = value)
})

const openPaths = ref([])
const { getAncestorPaths } = usePath()

// Reveal the folder from the URL on arrival. Unlike FilterTypePath.vue, the
// target itself stays in the chain: the URL holds a folder the sender opened,
// so it has to be open for whoever follows the link.
watch(urlPath, (value) => {
  if (!isTree.value) return
  openPaths.value = uniq([...openPaths.value, ...getAncestorPaths(value, defaultPath)])
}, { immediate: true })

// Expanding a folder in tree layout only touches openPaths (PathTree.vue:314),
// never the path, so the URL tracks the last entry of that array. Collapsing
// splices an entry out, which walks the URL back to the previous folder.
watch(openPaths, (value) => {
  const lastOpened = value[value.length - 1]
  if (isTree.value && lastOpened && lastOpened !== urlPath.value) {
    urlPath.value = lastOpened
  }
})

const projects = computed(() => [insightsStore.project])
const flush = computed(() => layout.value === LAYOUTS.GRID)
</script>

<template>
  <div class="widget widget--paths p-5">
    <path-tree
      v-model:path="path"
      v-model:layout="layout"
      v-model:query="query"
      v-model:open-paths="openPaths"
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
