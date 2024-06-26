<template>
  <div class="project-selector">
    <b-form-group class="mb-0">
      <b-form-checkbox-group v-if="multiple" v-model="selectedProject" stacked :disabled="disabled">
        <div v-for="{ text, value } in projectOptions" :key="text" class="project-selector__item">
          <b-form-checkbox :value="value">
            {{ text }}
          </b-form-checkbox>
        </div>
      </b-form-checkbox-group>
      <b-form-select v-else v-model="selectedProject" :disabled="disabled" :options="projectOptions" :size="size" />
    </b-form-group>
    <div v-if="!hasMatches" class="p-2 text-center">
      {{ $t('projectSelector.noMatches') }}
    </div>
  </div>
</template>

<script>
import { castArray, isEqual, filter, startCase, trim, isEmpty } from 'lodash'

import { iwildcardMatch } from '../utils/strings'

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
    modelValue: {
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
    },
    /**
     * Filter projects using a query
     */
    query: {
      type: String
    }
  },
  computed: {
    hasMatches() {
      return !this.hasQuery || this.projects.length
    },
    hasQuery() {
      return !!this.query
    },
    wildcardQuery() {
      if (this.hasQuery) {
        // This ensure the query with one (and only one) wildcard
        return '*' + trim(this.query, '*') + '*'
      }
      return '*'
    },
    projects() {
      return filter(this.$core.projects, ({ label = '', name = '' } = {}) => {
        return iwildcardMatch(label, this.wildcardQuery) || iwildcardMatch(name, this.wildcardQuery)
      })
    },
    projectOptions() {
      return this.projects.map((project) => {
        const text = project.label || startCase(project.name)
        const value = project.name
        const disabled = this.multiple && isEqual(this.selectedProject, [value])
        return { disabled, text, value }
      })
    },
    selectedProject: {
      get() {
        return this.multiple ? castArray(this.modelValue) : this.modelValue
      },
      set(modelValue) {
        if (this.multiple && isEmpty(modelValue)) {
          this.$emit('update:modelValue', this.modelValue)
        } else {
          this.$emit('update:modelValue', modelValue)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.project-selector {
  &__item {
    padding: 0.25rem 0.75rem;
  }
}
</style>
