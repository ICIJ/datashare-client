<script setup>
import { computed, inject } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { PhFolder, PhFolderOpen } from '@phosphor-icons/vue'

import PathViewEntryNameCaret from './PathViewEntryNameCaret'
import PathViewEntryNameCheckbox from './PathViewEntryNameCheckbox'

const props = defineProps({
  collapse: {
    type: Boolean
  },
  compact: {
    type: Boolean,
    default: null
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
    type: Boolean
  }
})

const icon = computed(() => (props.collapse ? PhFolder : PhFolderOpen))

const classList = computed(() => ({
  'path-view-entry-name--collapse': props.collapse,
  'path-view-entry-name--compact': compactOrInjected.value,
  'path-view-entry-name--selected': props.selected
}))

const selectModeOrInjected = computed(() => props.selectMode ?? inject('selectMode', false))
const compactOrInjected = computed(() => props.compact ?? inject('compact', false))

const emit = defineEmits(['update:collapse'])

const toggle = () => {
  emit('update:collapse', !props.collapse)
}
</script>

<template>
  <div class="path-view-entry-name d-flex gap-2 align-items-center flex-truncate w-100" :class="classList">
    <path-view-entry-name-caret :collapse="collapse" class="flex-shrink-0" @click="toggle" />
    <path-view-entry-name-checkbox
      v-if="selectModeOrInjected"
      class="flex-shrink-0"
      :model-value="selected"
      :indeterminate="indeterminate"
      @update:modelValue="emit('update:selected', $event)"
      @update:indeterminate="emit('update:indeterminate', $event)"
    />
    <slot v-bind="{ toggle, icon, name, compactOrInjected }">
      <div class="path-view-entry-name__value text-truncate" @click="toggle">
        <phosphor-icon v-if="!compactOrInjected" :name="icon" />
        {{ name }}
      </div>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.path-view-entry-name {
  &--compact.path-view-entry-name--selected {
    font-weight: 500;
    color: var(--bs-action-text-emphasis);
  }
}
</style>
