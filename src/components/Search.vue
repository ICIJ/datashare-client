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
        client.search({
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
        this.searchResponse = resp.aggregations
      })
    }
  }
}
</script>
