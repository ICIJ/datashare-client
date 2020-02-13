<template>
  <div class="filter card filter--hide-show-more filter--hide-search" v-if="showSelector">
    <div class="card-header px-2">
      <h6 @click="toggleItems" class="pt-0">
        <span class="filter__items__item__icon pl-0 pr-1">
          <fa icon="book" fixed-width />
        </span>
        <fa :icon="headerIcon" class="float-right"/>
        {{ $t('filter.projects') }}
      </h6>
    </div>
    <slide-up-down class="list-group list-group-flush filter__items" :active="!collapseItems">
      <div class="p-2">
        <project-selector v-model="selectedProject" @input="select" />
      </div>
    </slide-up-down>
  </div>
</template>

<script>
import map from 'lodash/map'

import ProjectSelector from '@/components/ProjectSelector.vue'
import filters from '@/mixins/filters'

export default {
  name: 'FilterProject',
  mixins: [filters],
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
      set: function (value) {
        this.$store.commit('search/index', value)
      }
    },
    headerIcon () {
      return this.collapseItems ? 'plus' : 'minus'
    },
    showSelector () {
      return this.$config.is('multipleProjects') || this.projects.length > 1
    }
  },
  async created () {
    const projects = JSON.parse(this.$config.get('datashare_indices', '[]'))
    this.$set(this, 'projects', map(projects, value => ({ value, text: value })))
    await this.$store.dispatch('search/getStarredDocuments')
    await this.$store.dispatch('search/getIsDownloadAllowed')
  },
  methods: {
    async select (value) {
      this.$store.commit('search/index', value)
      this.$store.commit('search/resetFilterValues')
      this.$store.commit('search/resetQuery')
      this.$root.$emit('filter::search::reset-filters')
      await this.$store.dispatch('search/getStarredDocuments')
      await this.$store.dispatch('search/getIsDownloadAllowed')
      this.refreshRoute()
    },
    toggleItems () {
      this.collapseItems = !this.collapseItems
    }
  }
}

</script>
