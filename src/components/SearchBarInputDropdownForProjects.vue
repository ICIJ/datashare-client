<template>
  <search-bar-input-dropdown
    v-model="selectedProjects"
    class="search-bar-input-dropdown-for-projects"
    multiple
    :class="{
      'search-bar-input-dropdown-for-projects--multiple': hasMultipleProjects,
      'search-bar-input-dropdown-for-projects--sliced': hasSlicedProjects
    }"
    :disabled="disabled"
    :no-caret="noCaret"
    :options="options"
  >
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
    <template #dropdown-item="{ option: project }">
      <span class="d-inline-flex align-items-center justify-self-center">
        <span class="mr-2 d-inline-flex align-items-center justify-self-center">
          <project-thumbnail :project="project" no-caption width="1.2em" class="rounded" />
        </span>
        {{ project.label || project.name }}
      </span>
    </template>
  </search-bar-input-dropdown>
</template>

<script>
import { iteratee } from 'lodash'

import ProjectThumbnail from './ProjectThumbnail.vue'
import SearchBarInputDropdown from './SearchBarInputDropdown.vue'

export default {
  name: 'SearchBarInputDropdownForProjects',
  components: {
    ProjectThumbnail,
    SearchBarInputDropdown
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
  computed: {
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
      return this.$core.projects
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
  methods: {
    isLastProjectSlice(p) {
      return p === this.slicedProjects.length - 1
    }
  }
}
</script>

<style lang="scss">
.search-bar-input-dropdown-for-projects {
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
}
</style>
