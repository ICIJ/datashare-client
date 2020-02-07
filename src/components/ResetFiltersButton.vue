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

export default {
  name: 'ResetFiltersButton',
  props: {
    variant: {
      default: 'btn-outline-secondary',
      type: String
    },
    size: {
      default: 'sm',
      type: String
    },
    noIcon: {
      type: Boolean
    },
    autoHiding: {
      type: Boolean
    },
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
      this.$root.$emit('filter::search::reset-filters')
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery']() }).catch(() => {})
    }
  }
}
</script>
