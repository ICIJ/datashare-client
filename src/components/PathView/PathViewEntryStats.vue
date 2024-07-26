<script setup>
import PathViewEntryStatsDocuments from './PathViewEntryStatsDocuments'
import PathViewEntryStatsDirectories from './PathViewEntryStatsDirectories'
import PathViewEntryStatsSize from './PathViewEntryStatsSize'

defineProps({
  documents: {
    type: Number,
    default: 0
  },
  directories: {
    type: Number,
    default: 0
  },
  size: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean
  }
})
</script>

<template>
  <div class="path-view-entry-stats d-flex gap-2 text-nowrap">
    <path-view-entry-stats-documents :value="documents" :active="active" />
    <path-view-entry-stats-directories :value="directories" />
    <path-view-entry-stats-size :value="size" class="ms-auto" />
  </div>
</template>

<style>
.path-view-entry-stats {
  max-width: 260px;
  width: 100%;
}
</style>
