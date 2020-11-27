<template>
  <filter-boilerplate ref="filter"
                      v-bind="propsWithout('hide-show-more')"
                      hide-show-more
                      hide-exclude
                      hide-sort
                      :infinite-scroll="false"
                      @reset-filter-values="resetFilterValues">
    <template #items-group>
      <b-form-checkbox-group stacked v-model="selected" class="list-group-item p-0 border-0" @change="changeYesNoValue">
        <b-form-checkbox :value="true" class="filter__items__item">
          <span>
            <span class="filter__items__item__label px-1 text-truncate w-100 d-inline-block">
              {{ labelToHuman('filter.starred') }}
            </span>
            <span class="filter__items__item__count badge badge-pill badge-light float-right my-1">
              {{ $n(starredDocuments.length) }}
            </span>
          </span>
        </b-form-checkbox>
        <b-form-checkbox :value="false" class="filter__items__item">
          <span>
            <span class="filter__items__item__label px-1 text-truncate w-100 d-inline-block">
              {{ labelToHuman('filter.notStarred') }}
            </span>
            <span class="filter__items__item__count badge badge-pill badge-light float-right my-1">
              {{ $n(total) }}
            </span>
          </span>
        </b-form-checkbox>
      </b-form-checkbox-group>
    </template>
  </filter-boilerplate>
</template>

<script>
import get from 'lodash/get'
import { mapState } from 'vuex'

import FilterAbstract from '@/components/filter/types/FilterAbstract'
import FilterBoilerplate from '@/components/filter/FilterBoilerplate'
import utils from '@/mixins/utils'

/**
 * A Filter component to boolean values. Currently used for the "starred" filter but should be made generic in future versions.
 */
export default {
  name: 'FilterYesNo',
  extends: FilterAbstract,
  components: {
    FilterBoilerplate
  },
  mixins: [utils],
  computed: {
    ...mapState('search', ['starredDocuments']),
    total () {
      return Math.max(get(this, '$refs.filter.total', 0) - this.starredDocuments.length, 0)
    },
    selected: {
      get () {
        return this.getFilterValuesByName(this.filter.name)
      },
      set (values) {
        this.changeYesNoValue(values)
      }
    }
  },
  mounted () {
    return this.$store.dispatch('search/getStarredDocuments')
  },
  methods: {
    resetFilterValues (_, refresh) {
      return this.changeYesNoValue([], refresh)
    },
    changeYesNoValue (values = [], refresh = true) {
      if (values.length === 2) {
        values = values.slice(1)
      }
      this.setFilterValue(this.filter, { key: values })
      this.$root.$emit('filter::add-filter-values', this.filter, values)
      if (refresh) {
        this.refreshRouteAndSearch()
      }
    }
  }
}
</script>
