<template>
  <search-bar-input-dropdown
    ref="inputDropdown"
    v-model="selectedProjects"
    class="project-dropdown-selector"
    :multiple="multiple"
    flush-items
    :class="{
      'project-dropdown-selector--multiple': hasMultipleProjects
    }"
    :disabled="disabled"
    :no-caret="noCaret"
    :options="options"
    :teleport-to="teleportTo"
    :teleport-disabled="teleportDisabled"
    @selected="reset"
    @hidden="$emit('hidden', $event)"
    @changed="$emit('changed', $event)"
  >
    <template #above="{ visible }">
      <project-dropdown-selector-search
        v-model="query"
        :autofocus="visible"
        :has-matches="hasMatches"
        @blur="resetFocus"
        @up="moveFocusUp"
        @down="moveFocusDown"
        @enter="selectFocusValue"
      />
      <project-dropdown-selector-all
        v-if="hasMatches && multiple"
        v-model="selectAll"
        @click.stop
      />
    </template>
    <template #button-content>
      <project-dropdown-selector-button-content
        :slice-size="sliceSize"
        :selected-projects="selectedProjects"
        :projects="projects"
      />
    </template>
    <template #dropdown-item="{ option: project, index, hasValue, toggleUniqueValue, toggleValue }">
      <project-dropdown-selector-entry
        :project="project"
        :focus="focusIndex === index"
        :selected="hasValue(project)"
        :no-checkbox="!multiple"
        @toggle-value="toggleValue($event, project)"
        @toggle-unique-value="toggleUniqueValue($event, project)"
      />
    </template>
  </search-bar-input-dropdown>
</template>

<script>
import { compact, find, isArray, trim } from 'lodash'

import ProjectDropdownSelectorAll from './ProjectDropdownSelectorAll'
import ProjectDropdownSelectorButtonContent from './ProjectDropdownSelectorButtonContent'
import ProjectDropdownSelectorEntry from './ProjectDropdownSelectorEntry'
import ProjectDropdownSelectorSearch from './ProjectDropdownSelectorSearch'

import SearchBarInputDropdown from '@/components/Search/SearchBar/SearchBarInputDropdown'
import { iwildcardMatch } from '@/utils/strings'

export default {
  name: 'ProjectDropdownSelector',
  components: {
    ProjectDropdownSelectorAll,
    ProjectDropdownSelectorButtonContent,
    ProjectDropdownSelectorEntry,
    ProjectDropdownSelectorSearch,
    SearchBarInputDropdown
  },
  props: {
    /**
     * List of selected projects (multiple selection), or object (single selection)
     */
    modelValue: {
      type: [Array, Object],
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
    },
    /**
     * Teleport the dropdown to a different element.
     */
    teleportTo: {
      type: [String, Object],
      default: 'body'
    },
    /**
     * Disable teleporting the dropdown to a different element.
     */
    teleportDisabled: {
      type: Boolean
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
      return !this.hasQuery || this.options.length > 0
    },
    hasQuery() {
      return !!this.query
    },
    wildcardQuery() {
      if (this.hasQuery) {
        // This ensures the query ends and starts
        // with one (and only one) wildcard
        return '*' + trim(this.query, '*') + '*'
      }
      return '*'
    },
    multiple() {
      return isArray(this.modelValue)
    },
    selectedProjects: {
      get() {
        if (!this.multiple) {
          return [this.modelValue]
        }
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
    options() {
      return this.projects.filter(({ label = '', name = '' } = {}) => {
        return iwildcardMatch(label, this.wildcardQuery) || iwildcardMatch(name, this.wildcardQuery)
      })
    },
    hasMultipleProjects() {
      return this.selectedProjects?.length > 1
    },
    selectAll: {
      get() {
        return this.selectedProjects?.length === this.projects.length
      },
      set(value) {
        this.selectedProjects = value ? this.projects : this.projects.slice(0, 1)
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
    --bs-btn-border-color: var(--bs-light);
    --bs-btn-bg: var(--bs-body-bg);
    --bs-btn-hover-bg: var(--bs-btn-bg);
    --bs-btn-hover-color: var(--bs-btn-color);
    --bs-btn-hover-border-color: var(--bs-primary);
    --bs-btn-disabled-bg: var(--bs-btn-bg);
    --bs-btn-disabled-color: var(--bs-btn-color);
    --bs-btn-disabled-border-color: var(--bs-btn-border-color);
    --bs-btn-active-color: var(--bs-btn-color);
    --bs-btn-active-bg: rgba(var(--bs-body-color-rgb), 0.2);
    --bs-btn-active-border-color: var(--bs-light);
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
