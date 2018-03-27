<template>
  <div class="search">
    <search-bar />
    <div class="container-fluid search__body">
      <div class="row">
        <div class="col search__body__aggregations-panel">
          <aggregations-panel class="my-4" />
        </div>
        <div class="col search__body__search-results">
          <search-results v-if="searchResponse" :response="searchResponse" :query.sync="q" class="m-2" />
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
      }
    }
  }
</style>
