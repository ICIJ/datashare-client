<template>
  <div class="search">
    <div class="container-fluid px-0 search__body">
      <div class="row no-gutters">
        <div class="col search__body__aggregations-panel">
          <aggregations-panel />
        </div>
        <div class="col search__body__search-results">
          <search-bar class="search__body__search-results__bar" />
          <search-results v-if="isReady" :response="searchResponse" :query.sync="query" />
          <div v-else>
            <content-placeholder />
            <content-placeholder />
            <content-placeholder />
          </div>
        </div>
        <router-view class="col search__body__document"></router-view>
      </div>
    </div>
  </div>
</template>

<script>
// Components
import AggregationsPanel from './AggregationsPanel'
import SearchBar from './SearchBar'
import SearchResults from './SearchResults'

import { mapState } from 'vuex'

export default {
  name: 'Search',
  data () {
    return {
      isReady: false
    }
  },
  components: {
    AggregationsPanel,
    SearchResults,
    SearchBar
  },
  beforeRouteUpdate (to, from, next) {
    if (to.name === 'search') {
      this.$store.dispatch('search/updateFromRouteQuery', to.query).then(this.search).then(next)
    } else {
      next()
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
      this.isReady = false
      return this.$store.dispatch('search/query', query)
        .then(() => {
          this.isReady = true
        })
    }
  },
  watch: {
    isReady (isReady) {
      const method = isReady ? 'finish' : 'start'
      this.$Progress[method]()
    }
  }
}
</script>

<style lang="scss">
  .search {
    &__body {

      &__aggregations-panel {
        max-width: 320px;
        min-height: calc(100vh - #{$app-nav-height});
        background: $aggregations-panel-bg;
      }

      &__search-results {
        position: sticky;
        top:0;
        max-width: 550px;
        max-height: 100vh;
        overflow: auto;
        border-left: 1px solid $gray-200;
        border-right: 1px solid $gray-200;

        &__bar {
          position: sticky;
          top:0;
          background: white;
          z-index: 100;
        }
      }
    }
  }
</style>
