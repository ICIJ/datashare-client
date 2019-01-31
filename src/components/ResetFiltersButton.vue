<template>
  <button class="btn btn-outline-secondary btn-sm" id="input-reset" @click="resetFacets" :disabled="!hasFacets">
    Reset filters
  </button>
</template>

<script>
export default {
  name: 'ResetFiltersButton',
  computed: {
    hasFacets () {
      return this.$store.getters['search/activeFacets'].length > 0
    }
  },
  methods: {
    resetFacets () {
      this.$store.dispatch('search/reset')
      this.$root.$emit('bv::hide::popover')
      // Change the route
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
    }
  }
}
</script>
