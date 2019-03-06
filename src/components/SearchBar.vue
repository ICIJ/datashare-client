<template>
  <form class="search-bar form-row align-items-center container-fluid py-3" :id="uniqueId" @submit.prevent="submit">
    <div class="input-group col">
      <input v-model="query" type="search" :placeholder="$t('search.placeholder')" class="form-control">
      <div class="input-group-append">
        <button type="submit" class="btn btn-primary">
          {{ $t('search.buttonlabel') }}
        </button>
      </div>
    </div>
    <div class="col-auto px-0 pl-2" v-if="!hideSettings">
      <search-settings placement="bottomleft" :container="uniqueId" />
    </div>
  </form>
</template>

<script>
import SearchSettings from './SearchSettings'
import uniqueId from 'lodash/uniqueId'

export default {
  name: 'SearchBar',
  props: {
    hideSettings: {
      type: Boolean,
      default: false
    }
  },
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
      this.index = (this.index === '' ? this.$config.get('userIndices', [])[0] : this.index)
      // Did the route change? If not, do nothing
      if (this.$route.name === 'search' && this.$route.query.q === this.query) return false
      // Change the route after update the store with the new query
      this.$store.commit('search/query', this.query)
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
      // And emit an event for those listening...
      this.$emit('submit', this.query)
    }
  },
  computed: {
    uniqueId () {
      return uniqueId('search-bar-')
    }
  }
}
</script>
