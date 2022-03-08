<template>
  <b-form-group class="mb-0">
    <b-form-checkbox-group
      :options="projectOptions"
      v-if="multiple"
      v-model="selectedProject" />
    <b-form-select
      :options="projectOptions"
      :size="size"
      v-else
      v-model="selectedProject" />
  </b-form-group>
</template>

<script>
import { compact, castArray, isEqual, startCase, uniq } from 'lodash'

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
      const defaultProject = this.$config.get('defaultProject')
      const projects = this.$config.get('groups_by_applications.datashare', [])
      return compact(uniq([...projects, defaultProject]).sort())
    },
    projectOptions () {
      return this.projects.map(value => {
        const text = startCase(value)
        const disabled = this.multiple && isEqual(this.selectedProject, [value])
        return { disabled, text, value }
      })
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
