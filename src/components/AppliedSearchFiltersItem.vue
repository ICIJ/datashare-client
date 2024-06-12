<template>
  <b-badge
    :id="appliedSearchFiltersItemId"
    v-b-tooltip.html
    class="applied-search-filters-item p-0 my-1 me-2 mw-100 text-truncate"
    variant="warning"
    :pill="hideFilterLabel"
    @click.prevent="deleteQueryTerm()"
  >
    <span
      class="applied-search-filters-item__wrapper d-inline-flex flex-column"
      :class="appliedSearchFiltersItemClassList"
    >
      <span v-if="!hideFilterLabel" class="applied-search-filters-item__wrapper__label p-1">
        {{ filterName }}
      </span>
      <span class="applied-search-filters-item__wrapper__value p-1">
        <fa v-if="!readOnly" icon="circle-xmark" />
        {{ displayedFilterValue }}
      </span>
    </span>
    <b-tooltip :target="appliedSearchFiltersItemId" triggers="hover" boundary="viewport">
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

import displayUser from '@/utils/displayUser'

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
     * Update search store on click, if false, only emits "delete" event
     */
    updateSearchStore: {
      type: Boolean,
      default: true
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
        'applied-search-filters-item--negation': this.filter?.negation
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
      let name = this.filter.name.split('f[').pop().split(']').shift()
      name = this.filter.negation && name[0] === '-' ? name.substring(1) : name
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
      if (!this.updateSearchStore) {
        this.$emit('delete', this.filter)
        return
      }
      if (this.isQueryTerm) {
        await this.$store.dispatch('search/deleteQueryTerm', this.filter.value)
      } else {
        await this.$store.dispatch('search/removeFilterValue', this.filter)
      }

      const query = this.$store.getters['search/toRouteQuery']()
      return this.$router.push({ name: 'search', query }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.applied-search-filters-item {
  cursor: pointer;

  &--negation {
    text-decoration-line: line-through;
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
