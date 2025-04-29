<template>
  <project-dropdown-selector v-model="selectedProjects" placement="bottom-end" :projects="projects" />
</template>

<script setup>
import { computed } from 'vue'
import { isArray } from 'lodash'

import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelector'
import { useCore } from '@/composables/useCore'

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

const { core } = useCore()
// Computed Properties
const projects = computed(() => core.projects)

const multiple = computed(() => isArray(modelValue.value))

const selectedProjects = computed({
  get: () => {
    if (!multiple.value) {
      const project = core.findProject(modelValue.value.name)
      if (props.fallbackDefault && !project) {
        return { name: core.getDefaultProject() }
      }
      return project
    }
    const filter = modelValue.value.filter(({ name }) => !!core.findProject(name))
    if (props.fallbackDefault && !filter.length) {
      return [{ name: core.getDefaultProject() }]
    }
    return filter
  },
  set: (value) => {
    modelValue.value = value
  }
})
</script>
