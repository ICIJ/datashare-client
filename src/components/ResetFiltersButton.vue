<template>
  <button class="btn" :class="componentClasses" @click="resetFilters" v-show="!autoHiding || hasFilters" :title="$t('search.clearFiltersDescription')" v-b-tooltip :disabled="!hasFilters">
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
      return this.$store.getters['search/activeFilters'].length > 0 || this.$store.state.search.field !== settings.defaultSearchField || this.$store.state.search.query !== ''
    },
    componentClasses () {
      return {
        ['btn-' + this.size]: true,
        ['btn-' + this.variant]: true
      }
    }
  },
  methods: {
    resetFilters () {
      this.$store.dispatch('search/reset', ['index', 'globalSearch', 'starredDocuments'])
      this.$root.$emit('bv::hide::popover')
      this.$root.$emit('filter::search::reset-filters')
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery']() }).catch(() => {})
    }
  }
}
</script>
