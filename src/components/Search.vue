<template>
  <div class="search">
    <search-bar />
    <search-results :response="searchResponse" :query.sync="query"  class="container-fluid py-2" />
  </div>
</template>

<script>
import client from '@/api/client'
import Response from '@/api/Response'
import SearchBar from './SearchBar'
import SearchResults from './SearchResults'
import bodybuilder from 'bodybuilder'

export default {
  name: 'Search',
  components: {
    SearchResults,
    SearchBar
  },
  props: ['query'],
  data () {
    return {
      searchResponse: []
    }
  },
  watch: {
    '$route' () {
      this.search()
    }
  },
  mounted: function () {
    this.search()
  },
  methods: {
    search (query = this.query) {
      if (!query) {
        this.aggregate()
      } else {
        return client.search({
          index: process.env.CONFIG.es_index,
          type: 'doc',
          size: 200,
          body: bodybuilder().orQuery('match', 'content', query).orQuery('has_child', 'type', 'NamedEntity', {'inner_hits': {'size': 10}}, sub => {
            return sub.query('match', 'mention', query)
          }).rawOption('highlight', {fields: {content: {fragment_size: 150, number_of_fragments: 10, pre_tags: ['<mark>'], post_tags: ['</mark>']}}})
            .build()
        }).then(raw => {
          this.searchResponse = new Response(raw)
        })
      }
    },
    aggregate: function () {
      client.search({
        index: process.env.CONFIG.es_index,
        type: 'doc',
        size: 0,
        body: bodybuilder().query('term', 'type', 'NamedEntity')
          .aggregation('terms', 'mentionNorm', 'mentions', sub => {
            return sub.aggregation('cardinality', 'join', 'docs')
          })
          .build()
      }).then(resp => {
        this.searchResponse = resp.aggregations
      })
    }
  }
}
</script>
