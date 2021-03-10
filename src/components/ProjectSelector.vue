<template>
  <b-form-select :options="projects" v-model="selectedProject" :size="size"></b-form-select>
</template>

<script>
import compact from 'lodash/compact'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import uniq from 'lodash/uniq'

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
      type: String,
      required: true
    },
    /**
     * Select size
     * @values sm, md, lg
     */
    size: {
      type: String,
      default: 'md'
    }
  },
  computed: {
    projects () {
      const defaultProjects = [this.$config.get('defaultProject')]
      // @depracated this load the list from a depracated list of project for retro-compatibility
      const legacyProjects = this.$config.get('datashare_projects', defaultProjects)
      const projects = this.$config.get('groups_by_applications.datashare', defaultProjects)
      const sortedProjects = compact(uniq([...projects, ...legacyProjects]).sort())
      return sortedProjects.map(value => ({ value, text: value }))
    },
    selectedProject: {
      get () {
        return isEmpty(this.value) ? get(this.projects, [0, 'value'], '') : this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    }
  }
}
</script>
