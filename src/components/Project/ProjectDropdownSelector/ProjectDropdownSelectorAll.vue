<script setup>
import ProjectDropdownSelectorCheckbox from './ProjectDropdownSelectorCheckbox'

defineProps({
  modelValue: {
    type: Boolean
  }
})
</script>

<template>
  <li class="project-dropdown-selector-all">
    <project-dropdown-selector-checkbox
      :model-value="modelValue"
      :disabled="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      All projects
    </project-dropdown-selector-checkbox>
  </li>
</template>
