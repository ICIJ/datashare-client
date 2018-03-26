<template>
  <form class="search-bar container-fluid bg-dark py-2 input-group" @submit.prevent="submit">
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
  methods: {
    submit () {
      // Change the route!
      this.$router.push({name: 'search', query: {q: this.query}})
      // And emit an event for those listening...
      this.$emit('submit', this.query)
    }
  }
}
</script>
