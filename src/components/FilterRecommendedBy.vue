<template>
  <filter-boilerplate ref="filter"
                      v-bind="propsWithout('hide-show-more')"
                      hide-show-more
                      hide-exclude
                      hide-sort
                      :infinite-scroll="false"
                      @reset-filter-values="resetFilterValues">
    <template #all>
      <span class="d-flex">
        <span class="filter__items__item__label px-1 text-truncate w-100 d-inline-block">
          {{ labelToHuman('all') }}
        </span>
        <span class="filter__items__item__count badge badge-pill badge-light float-right mt-1">
          {{ $n(recommendedByTotal) }}
        </span>
      </span>
    </template>
    <template #items-group>
      <b-form-checkbox-group stacked v-model="selected" class="list-group-item p-0 border-0" @change="selectUsers">
        <b-form-checkbox v-for="{ user, count } in sampleRecommendedByUsers" :value="user" class="filter__items__item" :key="user">
          <span class="d-flex">
            <span class="filter__items__item__label px-1 text-truncate w-100 d-inline-block">
              {{ user | displayUser }}
            </span>
            <span class="filter__items__item__count badge badge-pill badge-light float-right mt-1">
              {{ $n(count) }}
            </span>
          </span>
        </b-form-checkbox>
      </b-form-checkbox-group>
    </template>
  </filter-boilerplate>
</template>

<script>
import slice from 'lodash/slice'
import { mapState } from 'vuex'

import FilterBoilerplate from '@/components/FilterBoilerplate'
import displayUser from '@/filters/displayUser'
import filters from '@/mixins/filters'
import utils from '@/mixins/utils'
import settings from '@/utils/settings'

/**
 * A Filter component to list number of documents recommended by each user.
 */
export default {
  name: 'FilterRecommendedBy',
  components: {
    FilterBoilerplate
  },
  mixins: [filters, utils],
  computed: {
    ...mapState('search', ['recommendedByUsers', 'recommendedByTotal']),
    sampleRecommendedByUsers () {
      return slice(this.recommendedByUsers, 0, settings.filter.bucketSize)
    }
  },
  filters: {
    displayUser
  },
  async mounted () {
    await this.$store.dispatch('search/getRecommendationsByProject')
    if (this.root && this.root.results) {
      this.$set(this.root, 'results', {
        aggregations: {
          _id: {
            buckets: this.recommendedByUsers
          }
        }
      })
    }
  },
  methods: {
    resetFilterValues (_, refresh) {
      return this.selectUsers([], refresh)
    },
    async selectUsers (users = [], refresh = true) {
      await this.$store.dispatch('search/getDocumentsRecommendedBy', users)
      this.$set(this, 'selected', users)
      this.root.isAllSelected = users.length === 0
      this.$root.$emit('filter::add-filter-values', this.filter, this.selected)
      if (refresh) this.refreshRouteAndSearch()
    }
  }
}
</script>
