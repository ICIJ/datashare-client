<template>
  <search-bar-input-dropdown
    ref="inputDropdown"
    v-model="selectedProjects"
    class="search-bar-input-dropdown-for-projects"
    multiple
    flush-items
    :class="{
      'search-bar-input-dropdown-for-projects--multiple': hasMultipleProjects,
      'search-bar-input-dropdown-for-projects--sliced': hasSlicedProjects
    }"
    :disabled="disabled"
    :no-caret="noCaret"
    :options="options"
    @selected="reset"
  >
    <template #above="{ dropdown }">
      <li class="search-bar-input-dropdown-for-projects__query-input">
        <div class="b-dropdown-form px-2 pt-1 pb-2">
          <search-form-control
            v-if="dropdown && dropdown.visible"
            v-model="query"
            placeholder="Filter projects..."
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
      <span
        v-for="(project, p) in slicedProjects"
        :key="p"
        class="search-bar-input-dropdown-for-projects__button-content__project"
      >
        <project-thumbnail
          :project="project"
          no-caption
          width="1.2em"
          class="search-bar-input-dropdown-for-projects__button-content__project__thumbnail rounded"
        />
        <template v-if="hasOneProject">
          {{ project.label || project.name }}
        </template>
        <template v-else-if="isLastProjectSlice(p)">
          {{ $tc('searchBarInputDropdownForProjects.projectsCount', selectedProjects.length) }}
        </template>
      </span>
    </template>
    <template #dropdown-item="{ option: project, index, values, hasValue, toggleUniqueValue, toggleValue }">
      <span
        class="search-bar-input-dropdown-for-projects__item d-flex align-items-center justify-self-center"
        :class="{ 'search-bar-input-dropdown-for-projects__item--focus': index === focusIndex }"
      >
        <div
          class="search-bar-input-dropdown-for-projects__toggle-unique-value flex-truncate d-flex align-items-center justify-self-center px-3 py-2 flex-grow-1"
          @click="toggleUniqueValue($event, project)"
        >
          <span
            class="search-bar-input-dropdown-for-projects__toggle-unique-value__thumbnail mr-2 d-inline-flex align-items-center justify-self-center"
          >
            <project-thumbnail :project="project" no-caption width="1.2em" class="rounded" />
          </span>
          <span class="text-truncate">
            {{ project.label || project.name }}
          </span>
        </div>
        <div
          class="search-bar-input-dropdown-for-projects__toggle-value px-3 py-2 ml-auto"
          @click="toggleValue($event, project)"
        >
          <fa v-if="!hasValue(project)" icon="plus" fixed-width />
          <fa v-else-if="values.length > 1" icon="minus" fixed-width />
        </div>
      </span>
    </template>
  </search-bar-input-dropdown>
</template>

<script>
import { iteratee, trim } from 'lodash'

import ProjectThumbnail from '@/components/ProjectThumbnail'
import SearchBarInputDropdown from '@/components/SearchBarInputDropdown'
import SearchFormControl from '@/components/SearchFormControl'
import { iwildcardMatch } from '@/utils/strings'

export default {
  name: 'SearchBarInputDropdownForProjects',
  components: {
    ProjectThumbnail,
    SearchBarInputDropdown,
    SearchFormControl
  },
  props: {
    /**
     * List of selected projects
     */
    value: {
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
      return this.value.map(iteratee('name'))
    },
    selectedProjects: {
      get() {
        return this.value.map(({ name }) => {
          return this.$core.findProject(name)
        })
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    slicedProjects() {
      return this.selectedProjects.slice(0, this.sliceSize + 1)
    },
    options() {
      return this.$core.projects.filter(({ label = '', name = '' } = {}) => {
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
    },
    moveFocusDown() {
      this.focusIndex = Math.min(this.options.length - 1, this.focusIndex + 1)
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
.search-bar-input-dropdown-for-projects {
  .dropdown-menu {
    width: 100%;
    max-width: 18rem;
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
    font-weight: bold;

    .search-bar-input-dropdown-for-projects--multiple &:not(:first-of-type) &__thumbnail {
      box-shadow: -1px 0 0 0 #fff;
      margin-left: -0.5em;
      margin-right: 0;
    }

    &:last-of-type &__thumbnail {
      margin-right: $spacer-xs !important;
    }

    .search-bar-input-dropdown-for-projects--sliced &:last-of-type &__thumbnail {
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

  &__item--focus {
    position: relative;
    color: $dropdown-link-hover-color;
    background: $dropdown-link-hover-bg;
    text-decoration: none;

    &:before {
      pointer-events: none;
      content: '';
      position: absolute;
      top: 3px;
      bottom: 3px;
      left: 5px;
      right: 5px;
      border: 2px solid $secondary;
      border-radius: $border-radius;
    }
  }

  .dropdown-item.active &__item--focus {
    color: $dropdown-link-active-color;
    background: $dropdown-link-active-bg;
  }

  &__toggle-unique-value {
    &__thumbnail {
      width: 100%;
      max-width: 1.2rem;
    }
  }

  &__toggle-value {
    position: relative;
    visibility: hidden;

    &:empty {
      display: none;
    }

    &:before {
      $size: 1.5rem;

      content: '';
      z-index: 0;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: block;
      height: $size;
      width: $size;
      border-radius: $size;
      background: transparent;
      opacity: 0.25;
    }

    &:hover:before {
      background: currentColor;
    }

    .svg-inline--fa {
      position: relative;
      z-index: 10;
    }
  }

  & .dropdown-item:hover &__toggle-value,
  & .dropdown-item.active &__toggle-value {
    visibility: visible;
  }
}
</style>
