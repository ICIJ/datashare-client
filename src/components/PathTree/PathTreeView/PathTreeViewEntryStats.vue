<script setup>
import { computed, inject } from 'vue'

import PathTreeViewEntryStatsDocuments from './PathTreeViewEntryStatsDocuments'
import PathTreeViewEntryStatsDirectories from './PathTreeViewEntryStatsDirectories'
import PathTreeViewEntryStatsSize from './PathTreeViewEntryStatsSize'

const props = defineProps({
  path: {
    type: String
  },
  projects: {
    type: Array,
    default: () => []
  },
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
  selected: {
    type: Boolean
  },
  active: {
    type: Boolean
  },
  compact: {
    type: Boolean,
    default: null
  },
  noLink: {
    type: Boolean
  }
})

const compactOrInjected = computed(() => props.compact ?? inject('compact', false))

const classList = computed(() => {
  return {
    'path-tree-view-entry-stats--active': props.active,
    'path-tree-view-entry-stats--selected': props.selected,
    'path-tree-view-entry-stats--compact': compactOrInjected.value
  }
})
</script>

<template>
  <div class="path-tree-view-entry-stats d-flex gap-2 text-nowrap" :class="classList">
    <path-tree-view-entry-stats-documents
      :active="active"
      :compact="compactOrInjected"
      :no-link="noLink"
      :path="path"
      :projects="projects"
      :value="documents"
    />
    <template v-if="!compactOrInjected">
      <path-tree-view-entry-stats-directories :value="directories" :active="active" :compact="compactOrInjected" />
      <path-tree-view-entry-stats-size :value="size" class="ms-auto" :active="active" :compact="compactOrInjected" />
    </template>
  </div>
</template>

<style lang="scss">
.path-tree-view-entry-stats {
  font-variant-numeric: tabular-nums;
  color: var(--bs-secondary-color);

  &--selected:not(.path-tree-view-entry-stats--compact) {
    color: var(--bs-white);
  }

  &:not(.path-tree-view-entry-stats--compact) {
    max-width: 300px;
    flex: 300px 0 0;
    width: 100%;

    @include media-breakpoint-down(md) {
      max-width: 260px;
      flex: 1 0 0;
      width: auto;
    }
  }
}
</style>
