<template>
  <form class="search-bar form-row align-items-center container-fluid py-3" @submit.prevent="submit">
    <div class="input-group col">
      <input v-model="query" type="search" :placeholder="$t('search.placeholder')" class="form-control">
      <div class="input-group-append">
        <button type="submit" class="btn btn-icij">
          {{ $t('search.buttonlabel') }}
        </button>
      </div>
    </div>
    <div class="col-auto px-0 pl-2">
      <search-settings placement="bottomleft" />
    </div>
  </form>
</template>

<script>
import SearchSettings from './SearchSettings'

export default {
  name: 'SearchBar',
  components: {
    SearchSettings
  },
  data () {
    return {
      query: this.$store.state.search.query
    }
  },
  mounted () {
    this.$store.subscribe((mutation) => {
      if (mutation.type === 'search/query') {
        this.query = mutation.payload
      }
    })
  },
  methods: {
    submit () {
      this.query = (this.query === '' ? '*' : this.query)
      // Did the route change? If not, do nothing
      if (this.$route.name === 'search' && this.$route.query.q === this.query) return false
      // Change the route after update the store with the new query
      this.$store.commit('search/query', this.query)
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
      // And emit an event for those listening...
      this.$emit('submit', this.query)
    }
  }
}
</script>
