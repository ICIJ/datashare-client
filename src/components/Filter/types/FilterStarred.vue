<template>
  <filter-boilerplate
    ref="filter"
    v-bind="propsWithout('hide-show-more')"
    hide-show-more
    hide-exclude
    hide-contextualize
    hide-sort
    no-infinite-scroll
    @reset-filter-values="resetFilterValues"
  >
    <template #items-group>
      <b-form-checkbox-group v-model="selected" stacked class="list-group-item p-0 border-0">
        <div class="filter__items__item">
          <b-form-checkbox :value="true">
            <span class="d-flex align-items-center">
              <span class="filter__items__item__label pe-1 text-truncate d-inline-block">
                {{ labelToHuman('filter.starred') }}
              </span>
              <span class="filter__items__item__count my-auto ms-auto">
                <span class="badge rounded-pill text-bg-light">
                  {{ $n(starredDocuments.length) }}
                </span>
              </span>
            </span>
          </b-form-checkbox>
        </div>
        <div class="filter__items__item">
          <b-form-checkbox :value="false">
            <span class="d-flex align-items-center">
              <span class="filter__items__item__label pe-1 text-truncate d-inline-block">
                {{ labelToHuman('filter.notStarred') }}
              </span>
              <span class="filter__items__item__count my-auto ms-auto">
                <span class="badge rounded-pill text-bg-light">
                  {{ $n(total) }}
                </span>
              </span>
            </span>
          </b-form-checkbox>
        </div>
      </b-form-checkbox-group>
    </template>
  </filter-boilerplate>
</template>

<script>
import get from 'lodash/get'

import FilterAbstract from '@/components/Filter/types/FilterAbstract'
import FilterBoilerplate from '@/components/Filter/FilterBoilerplate'
import utils from '@/mixins/utils'

/**
 * A Filter component to boolean values. Currently used for the "starred" filter but should be made generic in future versions.
 */
export default {
  name: 'FilterStarred',
  components: {
    FilterBoilerplate
  },
  extends: FilterAbstract,
  mixins: [utils],
  computed: {
    total() {
      return Math.max(get(this, '$refs.filter.total', 0) - this.starredDocuments.length, 0)
    },
    selected: {
      get() {
        return this.getFilterValuesByName(this.filter.name)
      },
      set(values) {
        this.changeYesNoValue(values)
      }
    },
    starredDocuments() {
      return this.filter.starredDocuments
    }
  },
  mounted() {
    return this.$store.dispatch('starred/fetchIndicesStarredDocuments')
  },
  methods: {
    resetFilterValues(_, refresh) {
      return this.changeYesNoValue([], refresh)
    },
    changeYesNoValue(values = [], refresh = true) {
      if (values.length === 2) {
        values = values.slice(1)
      }
      this.setFilterValue(this.filter, { key: values })
      this.$core.emit('filter::add-filter-values', { filter: this.filter, values })
      if (refresh) {
        return this.refreshRouteAndSearch()
      }
    }
  }
}
</script>
