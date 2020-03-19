<template>
  <filter-boilerplate v-bind="$props" ref="filter">
    <template #all>
      <span class="d-flex">
        <span class="filter__items__item__label px-1 text-truncate w-100 d-inline-block">
          {{ labelToHuman('all') }}
        </span>
        <span class="filter__items__item__count badge badge-pill badge-light float-right mt-1">
          {{ $n(totalCount) }}
        </span>
      </span>
    </template>
  </filter-boilerplate>
</template>

<script>
import filters from '@/mixins/filters'
import FilterBoilerplate from '@/components/FilterBoilerplate'
import get from 'lodash/get'
import sumBy from 'lodash/sumBy'

export default {
  name: 'FilterDate',
  components: {
    FilterBoilerplate
  },
  mixins: [filters],
  data () {
    return {
      totalCount: 0
    }
  },
  mounted () {
    this.$store.dispatch('search/queryFilter', { name: this.filter.name, options: { size: 1000, interval: 'month' } }).then(response => {
      this.$set(this, 'totalCount', sumBy(get(response, this.resultPath, []), 'doc_count'))
    })
  }
}
</script>
