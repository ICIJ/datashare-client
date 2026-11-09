<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import PathTreeViewDocument from '@/components/PathTree/PathTreeView/PathTreeViewDocument'
import PathTreeViewEntry from '@/components/PathTree/PathTreeView/PathTreeViewEntry'
import PathTreeViewEntryMore from '@/components/PathTree/PathTreeView/PathTreeViewEntryMore'
import { getEntryName } from '@/utils/archiveTree'

const PER_PAGE = 50

const props = defineProps({
  folder: {
    type: Object,
    required: true
  },
  openPaths: {
    type: Array,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  root: {
    type: Boolean
  }
})

const emit = defineEmits(['toggle'])

const { t } = useI18n()

const limit = ref(PER_PAGE)

const isOpen = computed(() => props.root || props.openPaths.includes(props.folder.path))
const visibleDocuments = computed(() => props.folder.documents.slice(0, limit.value))
const remainingDocuments = computed(() => props.folder.documents.length - visibleDocuments.value.length)
const nextPageSize = computed(() => Math.min(PER_PAGE, remainingDocuments.value))

function showMore() {
  limit.value += PER_PAGE
}
</script>

<template>
  <path-tree-view-entry
    :name="folder.name"
    :path="folder.path"
    :collapse="!isOpen"
    :level="level"
    :no-header="root"
    compact
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
        :level="level + 1"
        @toggle="emit('toggle', $event)"
      />
      <path-tree-view-document
        v-for="document in visibleDocuments"
        :key="document.id"
        :entry="document"
        :name="getEntryName(document)"
        :level="level + 1"
        compact
        no-modal
      />
      <path-tree-view-entry-more
        v-if="remainingDocuments > 0"
        :level="level + 1"
        compact
        @click="showMore"
      >
        {{ t('documentViewerArchive.more', { n: nextPageSize, left: remainingDocuments }) }}
      </path-tree-view-entry-more>
    </template>
  </path-tree-view-entry>
</template>
