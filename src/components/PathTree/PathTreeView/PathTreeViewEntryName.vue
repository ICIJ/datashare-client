<script setup>
import { computed, inject } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { PhFolder, PhFolderOpen } from '@phosphor-icons/vue'

import PathTreeViewEntryNameCaret from './PathTreeViewEntryNameCaret'
import PathTreeViewEntryNameCheckbox from './PathTreeViewEntryNameCheckbox'

const collapse = defineModel('collapse', { type: Boolean })
const selected = defineModel('selected', { type: Boolean })
const indeterminate = defineModel('indeterminate', { type: Boolean })

const props = defineProps({
  compact: {
    type: Boolean,
    default: null
  },
  name: {
    type: String
  },
  selectMode: {
    type: Boolean
  },
  loading: {
    type: Boolean
  },
  nested: {
    type: Boolean
  },
  level: {
    type: Number,
    default: 0
  }
})

const icon = computed(() => (collapse.value ? PhFolder : PhFolderOpen))

const classList = computed(() => ({
  'path-tree-view-entry-name--collapse': collapse.value,
  'path-tree-view-entry-name--compact': compactOrInjected.value,
  'path-tree-view-entry-name--selected': selected.value
}))

const style = computed(() => ({
  '--level-indent-factor': props.level
}))

const selectModeOrInjected = computed(() => props.selectMode ?? inject('selectMode', false))
const compactOrInjected = computed(() => props.compact ?? inject('compact', false))

const toggle = () => {
  collapse.value = !collapse.value
}
</script>

<template>
  <div
    class="path-tree-view-entry-name d-flex gap-1 align-items-center flex-truncate w-100"
    :class="classList"
    :style="style"
  >
    <path-tree-view-entry-name-caret
      v-if="nested"
      :collapse="collapse"
      :loading="loading"
      class="flex-shrink-0"
      @click="toggle"
    />
    <path-tree-view-entry-name-checkbox
      v-if="selectModeOrInjected"
      v-model="selected"
      v-model:indeterminate="indeterminate"
      class="flex-shrink-0 above-stretched-link"
    />
    <slot v-bind="{ toggle, icon, name, compactOrInjected }">
      <div class="path-tree-view-entry-name__value text-truncate stretched-link" @click="toggle">
        <phosphor-icon v-if="!compactOrInjected" :name="icon" />
        {{ name }}
      </div>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view-entry-name {
  --level-indent-width: #{$spacer};
  --level-indent-factor: 0;

  margin-left: calc(var(--level-indent-width) * var(--level-indent-factor));

  &--compact {
    --level-indent-width: #{$spacer-xs};
  }

  &--compact.path-tree-view-entry-name--selected {
    font-weight: 500;
    color: var(--bs-action-text-emphasis);
  }
}
</style>
