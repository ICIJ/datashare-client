<template>
  <button class="btn btn-outline-secondary btn-sm" id="input-reset" @click="resetFacets" :disabled="!hasFilters">
    {{ $t('search.reset_filters') }}
  </button>
</template>

<script>
import settings from '@/utils/settings'

export default {
  name: 'ResetFiltersButton',
  computed: {
    hasFilters () {
      return this.$store.getters['search/activeFacets'].length > 0 || this.$store.state.search.field !== settings.defaultSearchField
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
