<template>
  <b-badge
    :id="appliedSearchFiltersItemId"
    v-b-tooltip.html
    class="applied-search-filters-item p-0 my-1 mr-2 mw-100 text-truncate"
    variant="warning"
    :pill="hideFilterLabel"
    :class="appliedSearchFiltersItemClassList"
    @click.prevent="deleteQueryTerm()"
  >
    <span class="applied-search-filters-item__wrapper d-inline-flex flex-column">
      <span v-if="!hideFilterLabel" class="applied-search-filters-item__wrapper__label p-1">
        {{ filterName }}
      </span>
      <span class="applied-search-filters-item__wrapper__value p-1">
        <fa v-if="!readOnly" icon="times-circle" />
        {{ displayedFilterValue }}
      </span>
    </span>
    <b-tooltip :target="appliedSearchFiltersItemId" triggers="hover" boundary="window">
      <dl class="m-0">
        <dt>
          {{ filterName }}
        </dt>
        <dd class="m-0">
          {{ displayedFilterValue }}
        </dd>
      </dl>
    </b-tooltip>
  </b-badge>
</template>

<script>
import { uniqueId } from 'lodash'

import displayUser from '@/filters/displayUser'

/**
 * The filter applied to the search.
 */
export default {
  name: 'AppliedSearchFiltersItem',
  filters: {
    displayUser
  },
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
    },
    /**
     * Hide the label of the filter
     */
    hideFilterLabel: {
      type: Boolean
    }
  },
  computed: {
    appliedSearchFiltersItemId() {
      return uniqueId('applied-search-filters-item-')
    },
    appliedSearchFiltersItemClassList() {
      return {
        'applied-search-filters-item--negation': this.filter.negation,
        'applied-search-filters-item--read-only': this.readOnly
      }
    },
    displayedFilterValue() {
      return this.filter.label || this.filterValue
    },
    filterValue() {
      return this.$options.filters.displayUser(this.filter.value)
    },
    filterName() {
      if (this.isQueryTerm) {
        return this.$t('filter.searchTerm')
      }
      const name = this.filter.name.split('f[').pop().split(']').shift()
      const localeKey = `filter.${name}`
      return this.$te(localeKey) ? this.$t(localeKey) : name
    },
    isQueryTerm() {
      return !('name' in this.filter) || this.filter.name === 'q'
    }
  },
  methods: {
    async deleteQueryTerm() {
      if (this.readOnly) {
        return
      }

      if (this.isQueryTerm) {
        await this.$store.dispatch('search/deleteQueryTerm', this.filter.value)
      } else {
        await this.$store.dispatch('search/removeFilterValue', this.filter)
        this.$root.$emit('filter::search::update', this.filter.name)
      }

      const query = this.$store.getters['search/toRouteQuery']()
      this.$router.push({ name: 'search', query }).catch(() => {})
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

  &__wrapper {
    &__label {
      font-size: 0.8em;
      background: #fff;
      border: 1px solid $warning;
      border-bottom: 0;
      text-transform: uppercase;
      border-radius: $border-radius-sm $border-radius-sm 0 0;
    }
  }
}
</style>
