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
      <li v-if="visible" class="project-dropdown-selector__query-input">
        <div class="b-dropdown-form pt-1 mb-3">
          <search-form-control
            v-model="query"
            autofocus
            shadow
            placeholder="Search projects..."
            :rounded="false"
            @blur="resetFocus"
            @up="moveFocusUp"
            @down="moveFocusDown"
            @enter="selectFocusValue"
          />
        </div>
        <div v-if="!hasMatches" class="text-center small text-muted pb-2">
          {{ $t('searchBarInputDropdownForProjects.noMatches') }}
        </div>
      </li>
    </template>
    <template #button-content>
      <span v-for="(project, p) in slicedProjects" :key="p" class="project-dropdown-selector__button-content__project">
        <project-thumbnail
          :project="project"
          no-caption
          width="1.2em"
          class="project-dropdown-selector__button-content__project__thumbnail rounded"
        />
        <template v-if="hasOneProject">
          <span class="ms-2">
            {{ project?.label || project?.name }}
          </span>
        </template>
        <template v-else-if="isLastProjectSlice(p)">
          <span class="ms-2">
            {{ $t('searchBarInputDropdownForProjects.projectsCount', selectedProjects.length) }}
          </span>
        </template>
      </span>
    </template>
    <template #dropdown-item="{ option: project, index, hasValue, toggleUniqueValue, toggleValue }">
      <span
        class="project-dropdown-selector__item d-flex align-items-center justify-self-center"
        :class="{ 'project-dropdown-selector__item--focus': index === focusIndex }"
      >
        <div class="py-2 ps-1 pe-3">
          <b-form-checkbox :model-value="hasValue(project)" @click="toggleValue($event, project)" />
        </div>
        <project-label class="pe-1 py-2" no-caption :project="project" @click="toggleUniqueValue($event, project)" />
      </span>
    </template>
  </search-bar-input-dropdown>
</template>

<script>
import { compact, find, iteratee, trim } from 'lodash'

import ProjectLabel from '@/components/Project/ProjectLabel'
import SearchBarInputDropdown from '@/components/SearchBarInputDropdown'
import SearchFormControl from '@/components/SearchFormControl'
import { iwildcardMatch } from '@/utils/strings'

export default {
  name: 'SearchBarInputDropdownForProjects',
  components: {
    ProjectLabel,
    SearchBarInputDropdown,
    SearchFormControl
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
    hasOneProject() {
      return this.selectedProjects.length === 1
    },
    hasMultipleProjects() {
      return this.selectedProjects.length > 1
    },
    hasSlicedProjects() {
      return this.selectedProjects.length > this.sliceSize
    }
  },
  watch: {
    query() {
      this.focusIndex = this.query && this.options.length ? 0 : -1
    }
  },
  methods: {
    isLastProjectSlice(p) {
      return p === this.slicedProjects.length - 1
    },
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

<style lang="scss">
.project-dropdown-selector {
  .dropdown-menu {
    width: 100%;
    max-width: 18rem !important; // We must use !important here to override the element style
  }

  .btn.dropdown-toggle {
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

  &__query-input {
    position: sticky;
    background: $dropdown-bg;
    z-index: 20;
    top: 0;
    box-shadow: 0 -1 * $spacer-xxs 0 $spacer-xxs $dropdown-bg;
  }

  &__button-content__project {
    display: inline-flex;
    align-items: center;

    &:not(:first-of-type) &__thumbnail {
      box-shadow: -1px 0 0 0 #fff;
      margin-left: -0.5em;
    }

    .project-dropdown-selector--sliced &:last-of-type &__thumbnail {
      background: $text-muted !important;

      &:after {
        content: '+';
        color: #fff;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  &__item {
    border-radius: $border-radius;
  }

  &__item--focus,
  .dropdown-item:focus-visible &__item,
  .dropdown-item:focus &__item {
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

  &__toggle-unique-value {
    &__thumbnail {
      width: 100%;
      max-width: 1.2rem;
    }
  }

  &__toggle-value {
    $size: 1.5rem;

    visibility: hidden;
    position: relative;
    line-height: $size;
    height: $size;
    width: $size;
    border-radius: $size;

    &:empty {
      display: none;
    }

    &:before {
      content: '';
      z-index: 0;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      border-radius: $size;
      background: transparent;
      opacity: 0.25;
    }

    &:hover:before {
      background: currentColor;
    }

    .phosphor-icon {
      position: absolute;
      z-index: 10;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .dropdown-item:hover &__toggle-value,
  .dropdown-item.active &__toggle-value {
    visibility: visible;
  }
}
</style>
