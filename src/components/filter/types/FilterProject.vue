<template>
  <div class="filter card filter--hide-show-more filter--hide-search" v-if="showSelector">
    <div class="card-header px-2">
      <h6 @click="toggleItems" class="pt-0">
        <span class="filter__items__item__icon pl-0 pr-1">
          <fa icon="book" fixed-width />
        </span>
        <fa :icon="headerIcon" class="float-right" />
        {{ $t('filter.projects') }}
      </h6>
    </div>
    <slide-up-down class="list-group list-group-flush filter__items" :active="!collapseItems">
      <div class="p-2">
        <project-selector v-model="selectedProject" @input="select" class="border-0" />
      </div>
    </slide-up-down>
  </div>
</template>

<script>
import ProjectSelector from '@/components/ProjectSelector'
import utils from '@/mixins/utils'

/**
 * A Filter component to list projects.
 */
export default {
  name: 'FilterProject',
  mixins: [utils],
  components: {
    ProjectSelector
  },
  data () {
    return {
      projects: [],
      collapseItems: false
    }
  },
  computed: {
    selectedProject: {
      get: function () {
        return this.$store.state.search.index
      },
      set: function (project) {
        this.$store.commit('search/index', project)
      }
    },
    headerIcon () {
      return this.collapseItems ? 'plus' : 'minus'
    },
    showSelector () {
      return this.isServer || this.projects.length > 1
    }
  },
  async created () {
    const defaultProjects = [this.$config.get('defaultProject')]
    const projects = this.$config.get('groups_by_applications.datashare', defaultProjects)
    this.$set(this, 'projects', projects)
    await this.$store.dispatch('search/getStarredDocuments')
    await this.$store.dispatch('search/getIsDownloadAllowed')
    await this.$store.dispatch('search/getRecommendationsByProject')
  },
  methods: {
    async select (project) {
      this.$store.commit('search/index', project)
      this.$store.commit('search/resetFilterValues')
      this.$store.commit('search/resetQuery')
      // eslint-disable-next-line vue/custom-event-name-casing
      this.$root.$emit('filter::search::reset-filters', false)
      await this.$store.dispatch('search/getStarredDocuments')
      await this.$store.dispatch('search/getIsDownloadAllowed')
      await this.$store.dispatch('search/getRecommendationsByProject')
      this.refreshRouteAndSearch()
    },
    toggleItems () {
      this.collapseItems = !this.collapseItems
    },
    refreshRouteAndSearch () {
      this.refreshRoute()
      this.refreshSearch()
    },
    refreshRoute () {
      const name = 'search'
      const query = this.$store.getters['search/toRouteQuery']()
      this.$router.push({ name, query }).catch(() => {})
    },
    refreshSearch () {
      this.$store.dispatch('search/query')
    }
  }
}

</script>
