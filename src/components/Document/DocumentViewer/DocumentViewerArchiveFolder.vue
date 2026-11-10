<script setup>
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'

import PathTreeViewDocument from '@/components/PathTree/PathTreeView/PathTreeViewDocument'
import PathTreeViewEntry from '@/components/PathTree/PathTreeView/PathTreeViewEntry'
import PathTreeViewEntryMore from '@/components/PathTree/PathTreeView/PathTreeViewEntryMore'
import { ARCHIVE_PAGE_SIZE, toEntryKey } from '@/utils/archiveTree'

const props = defineProps({
  folder: {
    type: Object,
    required: true
  },
  openPaths: {
    type: Set,
    required: true
  },
  limits: {
    type: Map,
    default: () => new Map()
  },
  activeKeys: {
    type: Set,
    default: () => new Set()
  },
  level: {
    type: Number,
    default: 0
  },
  root: {
    type: Boolean
  }
})

const emit = defineEmits(['toggle', 'more'])

const { t } = useI18n()
const isInModal = inject('modal', false)

const folderKey = computed(() => toEntryKey({ type: 'folder', path: props.folder.path }))
const isOpen = computed(() => props.root || props.openPaths.has(props.folder.path))
const limit = computed(() => props.limits.get(props.folder.path) ?? ARCHIVE_PAGE_SIZE)
const visibleEntries = computed(() => props.folder.entries.slice(0, limit.value))
const remainingDocuments = computed(() => props.folder.entries.length - visibleEntries.value.length)
const nextPageSize = computed(() => Math.min(ARCHIVE_PAGE_SIZE, remainingDocuments.value))
const childLevel = computed(() => (props.root ? props.level : props.level + 1))

function documentKey(document) {
  return toEntryKey({ type: 'document', id: document.id })
}
</script>

<template>
  <path-tree-view-entry
    :name="folder.name"
    :path="folder.path"
    :collapse="!isOpen"
    :selected="activeKeys.has(folderKey)"
    :level="level"
    :no-header="root"
    :data-archive-entry="folderKey"
    no-link
    no-search-link
    no-stats
    @update:collapse="emit('toggle', folder.path)"
  >
    <template v-if="isOpen">
      <document-viewer-archive-folder
        v-for="child in folder.folders"
        :key="child.path"
        :folder="child"
        :open-paths="openPaths"
        :limits="limits"
        :active-keys="activeKeys"
        :level="childLevel"
        @toggle="emit('toggle', $event)"
        @more="emit('more', $event)"
      />
      <path-tree-view-document
        v-for="{ document, name } in visibleEntries"
        :key="document.id"
        :entry="document"
        :name="name"
        :selected="activeKeys.has(documentKey(document))"
        :level="childLevel"
        :data-archive-entry="documentKey(document)"
        :no-modal="isInModal"
      />
      <path-tree-view-entry-more
        v-if="remainingDocuments > 0"
        :level="childLevel"
        @click="emit('more', folder.path)"
      >
        {{ t('documentViewerArchive.more', { n: nextPageSize, left: remainingDocuments }) }}
      </path-tree-view-entry-more>
    </template>
  </path-tree-view-entry>
</template>
