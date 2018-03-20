<template>
  <div class="search">
    <search-bar />
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-3 bg-light border-right">
          <aggregations-panel class="my-4" />
        </div>
        <div class="col-md-9">
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
