<template>
  <b-form-select :options="projects" v-model="selectedProject" :size="size"></b-form-select>
</template>

<script>
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'

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
      const projects = [...this.$config.get('groups_by_applications.datashare', defaultProjects)].sort()
      return map(projects.sort(), value => ({ value, text: value }))
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
