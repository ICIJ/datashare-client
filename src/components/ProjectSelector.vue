<template>
  <b-form-group class="mb-0">
    <b-form-checkbox-group
      :options="projects"
      v-if="multiple"
      v-model="selectedProject" />
    <b-form-select
      :options="projects"
      :size="size"
      v-else
      v-model="selectedProject" />
  </b-form-group>
</template>

<script>
import { compact, castArray, get, uniq } from 'lodash'

/**
 * A single-project selector input.
 */
export default {
  name: 'ProjectSelector',
  props: {
    /**
     * The selected project value.
     * @model
     */
    value: {
      type: [String, Array],
      required: true
    },
    /**
     * Select size
     * @values sm, md, lg
     */
    size: {
      type: String,
      default: 'md'
    },
    /**
     * Allow to select several projects
     */
    multiple: {
      type: Boolean
    }
  },
  computed: {
    projects () {
      const defaultProjects = [this.$config.get('defaultProject')]
      // @DEPRECATED this load the list from a depracated list of project for retro-compatibility
      const legacyProjects = this.$config.get('datashare_projects', defaultProjects)
      const projects = this.$config.get('groups_by_applications.datashare', defaultProjects)
      const sortedProjects = compact(uniq([...projects, ...legacyProjects, defaultProjects]).sort())
      return sortedProjects.map(value => ({ value, text: value }))
    },
    firstProject () {
      return get(this.projects, '0.value', null)
    },
    selectedProject: {
      get () {
        return this.multiple ? castArray(this.value) : this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    }
  }
}
</script>
