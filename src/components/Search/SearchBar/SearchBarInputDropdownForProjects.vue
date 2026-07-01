<template>
  <project-dropdown-selector
    v-model="selectedProjects"
    placement="bottom-end"
    :disabled="disabled"
    :projects="projects"
  />
</template>

<script setup>
import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelector'
import { useSelectedProjects } from '@/composables/useSelectedProjects'

defineOptions({ name: 'SearchBarInputDropdownForProjects' })

const modelValue = defineModel({
  type: [Array, Object],
  default: () => []
})

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  fallbackDefault: {
    type: Boolean,
    default: false
  }
})

const { projects, selectedProjects } = useSelectedProjects(modelValue, { fallbackDefault: props.fallbackDefault })
</script>
