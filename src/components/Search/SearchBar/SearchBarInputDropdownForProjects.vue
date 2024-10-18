<template>
  <project-dropdown-selector
    :projects="projects"
    :model-value="selectedProjects"
    @update:model-value="selectedProjects = $event"
  />
</template>

<script>
import { isArray } from 'lodash'

import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelector'

export default {
  name: 'SearchBarInputDropdownForProjects',
  components: {
    ProjectDropdownSelector
  },
  props: {
    /**
     * List of selected projects or single project object
     */
    modelValue: {
      type: [Array, Object],
      default: () => []
    },
    /**
     * The dropdown toggler must be disabled.
     */
    disabled: {
      type: Boolean
    }
  },
  computed: {
    projects() {
      return this.$core.projects
    },
    multiple() {
      return isArray(this.modelValue)
    },
    selectedProjects: {
      get() {
        if (!this.multiple) {
          return this.$core.findProject(this.modelValue?.name)
        }
        return this.modelValue.filter(({ name }) => !!this.$core.findProject(name))
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script>
