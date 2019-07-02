<template>
  <button class="btn btn-outline-secondary btn-sm" id="input-reset" @click="resetFacets" :disabled="!hasFacets">
    {{ $t('search.reset_filters') }}
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
      this.$store.dispatch('search/reset', ['index', 'globalSearch', 'starredDocuments'])
      this.$root.$emit('bv::hide::popover')
      this.$root.$emit('facet::search::reset-filters')
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
    }
  }
}
</script>
