<template>
  <div class="project-cards container-fluid p-0">
    <div class="row">
      <div class="col-4 mb-4" v-for="project in projects" :key="project">
        <router-link :to="{ name: 'search', query: { index: project, q: '*' } }" class="project-cards__item d-flex justify-content-start text-nowrap" :class="{ 'project-cards__item--active': isActive(project) }">
          <div class="project-cards__item__header py-2 px-3 bg-white text-secondary">
            <fa icon="book"></fa>
          </div>
          <div class="project-cards__item__body py-2 px-3 font-weight-bold">
            {{ startCase(project) }}
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .project-cards {
    &__item {
      background: $primary;
      border: darken($primary, 10%) 1px solid;
      border-radius: $border-radius-sm;
      color: white;
      display: block;

      &:hover {
        background: darken($primary, 5);
        color: white;
      }

      &--active {
        box-shadow: 0 0 0 2px $warning;
      }
    }
  }
</style>

<script>
import { startCase } from 'lodash'

/**
 * List all the projects with cards linking to the search.
 */
export default {
  data () {
    return {
      projects: []
    }
  },
  methods: {
    isActive (project) {
      return project === this.$store.state.search.index
    },
    startCase
  },
  created () {
    // @deprecated this load the list from a deprecated list of project for retro-compatibility
    const legacyProjects = this.$config.get('datashare_projects', [])
    const projects = this.$config.get('groups_by_applications.datashare', [])
    const sortedProjects = [...projects, ...legacyProjects].sort()
    this.$set(this, 'projects', sortedProjects)
  }
}
</script>
