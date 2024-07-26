<script setup>
import { computed, inject, ref } from 'vue'

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
    'path-view-entry--selected': props.selected
  }
})

const selectModeOrInjected = computed(() => props.selectMode ?? inject('selectMode', false))
</script>

<template>
  <div class="path-view-entry" :class="classList">
    <div
      class="d-flex align-items-center path-view-entry__header px-3 py-2"
      @mouseenter="active = true"
      @mouseleave="active = false"
    >
      <path-view-entry-name
        :collapse="collapse"
        :selected="selected"
        :indeterminate="indeterminate"
        :name="name"
        :select-mode="selectModeOrInjected"
        @update:collapse="$emit('update:collapse', $event)"
        @update:selected="$emit('update:selected', $event)"
        @update:indeterminate="$emit('update:indeterminate', $event)">
        <slot name="name" />
      </path-view-entry-name>
      <path-view-entry-stats
        class="ms-auto"
        :documents="documents"
        :directories="directories"
        :size="size"
        :active="active"
      />
    </div>
    <b-collapse :model-value="!collapse" class="ps-3">
      <slot />
    </b-collapse>
  </div>
</template>

<style lang="scss" scoped>
.path-view-entry {
  &--active > &__header {
    border-radius: var(--bs-border-radius);
    background: var(--bs-tertiary-bg-subtle);
  }

  &--selected,
  &:has(.path-view-entry--selected) {
    box-shadow: 0 0 0 1px var(--bs-primary) inset;
  }
}
</style>
