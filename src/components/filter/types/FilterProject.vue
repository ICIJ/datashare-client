<template>
  <div v-if="showSelector" class="filter card">
    <div class="card-header px-2">
      <h6 class="pt-0" @click="toggleItems">
        <span class="filter__items__item__icon pl-0 pr-1">
          <fa icon="book" fixed-width />
        </span>
        <fa :icon="headerIcon" class="float-right" />
        {{ $t('filter.projects') }}
      </h6>
    </div>
    <slide-up-down class="list-group list-group-flush filter__items" :active="!collapseItems">
      <project-selector v-model="selectedProject" class="border-0" multiple @input="select" />
    </slide-up-down>
  </div>
</template>

<script>
import { compact, uniq } from 'lodash'

import ProjectSelector from '@/components/ProjectSelector'
import utils from '@/mixins/utils'

/**
 * A Filter component to list projects.
 */
export default {
  name: 'FilterProject',
  components: {
    ProjectSelector
  },
  mixins: [utils],
  data() {
    return {
      collapseItems: false
    }
  },
  computed: {
    projects() {
      const defaultProject = this.$config.get('defaultProject')
      const projects = this.$config.get('groups_by_applications.datashare', [])
      return compact(uniq([...projects, defaultProject]).sort())
    },
    selectedProject: {
      get: function () {
        return this.$store.state.search.indices
      },
      set: function (indices) {
        if (indices.length) {
          this.$store.commit('search/indices', indices)
        }
      }
    },
    headerIcon() {
      return this.collapseItems ? 'plus' : 'minus'
    },
    showSelector() {
      return this.isServer || this.projects.length > 1
    }
  },
  async created() {
    await this.$store.dispatch('starred/fetchIndicesStarredDocuments')
    await this.$store.dispatch('recommended/fetchIndicesRecommendations')
    await this.$store.dispatch('downloads/fetchIndicesStatus')
  },
  methods: {
    async select(projects) {
      this.$store.commit('search/indices', projects)
      this.$store.commit('search/isReady', false)
      await this.$store.dispatch('starred/fetchIndicesStarredDocuments')
      await this.$store.dispatch('recommended/fetchIndicesRecommendations')
      await this.$store.dispatch('downloads/fetchIndicesStatus')
      this.refreshRouteAndSearch()
    },
    toggleItems() {
      this.collapseItems = !this.collapseItems
    },
    refreshRouteAndSearch() {
      this.refreshRoute()
      this.refreshSearch()
    },
    refreshRoute() {
      const name = 'search'
      const query = this.$store.getters['search/toRouteQuery']()
      this.$router.push({ name, query }).catch(() => {})
    },
    refreshSearch() {
      this.$store.dispatch('search/query')
    }
  }
}
</script>

<style scoped lang="scss">
.filter {
  & :deep.custom-control-label span {
    padding: 0 $spacer-xxs;
  }

  & :deep.custom-control-input[disabled]:checked ~ .custom-control-label,
  & :deep.custom-control-input:disabled:checked ~ .custom-control-label {
    color: inherit;
    font-weight: bold;
  }
}
</style>
