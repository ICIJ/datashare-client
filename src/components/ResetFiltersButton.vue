<template>
  <button
    v-show="!autoHiding || hasFiltersOrQuery"
    v-b-tooltip
    class="btn"
    :class="componentClasses"
    :title="$t('search.clearFiltersDescription')"
    :disabled="!hasFiltersOrQuery"
    @click="resetFiltersAndQuery"
  >
    <fa v-if="!noIcon" :icon="icon"></fa>&nbsp;
    <slot>
      {{ $t('search.clearFilters') }}
    </slot>
  </button>
</template>

<script>
import settings from '@/utils/settings'

/**
 * Button to reset all search filters.
 */
export default {
  name: 'ResetFiltersButton',
  props: {
    /**
     * Bootstrap variant class of the button.
     *
     * @values primary, secondary, success, danger, warning, info, light, dark, outline-primary, outline-secondary,
     *         outline-success, outline-danger, outline-warning, outline-info, outline-light, outline-dark
     */
    variant: {
      default: 'outline-secondary',
      type: String
    },
    /**
     * Button size
     * @values sm, md, lg
     */
    size: {
      default: 'sm',
      type: String
    },
    /**
     * Hide the default icon
     */
    noIcon: {
      type: Boolean
    },
    /**
     * Hide the button automatically when no filters are active
     */
    autoHiding: {
      type: Boolean
    },
    /**
     * Default icon for the button
     */
    icon: {
      type: String,
      default: 'circle-xmark'
    }
  },
  computed: {
    hasFilters() {
      return this.$store.getters['search/activeFilters'].length > 0
    },
    hasQuery() {
      return this.$store.state.search.field !== settings.defaultSearchField || this.$store.state.search.query !== ''
    },
    hasFiltersOrQuery() {
      return this.hasFilters || this.hasQuery
    },
    componentClasses() {
      return {
        ['btn-' + this.size]: true,
        ['btn-' + this.variant]: true
      }
    }
  },
  methods: {
    resetFiltersAndQuery() {
      this.$store.commit('search/resetFilterValues')
      this.$store.commit('search/resetQuery')
      this.$core.emit('bv::hide::popover')
      /**
       * Filters have been reset.
       */
      this.$core.emit('filter::search::reset-filters', { refresh: true })
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery']() }).catch(() => {})
    }
  }
}
</script>
