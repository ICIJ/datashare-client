<template>
  <div class="d-inline">
    <b-badge variant="warning" pill class="mr-2 pl-1 applied-search-filters-item mw-100 text-truncate" :class="filter.negation ? 'strikethrough' : ''" @click.prevent="deleteQueryTerm()" :id="id">
      <fa icon="times-circle"></fa>
      {{ filter.label | displayUser }}
    </b-badge>
    <b-popover :target="id" triggers="hover" placement="bottom">
      {{ filter.label | displayUser }}
    </b-popover>
  </div>
</template>

<script>
import uniqueId from 'lodash/uniqueId'

import displayUser from '@/filters/displayUser'

/**
 * The filter applied to the search.
 */
export default {
  name: 'AppliedSearchFiltersItem',
  props: {
    /**
     * The applied filter
     */
    filter: {
      type: Object
    }
  },
  filters: {
    displayUser
  },
  computed: {
    id () {
      return uniqueId('applied-search-filters-item')
    }
  },
  methods: {
    async deleteQueryTerm () {
      if ('name' in this.filter) {
        await this.$store.dispatch('search/removeFilterValue', this.filter)
        this.$root.$emit('filter::search::update', this.filter.name)
      } else {
        await this.$store.dispatch('search/deleteQueryTerm', this.filter.value)
      }
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery']() }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
  .applied-search-filters-item {
    cursor: pointer;

    &.strikethrough {
      text-decoration: line-through;
    }
  }
</style>
