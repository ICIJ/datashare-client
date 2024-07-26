<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { PhFolder, PhFolderOpen } from '@phosphor-icons/vue'

import PathViewEntryNameCaret from './PathViewEntryNameCaret'
import PathViewEntryNameCheckbox from './PathViewEntryNameCheckbox'

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
    type: Boolean
  }
})

const icon = computed(() => (props.collapse ? PhFolder : PhFolderOpen))

const classList = computed(() => ({
  'path-view-entry-name--collapse': props.collapse
}))

const emit = defineEmits(['update:collapse'])

const toggle = () => {
  emit('update:collapse', !props.collapse)
}
</script>

<template>
  <div class="path-view-entry-name d-flex gap-2 align-items-center flex-truncate w-100" :class="classList">
    <path-view-entry-name-caret :collapse="collapse" class="flex-shrink-0" @click="toggle" />
    <path-view-entry-name-checkbox
      v-if="selectMode"
      class="flex-shrink-0"
      :model-value="selected"
      :indeterminate="indeterminate"
      @update:modelValue="emit('update:selected', $event)"
      @update:indeterminate="emit('update:indeterminate', $event)"
    />
    <slot v-bind="{ toggle, icon, name }">
      <div class="text-truncate" @click="toggle">
        <phosphor-icon :name="icon" class="path-view-entry-name__icon" />
        {{ name }}
      </div>
    </slot>
  </div>
</template>
