<template>
  <project-dropdown-selector
    :projects="projects"
    :model-value="selectedProjects"
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
     * List of selected projects
     */
    modelValue: {
      type: Array,
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
    selectedProjects: {
      get() {
        return this.modelValue.filter(({ name }) => !!this.$core.findProject(name))
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script>
