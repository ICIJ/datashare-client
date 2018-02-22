<template>
  <div class="search">
    <div class="search-bar">
      <input v-model="searchQuery" v-on:keyup.enter="search" type="search" :placeholder="$t('search.placeholder')" name="search" size="32 ">
      <button v-on:click="search">{{ $t('search.buttonlabel') }}</button>
    </div>
    <search-results v-bind:results="searchResults" v-bind:query="lastQuery"/>
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
  host: 'elasticsearch:9200',
  log: 'trace'
})

export default {
  components: {SearchResults},
  name: 'search',
  data () {
    return {searchQuery: '', lastQuery: '', searchResults: []}
  },
  methods: {
    search () {
      var that = this
      esClient.search({
        index: 'datashare-local',
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
  }
}
</script>
