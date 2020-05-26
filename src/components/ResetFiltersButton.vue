<template>
  <button class="btn" :class="componentClasses" @click="resetFiltersAndQuery" v-show="!autoHiding || hasFilters" :title="$t('search.clearFiltersDescription')" v-b-tooltip :disabled="!hasFilters">
    <fa :icon="icon" v-if="!noIcon" />
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
     * Bootsrap variant class of the button.
     *
     * @values primary, secondary, success, danger, warning, info, light, dark, outline-primary, outline-secondary, outline-success, outline-danger, outline-warning, outline-info, outline-light, outline-dark
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
     * Hide the button automaticaly when no filters are active
     */
    autoHiding: {
      type: Boolean
    },
    /**
     * Default icon for the button
     */
    icon: {
      type: String,
      default: 'times-circle'
    }
  },
  computed: {
    hasFilters () {
      return this.$store.getters['search/activeFilters'].length > 0
    },
    hasQuery () {
      return this.$store.state.search.field !== settings.defaultSearchField || this.$store.state.search.query !== ''
    },
    hasFiltersOrQuery () {
      return this.hasFilters || this.hasQuery
    },
    componentClasses () {
      return {
        ['btn-' + this.size]: true,
        ['btn-' + this.variant]: true
      }
    }
  },
  methods: {
    resetFiltersAndQuery () {
      this.$store.commit('search/resetFilterValues')
      this.$store.commit('search/resetQuery')
      this.$root.$emit('bv::hide::popover')
      /**
       * Filters have been reseted.
       */
      this.$root.$emit('filter::search::reset-filters')
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery']() }).catch(() => {})
    }
  }
}
</script>
