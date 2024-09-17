<script setup>
import { computed, inject } from 'vue'

import PathViewEntryStatsDocuments from './PathViewEntryStatsDocuments'
import PathViewEntryStatsDirectories from './PathViewEntryStatsDirectories'
import PathViewEntryStatsSize from './PathViewEntryStatsSize'

const props = defineProps({
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
  }
})

const compactOrInjected = computed(() => props.compact ?? inject('compact', false))

const classList = computed(() => {
  return {
    'path-view-entry-stats--active': props.active,
    'path-view-entry-stats--selected': props.selected,
    'path-view-entry-stats--compact': compactOrInjected.value
  }
})
</script>

<template>
  <div class="path-view-entry-stats d-flex gap-2 text-nowrap" :class="classList">
    <path-view-entry-stats-documents :value="documents" :active="active" :compact="compactOrInjected" />
    <template v-if="!compactOrInjected">
      <path-view-entry-stats-directories :value="directories" :active="active" :compact="compactOrInjected" />
      <path-view-entry-stats-size :value="size" class="ms-auto" :active="active" :compact="compactOrInjected" />
    </template>
  </div>
</template>

<style lang="scss">
.path-view-entry-stats {
  font-variant-numeric: tabular-nums;
  color: var(--bs-secondary-color);

  &--selected:not(.path-view-entry-stats--compact) {
    color: var(--bs-white);
  }

  &:not(.path-view-entry-stats--compact) {
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
