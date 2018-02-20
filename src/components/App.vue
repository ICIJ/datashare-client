<template>
  <div class="app">
    <language-chooser></language-chooser>
    <div class="search">
      <input v-model="searchQuery" type="search" :placeholder="$t('search.placeholder')" name="search">
      <button v-on:click="search">{{ $t('search.buttonlabel') }}</button>
    </div>
  </div>
</template>

<style lang="scss">
  .app {}
</style>

<script>
import LanguageChooser from './LanguageChooser'
import es from 'elasticsearch-browser'

var esClient = new es.Client({
  host: 'elasticsearch:9200',
  log: 'trace'
})

export default {
  components: {LanguageChooser},
  name: 'App',
  data () {
    return {searchQuery: ''}
  },
  methods: {
    search (e) {
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
