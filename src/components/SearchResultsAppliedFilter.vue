<template>
  <b-badge class="ml-2 search-results__header__applied-filters__filter" @click.prevent="deleteQueryTerm(term)">
    {{ term }}
    <fa icon="times" />
  </b-badge>
</template>

<script>
export default {
  name: 'SearchResultsAppliedFilter',
  props: ['term'],
  methods: {
    deleteQueryTerm (term) {
      return this.$store.dispatch('search/deleteQueryTerm', term).then(() => {
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
