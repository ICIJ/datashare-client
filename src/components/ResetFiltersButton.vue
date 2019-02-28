<template>
  <button class="btn btn-outline-secondary btn-sm" id="input-reset" @click="resetFacets" :disabled="!hasFacets">
    {{ $t('search.reset_filters') }}
  </button>
</template>

<script>
import { EventBus } from '@/utils/event-bus'

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
      EventBus.$emit('facet::search::reset-filters')
      // Change the route
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
    }
  }
}
</script>
