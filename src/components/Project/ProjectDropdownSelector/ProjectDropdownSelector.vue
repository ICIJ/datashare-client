<template>
  <search-bar-input-dropdown
    ref="inputDropdown"
    v-model="selectedProjects"
    class="project-dropdown-selector"
    multiple
    flush-items
    :class="{
      'project-dropdown-selector--multiple': hasMultipleProjects,
      'project-dropdown-selector--sliced': hasSlicedProjects
    }"
    :disabled="disabled"
    :no-caret="noCaret"
    :options="options"
    @selected="reset"
    @hidden="$emit('hidden', $event)"
    @changed="$emit('changed', $event)"
  >
    <template #above="{ visible }">
      <project-dropdown-selector-search
        v-if="visible"
        v-model="query"
        :has-matches="hasMatches"
        @blur="resetFocus"
        @up="moveFocusUp"
        @down="moveFocusDown"
        @enter="selectFocusValue"
      />
      <project-dropdown-selector-all v-if="hasMatches" v-model="selectAll" />
    </template>
    <template #button-content>
      <project-dropdown-selector-button-content :projects="slicedProjects" />
    </template>
    <template #dropdown-item="{ option, index, hasValue, toggleUniqueValue, toggleValue }">
      <project-dropdown-selector-entry
        :project="option"
        :focus="focusIndex === index"
        :selected="hasValue(option)"
        @toggleValue="toggleValue($event, option)"
        @toggleUniqueValue="toggleUniqueValue($event, option)"
      />
    </template>
  </search-bar-input-dropdown>
</template>

<script>
import { compact, find, iteratee, trim } from 'lodash'

import ProjectDropdownSelectorAll from './ProjectDropdownSelectorAll'
import ProjectDropdownSelectorButtonContent from './ProjectDropdownSelectorButtonContent'
import ProjectDropdownSelectorEntry from './ProjectDropdownSelectorEntry'
import ProjectDropdownSelectorSearch from './ProjectDropdownSelectorSearch'

import SearchBarInputDropdown from '@/components/SearchBarInputDropdown'
import { iwildcardMatch } from '@/utils/strings'

export default {
  name: 'SearchBarInputDropdownForProjects',
  components: {
    ProjectDropdownSelectorAll,
    ProjectDropdownSelectorButtonContent,
    ProjectDropdownSelectorEntry,
    ProjectDropdownSelectorSearch,
    SearchBarInputDropdown
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
     * Limit the number of visible project thumbnails
     */
    sliceSize: {
      type: Number,
      default: 3
    },
    /**
     * The dropdown toggler must be disabled.
     */
    disabled: {
      type: Boolean
    },
    /**
     * The caret in the dropdown toggler must be hidden.
     */
    noCaret: {
      type: Boolean
    },
    /**
     * List of projects
     */
    projects: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      query: null,
      focusIndex: -1
    }
  },
  computed: {
    hasMatches() {
      return !this.hasQuery || this.options.length
    },
    hasQuery() {
      return !!this.query
    },
    wildcardQuery() {
      if (this.hasQuery) {
        // This ensure the query ends and starts
        // with one (and only one) wildcard
        return '*' + trim(this.query, '*') + '*'
      }
      return '*'
    },
    valueNames() {
      return this.modelValue.map(iteratee('name'))
    },
    selectedProjects: {
      get() {
        return compact(
          this.modelValue.map(({ name }) => {
            return find(this.projects, { name })
          })
        )
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    slicedProjects() {
      return this.selectedProjects.slice(0, this.sliceSize + 1)
    },
    options() {
      return this.projects.filter(({ label = '', name = '' } = {}) => {
        return iwildcardMatch(label, this.wildcardQuery) || iwildcardMatch(name, this.wildcardQuery)
      })
    },
    hasMultipleProjects() {
      return this.selectedProjects.length > 1
    },
    hasSlicedProjects() {
      return this.selectedProjects.length > this.sliceSize
    },
    selectAll: {
      get() {
        return this.selectedProjects.length === this.projects.length
      },
      set(value) {
        this.selectedProjects = value ? this.projects : []
      }
    }
  },
  watch: {
    query() {
      this.focusIndex = this.query && this.options.length ? 0 : -1
    }
  },
  methods: {
    moveFocusUp() {
      this.focusIndex = Math.max(-1, this.focusIndex - 1)
      this.moveFocusIntoView()
    },
    moveFocusDown() {
      this.focusIndex = Math.min(this.options.length - 1, this.focusIndex + 1)
      this.moveFocusIntoView()
    },
    async moveFocusIntoView() {
      await this.$nextTick()
      const selector = '.project-dropdown-selector__item--focus'
      const options = { behavior: 'instant', block: 'end' }
      this.$el.querySelector(selector)?.scrollIntoView(false, options)
    },
    selectFocusValue($event) {
      if (this.focusIndex > -1) {
        this.$refs.inputDropdown.toggleUniqueValue($event, this.options[this.focusIndex])
        this.$refs.inputDropdown.hide()
      }
    },
    resetFocus() {
      this.focusIndex = -1
    },
    resetQuery() {
      this.query = null
    },
    reset() {
      this.resetFocus()
      this.resetQuery()
    }
  }
}
</script>

<style lang="scss" scoped>
.project-dropdown-selector {
  &:deep(.btn.dropdown-toggle) {
    --bs-btn-color: var(--bs-body-color);
    --bs-btn-border-color: var(--bs-lighter);
    --bs-btn-bg: var(--bs-body-bg);
    --bs-btn-hover-bg: var(--bs-btn-bg);
    --bs-btn-hover-color: var(--bs-btn-color);
    --bs-btn-hover-border-color: var(--bs-secondary);
    --bs-btn-disabled-bg: var(--bs-btn-bg);
    --bs-btn-disabled-color: var(--bs-btn-color);
    --bs-btn-disabled-border-color: var(--bs-btn-border-color);
    --bs-btn-active-color: var(--bs-btn-color);
    --bs-btn-active-bg: rgba(var(--bs-body-color-rgb), 0.2);
    --bs-btn-active-border-color: var(--bs-lighter);
  }

  .dropdown-item:focus-visible &:deep(.project-dropdown-selector-entry),
  .dropdown-item:focus &:deep(.project-dropdown-selector-entry) {
    position: relative;
    color: $dropdown-link-hover-color;
    background: $dropdown-link-hover-bg;
    text-decoration: none;
    box-shadow: $focus-ring-box-shadow;
    outline: 0;
  }

  .dropdown-item:focus-visible,
  .dropdown-item:focus {
    outline: 0;
  }
}
</style>
