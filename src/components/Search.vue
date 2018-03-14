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
import client from '@/api/client'
import Response from '@/api/Response'
// Components
import AggregationsPanel from './AggregationsPanel'
import SearchBar from './SearchBar'
import SearchResults from './SearchResults'
// Vendors
import bodybuilder from 'bodybuilder'

export default {
  name: 'Search',
  components: {
    AggregationsPanel,
    SearchResults,
    SearchBar
  },
  props: ['query'],
  data () {
    return {
      searchResponse: new Response({hits: {hits: []}})
    }
  },
  watch: {
    '$route' () {
      this.search()
    }
  },
  created () {
    this.search()
  },
  methods: {
    search (query = this.query) {
      return client.search({
        index: process.env.CONFIG.es_index,
        type: 'doc',
        size: 200,
        body: bodybuilder()
          .orQuery('match', 'content', query)
          .orQuery('has_child', 'type', 'NamedEntity', {
            'inner_hits': {
              'size': 30
            }
          }, sub => {
            return sub.query('match', 'mention', query)
          })
          .rawOption('highlight', {
            fields: {
              content: {
                fragment_size: 150,
                number_of_fragments: 10,
                pre_tags: ['<mark>'],
                post_tags: ['</mark>']
              }
            }
          })
          .build()
      }).then(raw => { this.searchResponse = new Response(raw) })
    }
  }
}
</script>
