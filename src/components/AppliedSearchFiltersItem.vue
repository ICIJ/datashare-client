<template>
  <b-badge
    class="applied-search-filters-item px-0 my-1 mr-2 mw-100 text-truncate"
    :class="{
      'applied-search-filters-item--negation': filter.negation,
      'applied-search-filters-item--read-only': readOnly
    }"
    @click.prevent="deleteQueryTerm()"
    :id="id"
    pill
    :title="label"
    v-b-tooltip
    variant="warning">
    <fa icon="times-circle" class="mx-1" v-if="!readOnly" />
    <span class="applied-search-filters-item__wrapper">
      {{ label }}
    </span>
  </b-badge>
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
    },
    /**
     * Should allow to delete the filter or not
     */
    readOnly: {
      type: Boolean
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

    &--negation {
      text-decoration: line-through;
    }

    &--read-only &__wrapper {
      padding:0 $spacer * 0.5;
    }

    &__wrapper {
      padding-right: $spacer * 0.25;
    }
  }
</style>
