<template>
  <filter-boilerplate v-bind="$props" ref="filter">
    <template #all>
      <span class="d-flex">
        <span class="filter__items__item__label px-1 text-truncate w-100 d-inline-block">
          {{ labelToHuman('all') }}
        </span>
        <span class="filter__items__item__count badge badge-pill badge-light float-right mt-1">
          {{ $n(countAll) }}
        </span>
      </span>
    </template>
  </filter-boilerplate>
</template>

<script>
import filters from '@/mixins/filters'
import FilterBoilerplate from '@/components/FilterBoilerplate'

export default {
  name: 'FilterText',
  components: { FilterBoilerplate },
  mixins: [filters],
  computed: {
    countAll () {
      return this.root.asyncTotal || this.root.total
    }
  }
}
</script>
