<script setup>
import { computed } from 'vue'

import ProjectDropdownSelectorCheckbox from './ProjectDropdownSelectorCheckbox'

import ProjectLabel from '@/components/Project/ProjectLabel'

const props = defineProps({
  project: {
    type: Object
  },
  focus: {
    type: Boolean
  },
  selected: {
    type: Boolean
  },
  noCheckbox: {
    type: Boolean
  }
})

const select = ($event) => {
  if (props.noCheckbox) {
    return emit('toggleUniqueValue', $event)
  }
  return emit('toggleValue', $event)
}

const classList = computed(() => {
  return {
    'project-dropdown-selector-entry--focus': props.focus
  }
})

const emit = defineEmits(['toggleValue', 'toggleUniqueValue'])
</script>

<template>
  <div
    class="project-dropdown-selector-entry rounded"
    :class="classList"
    @click="select($event)"
  >
    <project-dropdown-selector-checkbox
      v-if="!noCheckbox"
      :model-value="selected"
    />
    <project-label
      class="pe-1 py-2"
      no-caption
      :project="project"
    />
  </div>
</template>

<style lang="scss">
.project-dropdown-selector-entry {
  display: flex;
  align-items: center;

  &--focus,
  .dropdown-item:focus-visible &,
  .dropdown-item:focus & {
    position: relative;
    color: $dropdown-link-hover-color;
    background: $dropdown-link-hover-bg;
    text-decoration: none;
    box-shadow: $focus-ring-box-shadow;
    outline: 0;
  }

  .dropdown-item:focus-visible,
  .dropdown-item:focus {
    outline: 0;
  }
}
</style>
