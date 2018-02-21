<template>
  <div class="search">
    <input v-model="searchQuery" v-on:keyup.enter="search" type="search" :placeholder="$t('search.placeholder')"
           name="search">
    <button v-on:click="search">{{ $t('search.buttonlabel') }}</button>
    <search-results v-bind:results="searchResults" />
  </div>
</template>

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
    return {searchQuery: '', searchResults: []}
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
            multi_match: {
              query: that.searchQuery,
              fields: ['content', 'mention', 'path']
            }
          },
          highlight: {
            fields: {
              content: {
                fragment_size: 150,
                number_of_fragments: 10,
                pre_tags: ['<b>'],
                post_tags: ['</b>'] }
            }
          }
        }
      }).then(function (resp) {
        that.searchResults = resp.hits.hits
      }, function (err) {
        console.trace(err.message)
      })
      this.searchQuery = ''
    }
  }
}
</script>
