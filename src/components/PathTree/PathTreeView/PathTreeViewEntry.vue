<script setup>
import { computed, inject, ref } from 'vue'

import PathTreeViewEntryName from './PathTreeViewEntryName'

const props = defineProps({
  collapse: {
    type: Boolean
  },
  selected: {
    type: Boolean
  },
  indeterminate: {
    type: Boolean
  },
  name: {
    type: String
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
  }
})

const active = ref(false)

const classList = computed(() => {
  return {
    'path-tree-view-entry--active': active.value,
    'path-tree-view-entry--selected': props.selected,
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
        :collapse="collapse"
        :compact="compactOrInjected"
        :selected="selected"
        :indeterminate="indeterminate"
        :name="name"
        :loading="loading"
        :select-mode="selectModeOrInjected"
        @update:collapse="$emit('update:collapse', $event)"
        @update:selected="$emit('update:selected', $event)"
        @update:indeterminate="$emit('update:indeterminate', $event)"
      >
        <slot name="name" />
      </path-tree-view-entry-name>
      <path-tree-view-entry-stats
        class="ms-auto"
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
