<script setup>
import { computed, inject, ref } from 'vue'

import PathTreeViewEntryName from './PathTreeViewEntryName'
import PathTreeViewEntryStats from './PathTreeViewEntryStats'

const collapse = defineModel('collapse', { type: Boolean })
const selected = defineModel('selected', { type: Boolean })
const indeterminate = defineModel('indeterminate', { type: Boolean })

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String
  },
  projects: {
    type: Array,
    default: () => []
  },
  selectMode: {
    type: Boolean,
    default: null
  },
  compact: {
    type: Boolean,
    default: null
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
  noHeader: {
    type: Boolean
  },
  loading: {
    type: Boolean
  },
  noStats: {
    type: Boolean
  },
  noLink: {
    type: Boolean
  },
  nested: {
    type: Boolean
  }
})

const active = ref(false)

const classList = computed(() => {
  return {
    'path-tree-view-entry--active': active.value,
    'path-tree-view-entry--selected': selected.value,
    'path-tree-view-entry--compact': compactOrInjected.value
  }
})

const selectModeOrInjected = computed(() => props.selectMode ?? inject('selectMode', false))
const compactOrInjected = computed(() => props.compact ?? inject('compact', false))
</script>

<template>
  <div class="path-tree-view-entry" :class="classList">
    <div
      v-if="!noHeader"
      class="d-flex align-items-center path-tree-view-entry__header"
      @mouseenter="active = true"
      @mouseleave="active = false"
    >
      <path-tree-view-entry-name
        v-model:collapse="collapse"
        v-model:selected="selected"
        v-model:indeterminate="indeterminate"
        :compact="compactOrInjected"
        :name="name"
        :loading="loading"
        :select-mode="selectModeOrInjected"
        :nested="nested"
      >
        <slot name="name" />
      </path-tree-view-entry-name>
      <path-tree-view-entry-stats
        v-if="!noStats"
        class="ms-auto"
        :path="path"
        :projects="projects"
        :no-link="noLink"
        :compact="compactOrInjected"
        :documents="documents"
        :directories="directories"
        :size="size"
        :selected="selected"
        :active="compactOrInjected ? selected : active"
      />
    </div>
    <b-collapse :model-value="!collapse" class="path-tree-view-entry__subdirectories">
      <slot v-bind="{ collapse, selected, active }" />
    </b-collapse>
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view-entry {
  &__header {
    border-radius: var(--bs-border-radius);
    padding: $spacer-sm $spacer;

    .path-tree-view-entry--compact & {
      padding: 2px 0;
    }
  }

  &:deep(.path-tree-view-entry__subdirectories) {
    padding-left: $spacer;
  }

  &--compact:deep(.path-tree-view-entry__subdirectories) {
    padding-left: $spacer-xs;
  }

  &--active:not(&--compact) > &__header {
    background: var(--bs-tertiary-bg-subtle);
  }

  &--selected:not(&--compact) > &__header {
    background: var(--bs-action);
    color: var(--bs-white);
  }
}
</style>
