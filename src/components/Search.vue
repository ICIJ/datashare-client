<template>
  <div class="search">
    <search-bar />
    <search-results :results="searchResults" :query.sync="query"  class="container-fluid py-2" />
  </div>
</template>

<script>
import es from 'elasticsearch-browser'
import SearchBar from './SearchBar'
import SearchResults from './SearchResults'

var esClient = new es.Client({
  host: process.env.CONFIG.es_host || window.location.hostname + ':9200'
})

export default {
  name: 'Search',
  components: {
    SearchResults,
    SearchBar
  },
  props: ['query'],
  data () {
    return {
      searchResults: []
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
        esClient.search({
          index: process.env.CONFIG.es_index,
          type: 'doc',
          size: 200,
          body: {
            query: {
              bool: {
                should: [
                  {
                    has_child: {
                      type: 'NamedEntity',
                      query: {
                        match: {
                          mention: query
                        }
                      },
                      inner_hits: {
                        size: 10
                      }
                    }
                  },
                  {
                    match: {
                      content: query
                    }
                  }
                ]
              }
            },
            highlight: {
              fields: {
                content: {
                  fragment_size: 150,
                  number_of_fragments: 10,
                  pre_tags: ['<mark>'],
                  post_tags: ['</mark>']
                }
              }
            }
          }
        }).then(resp => {
          this.searchResults = resp.hits
        })
      }
    },
    aggregate: function () {
      esClient.search({
        index: process.env.CONFIG.es_index,
        type: 'doc',
        size: 0,
        body: {
          query: {
            constant_score: {filter: {term: {type: 'NamedEntity'}}}
          },
          aggs: {
            mentions: {
              terms: {field: 'mentionNorm', size: 30},
              aggs: {
                docs: {
                  cardinality: {
                    field: 'join'
                  }
                }
              }
            }
          }
        }
      }).then(resp => {
        this.searchResults = resp.aggregations
      })
    }
  }
}
</script>
