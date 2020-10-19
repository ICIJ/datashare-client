<template>
  <div class="d-inline">
    <b-badge
      class="applied-search-filters-item mr-2 pl-1 mw-100 text-truncate"
      :class="filter.negation ? 'strikethrough' : ''"
      @click.prevent="deleteQueryTerm()"
      :id="id"
      pill
      :title="label"
      v-b-tooltip
      variant="warning">
      <fa icon="times-circle"></fa>
      {{ label }}
    </b-badge>
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
    },
    label () {
      return this.$options.filters.displayUser(this.filter.label)
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
