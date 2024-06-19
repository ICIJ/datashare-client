<template>
  <div v-if="showProjects" class="filter card">
    <div class="card-header px-2 py-3">
      <h6 class="pt-0" @click="toggleItems">
        <span class="filter__items__item__icon ps-0 pe-1">
          <fa icon="book" fixed-width />
        </span>
        <fa :icon="headerIcon" class="float-end" />
        {{ $t('filter.projects') }}
      </h6>
    </div>
    <slide-up-down class="list-group list-group-flush filter__items pb-2" :active="!collapseItems">
      <search-form-control
        v-model="query"
        class="filter__items__search mb-2"
        dark
        :autofocus="false"
        :rounded="false"
        :placeholder="$t('search.searchInProjects')"
      />
      <project-selector v-model="selectedProject" :query="query" class="border-0" multiple />
    </slide-up-down>
  </div>
</template>

<script>
import SearchFormControl from '@/components/SearchFormControl'
import ProjectSelector from '@/components/ProjectSelector'
import utils from '@/mixins/utils'

/**
 * A Filter component to list projects.
 */
export default {
  name: 'FilterProject',
  components: {
    ProjectSelector,
    SearchFormControl
  },
  mixins: [utils],
  data() {
    return {
      collapseItems: false,
      query: null
    }
  },
  computed: {
    showProjects() {
      return this.isServer || this.$core.projects.length > 1
    },
    selectedProject: {
      get() {
        return this.$store.state.search.indices
      },
      async set(indices) {
        if (indices.length) {
          this.$store.commit('search/indices', indices)
          this.$store.commit('search/isReady', false)
          await this.$store.dispatch('starred/fetchIndicesStarredDocuments')
          await this.$store.dispatch('recommended/fetchIndicesRecommendations')
          await this.$store.dispatch('downloads/fetchIndicesStatus')
          await this.refreshRouteAndSearch()
        }
      }
    },
    headerIcon() {
      return this.collapseItems ? 'plus' : 'minus'
    }
  },
  async created() {
    await this.retrieveIndicesInfos()
  },
  methods: {
    retrieveIndicesInfos() {
      return Promise.all([
        this.$store.dispatch('starred/fetchIndicesStarredDocuments'),
        this.$store.dispatch('recommended/fetchIndicesRecommendations'),
        this.$store.dispatch('downloads/fetchIndicesStatus')
      ])
    },
    async select(projects) {
      this.$store.commit('search/indices', projects)
      this.$store.commit('search/isReady', false)
      await this.retrieveIndicesInfos()
      await this.refreshRouteAndSearch()
    },
    toggleItems() {
      this.collapseItems = !this.collapseItems
    },
    async refreshRouteAndSearch() {
      await this.refreshRoute()
      await this.refreshSearch()
    },
    refreshRoute() {
      const name = 'search'
      const query = this.$store.getters['search/toRouteQuery']()
      return this.$router.push({ name, query }).catch(() => {})
    },
    refreshSearch() {
      return this.$store.dispatch('search/query')
    }
  }
}
</script>
