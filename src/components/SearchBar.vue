<template>
  <form class="search-bar container-fluid py-3 input-group" @submit.prevent="submit">
    <input v-model="query" type="search" :placeholder="$t('search.placeholder')" class="form-control">
    <div class="input-group-append">
      <button type="submit" class="btn btn-icij">{{ $t('search.buttonlabel') }}</button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'SearchBar',
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
