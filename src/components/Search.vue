<template>
  <div class="search">
    <form class="search-bar container-fluid bg-dark py-2 input-group" @submit="search">
      <input v-model="searchQuery" type="search" :placeholder="$t('search.placeholder')" name="search" size="32 " class="form-control">
      <div class="input-group-append">
        <button type="submit" class="btn btn-primary">{{ $t('search.buttonlabel') }}</button>
      </div>
    </form>
    <search-results v-bind:results="searchResults" :query.sync="lastQuery" class="container-fluid py-2" />
  </div>
</template>

<script>
import es from 'elasticsearch-browser'
import SearchResults from './SearchResults'

var esClient = new es.Client({
  host: process.env.CONFIG.es_host || window.location.hostname + ':9200',
  log: process.env.CONFIG.es_log || 'error'
})

export default {
  components: {SearchResults},
  name: 'search',
  data () {
    return {searchQuery: '', lastQuery: '', searchResults: []}
  },
  created: function () {
    this.aggregate()
  },
  methods: {
    search () {
      if (''.localeCompare(this.searchQuery) === 0) {
        this.lastQuery = ''
        this.aggregate()
      } else {
        const that = this
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
                          mention: that.searchQuery
                        }
                      },
                      inner_hits: {
                        size: 10
                      }
                    }
                  },
                  {
                    match: {content: that.searchQuery}
                  }
                ]
              }
            },
            highlight: {
              fields: {
                content: {
                  fragment_size: 150,
                  number_of_fragments: 10,
                  pre_tags: ['<b>'],
                  post_tags: ['</b>']
                }
              }
            }
          }
        }).then(function (resp) {
          that.searchResults = resp.hits
        })
        that.lastQuery = that.searchQuery
        this.searchQuery = ''
      }
    },
    aggregate: function () {
      const that = this
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
      }).then(function (resp) {
        that.searchResults = resp.aggregations
      })
    }
  },
  watch: {
    lastQuery (newQuery, oldQuery) {
      if (oldQuery === '' && newQuery !== '') {
        this.searchQuery = newQuery
        this.search()
      }
    }
  }
}
</script>
