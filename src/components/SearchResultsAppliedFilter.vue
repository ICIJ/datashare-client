<template>
  <b-badge class="ml-2 search-results__header__applied-filters__filter" @click.prevent="deleteQueryTerm()">
    {{ filter.label }}
    <fa icon="times" />
  </b-badge>
</template>

<script>
import { EventBus } from '@/utils/event-bus'

export default {
  name: 'SearchResultsAppliedFilter',
  props: ['filter'],
  methods: {
    async deleteQueryTerm () {
      if ('name' in this.filter) {
        await this.$store.dispatch('search/removeFacetValue', this.filter)
        EventBus.$emit('facet::search::update', this.filter.name)
      } else {
        await this.$store.dispatch('search/deleteQueryTerm', this.filter.value)
      }
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
    }
  }
}
</script>

<style lang="scss">
  .search-results__header__applied-filters__filter {
    cursor: pointer;
  }
</style>
