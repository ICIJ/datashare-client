<template>
  <project-dropdown-selector
    :projects="projects"
    :model-value="selectedProjects"
    :multiple="multiple"
    @update:model-value="selectedProjects = $event"
  />
</template>

<script>
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
    },
    /**
     * Select one or multiple
     */
    multiple: {
      type: Boolean
    }
  },
  computed: {
    projects() {
      return this.$core.projects
    },
    selectedProjects: {
      get() {
        if (!this.multiple) {
          return [this.modelValue]
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
