<template>
  <b-badge class="ml-2 search-results__header__applied-filters__filter" @click.prevent="deleteQueryTerm(filter)">
    {{ filter.value }}
    <fa icon="times" />
  </b-badge>
</template>

<script>
import { EventBus } from '@/utils/event-bus'

export default {
  name: 'SearchResultsAppliedFilter',
  props: ['filter'],
  methods: {
    deleteQueryTerm (filter) {
      let promise
      if ('name' in filter) {
        promise = this.$store.dispatch('search/removeFacetValue', filter)
      } else {
        promise = this.$store.dispatch('search/deleteQueryTerm', filter.value)
      }
      return promise.then(() => {
        if ('name' in filter) {
          EventBus.$emit('facet::search::update', filter.name)
        }
        return this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
      })
    }
  }
}
</script>

<style lang="scss">
  .search-results__header__applied-filters__filter {
    cursor: pointer;
  }
</style>
