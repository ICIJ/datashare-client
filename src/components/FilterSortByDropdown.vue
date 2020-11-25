<template>
  <b-dropdown dropup no-caret size="sm" variant="link" toggle-class="filter__footer__action filter__footer__action--sort">
    <template v-slot:button-content>
      <fa icon="caret-up" fixed-width class="mr-1"></fa>
      {{ $t('filter.sortByDropdown.toggler') }}
    </template>
    <b-dropdown-item v-for="({ sortBy, sortByOrder, label }, $index) in sortByOptionsWithLabels"
                    :key="$index"
                    :active="isOptionActive({ sortBy, sortByOrder })"
                    @click="selectOption({ sortBy, sortByOrder })">
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
    sortByOptionsWithLabels () {
      return this.sortByOptions.map(({ sortBy, sortByOrder }) => {
        const key = `filter.sortByDropdown.options.${sortBy}.${sortByOrder}`
        const label = this.$t(key)
        return { label, sortBy, sortByOrder }
      })
    }
  },
  methods: {
    selectOption ({ sortBy, sortByOrder }) {
      if (sortBy !== this.sortBy) {
        this.$emit('update:sortBy', sortBy)
      }
      if (sortByOrder !== this.sortByOrder) {
        this.$emit('update:sortByOrder', sortByOrder)
      }
    },
    isOptionActive ({ sortBy, sortByOrder }) {
      return this.sortBy === sortBy && this.sortByOrder === sortByOrder
    }
  }
}
</script>
