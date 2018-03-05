<template>
  <div class="search">
    <div class="search-bar">
      <input v-model="searchQuery" v-on:keyup.enter="search" type="search" :placeholder="$t('search.placeholder')" name="search" size="32 ">
      <button v-on:click="search">{{ $t('search.buttonlabel') }}</button>
    </div>
    <search-results v-bind:results="searchResults" :query.sync="lastQuery"/>
  </div>
</template>

<style scoped>
  .search-bar {
    padding: 3em;
  }
</style>

<script>
import es from 'elasticsearch-browser'
import SearchResults from './SearchResults'

var esClient = new es.Client({
  host: process.env.CONFIG.es_host || window.location.hostname + ':9200',
  log: 'trace'
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
        }, function (err) {
          console.trace(err.message)
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
      }, function (err) {
        console.trace(err.message)
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
