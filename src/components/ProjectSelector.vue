<template>
  <b-form-select :options="projects" v-model="selectedProject" :size="size"></b-form-select>
</template>

<script>
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'

export default {
  name: 'ProjectSelector',
  props: {
    value: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: 'md'
    }
  },
  computed: {
    projects () {
      const defaultProjects = [this.$config.get('defaultProject')]
      const projects = [...this.$config.get('datashare_projects', defaultProjects)].sort()
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
