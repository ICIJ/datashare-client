<template>
  <b-form-group class="mb-0">
    <b-form-checkbox-group
      :disabled="disabled"
      :options="projectOptions"
      v-if="multiple"
      v-model="selectedProject" />
    <b-form-select
      :disabled="disabled"
      :options="projectOptions"
      :size="size"
      v-else
      v-model="selectedProject" />
  </b-form-group>
</template>

<script>
import { castArray, isEqual, startCase } from 'lodash'

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
    },
    /**
     * Disable the input
     */
    disabled: {
      type: Boolean
    }
  },
  computed: {
    projects () {
      return this.$core.projects
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
