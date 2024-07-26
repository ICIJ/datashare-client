<script setup>
import { computed, inject, ref } from 'vue'
import { compact } from 'lodash'

import PathViewEntryName from './PathViewEntryName'

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
  }
})

const active = ref(false)

const classList = computed(() => {
  return {
    'path-view-entry--active': active.value,
    'path-view-entry--selected': props.selected,
    'path-view-entry--compact': compactOrInjected.value
  }
})

const selectModeOrInjected = computed(() => props.selectMode ?? inject('selectMode', false))
const compactOrInjected = computed(() => props.compact ?? inject('compact', false))
</script>

<template>
  <div class="path-view-entry" :class="classList">
    <div
      class="d-flex align-items-center path-view-entry__header"
      @mouseenter="active = true"
      @mouseleave="active = false"
    >
      <path-view-entry-name
        :collapse="collapse"
        :compact="compactOrInjected"
        :selected="selected"
        :indeterminate="indeterminate"
        :name="name"
        :select-mode="selectModeOrInjected"
        @update:collapse="$emit('update:collapse', $event)"
        @update:selected="$emit('update:selected', $event)"
        @update:indeterminate="$emit('update:indeterminate', $event)"
      >
        <slot name="name" />
      </path-view-entry-name>
      <path-view-entry-stats
        class="ms-auto"
        :compact="compactOrInjected"
        :documents="documents"
        :directories="directories"
        :size="size"
        :active="compactOrInjected ? selected : active"
      />
    </div>
    <b-collapse :model-value="!collapse" class="path-view-entry__subdirectories">
      <slot />
    </b-collapse>
  </div>
</template>

<style lang="scss" scoped>
.path-view-entry {
  &__header {
    border-radius: var(--bs-border-radius);
    padding: $spacer-sm $spacer;

    .path-view-entry--compact & {
      padding: 2px 0;
    }
  }

  &:deep(.path-view-entry__subdirectories) {
    padding-left: $spacer;
  }

  &--compact:deep(.path-view-entry__subdirectories) {
    padding-left: $spacer-xs;
  }

  &--active:not(&--compact) > &__header {
    background: var(--bs-tertiary-bg-subtle);
  }

  &--selected:not(&--compact) &__header,
  &:not(&--compact):has(.path-view-entry--selected) &__header {
    box-shadow: 0 0 0 1px var(--bs-primary) inset;
  }
}
</style>
