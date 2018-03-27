<template>
  <div class="search">
    <div class="container-fluid px-0 search__body">
      <div class="row no-gutters">
        <div class="col search__body__aggregations-panel">
          <aggregations-panel class="p-4" />
        </div>
        <div class="col search__body__search-results">
          <search-bar />
          <search-results v-if="searchResponse" :response="searchResponse" :query.sync="q" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Components
import AggregationsPanel from './AggregationsPanel'
import SearchBar from './SearchBar'
import SearchResults from './SearchResults'
// Store helpers
import { mapState } from 'vuex'

export default {
  name: 'Search',
  components: {
    AggregationsPanel,
    SearchResults,
    SearchBar
  },
  props: ['q'],
  watch: {
    '$route' () {
      this.search()
    }
  },
  created () {
    this.search()
  },
  computed: {
    ...mapState('search', {
      query: state => state.query,
      searchResponse: state => state.response
    })
  },
  methods: {
    search (query = this.q) {
      return this.$store.dispatch('search/query', query)
    }
  }
}
</script>

<style lang="scss">
  .search {
    &__body {

      &__aggregations-panel {
        max-width: 350px;
        min-height: calc(100vh - #{$app-nav-height});
        background: theme-color('light');
      }

      &__search-results {
        max-width: 660px;
        border-left: 1px solid $gray-200;
        border-right: 1px solid $gray-200;
        padding-top: $spacer;
      }
    }
  }
</style>
