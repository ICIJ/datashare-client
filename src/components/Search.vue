<template>
  <div class="search">
    <input v-model="searchQuery" type="search" :placeholder="$t('search.placeholder')" name="search">
    <button v-on:click="search">{{ $t('search.buttonlabel') }}</button>
  </div>
</template>

<script>
import es from 'elasticsearch-browser'

var esClient = new es.Client({
  host: 'elasticsearch:9200',
  log: 'trace'
})

export default {
  name: 'search',
  data () {
    return {searchQuery: ''}
  },
  methods: {
    search () {
      esClient.search({
        index: 'datashare-local',
        type: 'doc',
        body: {
          query: {
            match: {
              content: this.searchQuery
            }
          }
        }
      })
      this.searchQuery = ''
    }
  }
}
</script>
