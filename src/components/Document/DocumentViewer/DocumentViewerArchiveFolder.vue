<script setup>
import PathTreeViewDocument from '@/components/PathTree/PathTreeView/PathTreeViewDocument'
import PathTreeViewEntry from '@/components/PathTree/PathTreeView/PathTreeViewEntry'

defineProps({
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
  }
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <path-tree-view-entry
    :name="folder.name"
    :path="folder.path"
    :documents="folder.documents.length"
    :collapse="!openPaths.includes(folder.path)"
    :level="level"
    compact
    no-link
    no-search-link
    no-stats
    @update:collapse="emit('toggle', folder.path)"
  >
    <template v-if="openPaths.includes(folder.path)">
      <document-viewer-archive-folder
        v-for="child in folder.folders"
        :key="child.path"
        :folder="child"
        :open-paths="openPaths"
        :level="level + 1"
        @toggle="emit('toggle', $event)"
      />
      <path-tree-view-document
        v-for="document in folder.documents"
        :key="document.id"
        :entry="document"
        :level="level + 1"
        compact
      />
    </template>
  </path-tree-view-entry>
</template>
