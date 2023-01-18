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
    prop: 'sort',
    event: 'update:sort'
  },
  props: {
    sort: {
      type: Object,
      default: () => ({ sortBy: '_count', sortByOrder: 'desc' })
    },
    sortByOptions: {
      type: Array,
      default: () => settings.filter.sortByOptions
    }
  },
  computed: {
    sortBy() {
      return this.sort.sortBy
    },
    sortByOrder() {
      return this.sort.sortByOrder
    },
    sortByOptionsWithLabels() {
      return this.sortByOptions.map(({ sortBy, sortByOrder }) => {
        const key = `filter.sortByDropdown.options.${sortBy}.${sortByOrder}`
        const label = this.$t(key)
        return { label, sortByFromFilter: sortBy, sortByOrderFromFilter: sortByOrder }
      })
    }
  },
  methods: {
    selectOption({ sortByFromFilter: sortBy, sortByOrderFromFilter: sortByOrder }) {
      if (sortBy !== this.sortBy || sortByOrder !== this.sortByOrder) {
        this.$emit('update:sort', { sortBy, sortByOrder })
      }
    },
    isOptionActive({ sortByFromFilter: sortBy, sortByOrderFromFilter: sortByOrder }) {
      return this.sortBy === sortBy && this.sortByOrder === sortByOrder
    }
  }
}
</script>
