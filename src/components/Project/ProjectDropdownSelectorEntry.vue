<script setup>
import { computed } from 'vue'

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
  }
})

const classList = computed(() => {
  return {
    'project-dropdown-selector-entry--focus': props.focus
  }
})

const emit = defineEmits(['toggleValue', 'toggleUniqueValue'])
</script>

<template>
  <div class="project-dropdown-selector-entry d-flex align-items-center justify-self-center rounded" :class="classList">
    <div class="py-2 ps-1 pe-3">
      <b-form-checkbox :model-value="selected" @click="emit('toggleValue', $event)" />
    </div>
    <project-label class="pe-1 py-2" no-caption :project="project" @click="emit('toggleUniqueValue', $event)" />
  </div>
</template>

<style lang="scss">
.project-dropdown-selector-entry {
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
