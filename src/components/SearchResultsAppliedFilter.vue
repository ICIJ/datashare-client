<template>
  <b-badge variant="dark" class="ml-2 search-results__header__applied-filters__filter" :class="filter.negation ? 'strikethrough' : ''" @click.prevent="deleteQueryTerm()">
    {{ filter.label }}
    <fa icon="times" />
  </b-badge>
</template>

<script>
export default {
  name: 'SearchResultsAppliedFilter',
  props: ['filter'],
  methods: {
    async deleteQueryTerm () {
      if ('name' in this.filter) {
        await this.$store.dispatch('search/removeFacetValue', this.filter)
        this.$root.$emit('facet::search::update', this.filter.name)
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

    &.strikethrough {
      text-decoration: line-through;
    }
  }
</style>
