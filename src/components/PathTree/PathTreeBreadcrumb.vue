<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { basename } from 'path'
import { computed } from 'vue'

import { useCore } from '@/composables/core'

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

const dataDir = computed(() => core.config.get('mountedDataDir') || core.config.get('dataDir'))

const pathSeparator = computed(() => core.config.get('pathSeparator', '/'))

const treeDirectories = computed(() => modelValue.value?.split(pathSeparator.value) ?? [])

const fullTree = computed(() =>
  treeDirectories.value
    // Filter out empty directories
    .filter((directory) => directory !== '')
    // Transform each directory into a path entry
    .reduce(getNextTreeEntry, [])
)

const treeWithoutDataDir = computed(() => fullTree.value.filter((d) => d.length > dataDir.value.length))

const tree = computed(() => (props.noDatadir || props.datadirLabel ? treeWithoutDataDir.value : fullTree.value))
</script>

<template>
  <ul class="list-inline flex-grow-1 m-0 path-tree-breadcrumb text-truncate">
    <li
      v-if="datadirLabel && !noDatadir"
      class="list-inline-item path-tree-breadcrumb__item path-tree-breadcrumb__item--root"
    >
      <a href @click.prevent="modelValue = dataDir">
        {{ $t('treeView.datadir') }}
      </a>
    </li>
    <li
      v-if="treeWithoutDataDir.length > maxDirectories"
      class="list-inline-item path-tree-breadcrumb__item path-tree-breadcrumb__item--abbr"
    >
      <phosphor-icon name="dots-three" />
    </li>
    <li
      v-for="directory in tree.slice(-maxDirectories)"
      :key="directory"
      class="list-inline-item path-tree-breadcrumb__item"
    >
      <a href @click.prevent="modelValue = directory">
        {{ basename(directory) }}
      </a>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.path-tree-breadcrumb {
  &__item.list-inline-item {
    margin-right: $spacer * 0.1;
    padding: 0;

    &:not(:last-child):after {
      content: '/';
      color: $text-muted;
      margin-left: $spacer * 0.1;
    }

    &:last-child a {
      color: inherit;
    }
  }
}
</style>
