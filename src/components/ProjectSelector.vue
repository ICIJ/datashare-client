<template>
  <b-form-select :options="projects" v-model="selectedProject" class="border-0"></b-form-select>
</template>

<script>
import map from 'lodash/map'

export default {
  name: 'ProjectSelector',
  props: ['value'],
  computed: {
    projects () {
      const defaultProjects = [this.$config.get('defaultProject')]
      const projects = JSON.parse(this.$config.get('datashare_indices', 'null')) || defaultProjects
      return map(projects, value => ({ value, text: value }))
    },
    selectedProject: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    }
  }
}
</script>
