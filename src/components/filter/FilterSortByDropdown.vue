<template>
  <b-dropdown
    dropup
    no-caret
    size="sm"
    variant="link"
    toggle-class="filter__footer__action filter__footer__action--sort"
  >
    <template #button-content>
      <fa icon="caret-up" fixed-width />
      {{ $t('filter.sortByDropdown.toggler') }}
    </template>
    <b-dropdown-item
      v-for="({ sortByFromFilter, sortByOrderFromFilter, label }, $index) in sortByOptionsWithLabels"
      :key="$index"
      :active="isOptionActive({ sortByFromFilter, sortByOrderFromFilter })"
      @click="selectOption({ sortByFromFilter, sortByOrderFromFilter })"
    >
      {{ label }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import settings from '@/utils/settings'

export default {
  name: 'FilterSortByDropdown',
  model: {
    prop: 'sortBy',
    event: 'update:sortBy'
  },
  props: {
    sortBy: {
      type: String,
      default: '_count'
    },
    sortByOrder: {
      type: String,
      default: 'desc'
    },
    sortByOptions: {
      type: Array,
      default: () => settings.filter.sortByOptions
    }
  },
  computed: {
    sortByOptionsWithLabels() {
      return this.sortByOptions.map(({ sortBy, sortByOrder }) => {
        const key = `filter.sortByDropdown.options.${sortBy}.${sortByOrder}`
        const label = this.$t(key)
        return { label, sortByFromFilter: sortBy, sortByOrderFromFilter: sortByOrder }
      })
    }
  },
  methods: {
    selectOption({ sortByFromFilter, sortByOrderFromFilter }) {
      if (sortByFromFilter !== this.sortBy) {
        this.$emit('update:sortBy', sortByFromFilter)
      }
      if (sortByOrderFromFilter !== this.sortByOrder) {
        this.$emit('update:sortByOrder', sortByOrderFromFilter)
      }
    },
    isOptionActive({ sortByFromFilter, sortByOrderFromFilter }) {
      return this.sortBy === sortByFromFilter && this.sortByOrder === sortByOrderFromFilter
    }
  }
}
</script>
