<script setup>
import { basename } from 'path'
import { computed } from 'vue'
import { isArray, last } from 'lodash'
import { useI18n } from 'vue-i18n'

import PathTreeBreadcrumbEntry from './PathTreeBreadcrumbEntry.vue'
import PathTreeBreadcrumbDropdownItem from './PathTreeBreadcrumbDropdownItem.vue'

import ParentOverflowEntries from '@/components/ParentOverflow/ParentOverflowEntries'

import { useCore } from '@/composables/useCore'

const { core } = useCore()

const modelValue = defineModel({ type: String })

const props = defineProps({
  compact: {
    type: Boolean,
    default: false
  },
  maxEntries: {
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
  },
  dropdownDisabled: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()

function getNextTreeEntry(tree, directory) {
  const previous = tree.length > 0 ? tree[tree.length - 1] : ''
  const sep = isWindowsPath.value ? '\\' : '/'
  const root = isWindowsPath.value ? '' : sep
  const entry = isRootEntry(tree) ? `${root}${directory}` : `${previous}${sep}${directory}`
  tree.push(entry)
  return tree
}

function isRootEntry(tree) {
  return tree.length === 0
}

function safeBasename(path) {
  return isWindowsPath.value ? basename(path.replace(/\\/g, '/')) : basename(path)
}

function pathOption(value) {
  return { text: safeBasename(value), value }
}

const isWindowsPath = computed(() => pathSeparator.value === '\\')

const dataDir = core.getDefaultDataDir()

const pathSeparator = computed(() => core.config.get('pathSeparator', '/'))

const treeDirectories = computed(() => {
  if (isArray(modelValue.value)) {
    return modelValue.value?.[0]?.split(pathSeparator.value) ?? []
  }
  return modelValue.value?.split(pathSeparator.value) ?? []
})

const tree = computed(() =>
  treeDirectories.value
    // Filter out empty directories
    .filter(directory => directory !== '')
    // Transform each directory into a path entry
    .reduce(getNextTreeEntry, [])
)

const treeWithoutDataDir = computed(() => tree.value.filter(d => d.length > dataDir.length))

const treeOptions = computed(() => {
  const options = treeWithoutDataDir.value.map(pathOption)
  const dataDirOption = { text: t('pathTreeBreadcrumb.datadir'), value: dataDir }
  return props.noDatadir ? options : [dataDirOption, ...options]
})

const lastTreeOption = computed(() => last(treeOptions.value))
</script>

<template>
  <parent-overflow-entries
    :dropdown-button-icon="PhDotsThreeOutline"
    :dropdown-disabled="noLink || dropdownDisabled"
    :entries="treeOptions"
    class="path-tree-breadcrumb list-inline flex-grow-1 flex-shrink-1 m-0 text-truncate lh-1"
    dropdown-toggle-class="border-0 btn-sm"
    reverse
  >
    <template #entry="{ entry }">
      <path-tree-breadcrumb-entry
        :compact="compact"
        :no-link="noLink"
        :last="lastTreeOption.value === entry.value"
        @select="modelValue = entry.value"
      >
        {{ entry.text }}
      </path-tree-breadcrumb-entry>
    </template>
    <template #dropdown-entry="{ entry }">
      <path-tree-breadcrumb-dropdown-item
        :compact="compact"
        @click="modelValue = entry.value"
      >
        {{ entry.text }}
      </path-tree-breadcrumb-dropdown-item>
    </template>
    <template #separator>
      <phosphor-icon
        size="1em"
        :name="PhCaretRight"
        class="text-body-secondary px-1"
      />
    </template>
  </parent-overflow-entries>
</template>
