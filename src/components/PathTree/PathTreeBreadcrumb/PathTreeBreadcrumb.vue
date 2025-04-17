<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { basename } from 'path'
import { computed } from 'vue'
import { isArray } from 'lodash'

import PathTreeBreadcrumbEntry from './PathTreeBreadcrumbEntry.vue'

import { useCore } from '@/composables/useCore'

const { core } = useCore()

const modelValue = defineModel({ type: String })

const props = defineProps({
  maxDirectories: {
    type: Number,
    default: 5
  },
  datadirLabel: {
    type: Boolean
  },
  noDatadir: {
    type: Boolean
  },
  noLink: {
    type: Boolean
  }
})

const getNextTreeEntry = (tree, directory) => {
  const previous = tree.length > 0 ? tree[tree.length - 1] : ''
  const sep = isWindowsPath.value ? '\\' : '/'
  const root = isWindowsPath.value ? '' : sep
  const entry = isRootEntry(tree) ? `${root}${directory}` : `${previous}${sep}${directory}`
  tree.push(entry)
  return tree
}

const isRootEntry = (tree) => tree.length === 0

const isWindowsPath = computed(() => pathSeparator.value === '\\')

const dataDir = core.getDefaultDataDir()

const pathSeparator = computed(() => core.config.get('pathSeparator', '/'))

const treeDirectories = computed(() => {
  if (isArray(modelValue.value)) {
    return modelValue.value?.[0]?.split(pathSeparator.value) ?? []
  }
  return modelValue.value?.split(pathSeparator.value) ?? []
})

const fullTree = computed(() =>
  treeDirectories.value
    // Filter out empty directories
    .filter((directory) => directory !== '')
    // Transform each directory into a path entry
    .reduce(getNextTreeEntry, [])
)

const treeWithoutDataDir = computed(() => fullTree.value.filter((d) => d.length > dataDir.length))

const tree = computed(() => (props.noDatadir || props.datadirLabel ? treeWithoutDataDir.value : fullTree.value))
</script>

<template>
  <ul class="path-tree-breadcrumb list-inline flex-grow-1 m-0 text-truncate">
    <path-tree-breadcrumb-entry v-if="datadirLabel && !noDatadir" root :no-link="noLink" @select="modelValue = dataDir">
      {{ $t('pathTreeBreadcrumb.datadir') }}
    </path-tree-breadcrumb-entry>
    <path-tree-breadcrumb-entry v-if="treeWithoutDataDir.length > maxDirectories" abbr>
      <phosphor-icon :name="PhDotsThree" />
    </path-tree-breadcrumb-entry>
    <path-tree-breadcrumb-entry
      v-for="directory in tree.slice(-maxDirectories)"
      :key="directory"
      :no-link="noLink"
      @select="modelValue = directory"
    >
      {{ basename(directory) }}
    </path-tree-breadcrumb-entry>
  </ul>
</template>
