<template>
  <div class="search">
    <search-bar />
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-3 bg-light border-right">
          <aggregations-panel class="my-4" />
        </div>
        <div class="col-md-9">
          <search-results v-if="searchResponse" :response="searchResponse" :query.sync="query" class="m-2" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Response from '@/api/Response'
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
  props: ['query'],
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
      q: state => state.q,
      searchResponse: state => {
        return state.response === null ? new Response({hits: {hits: []}}) : state.response
      }
    })
  },
  methods: {
    search (query = this.query) {
      return this.$store.dispatch('search/query', query)
    }
  }
}
</script>
