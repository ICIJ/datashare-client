<template>
  <filter-boilerplate v-bind="$props" ref="filter">
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
      return this.asyncItems ? this.recommendedByUsers : slice(this.recommendedByUsers, 0, settings.filterSize)
    }
  },
  filters: {
    displayUser
  },
  async mounted () {
    await this.$store.dispatch('search/getRecommendationsByProject')
    if (this.root && this.root.moreToDisplay) this.$set(this.root, 'moreToDisplay', this.recommendedByUsers.length > settings.filterSize)
    if (this.root && this.root.results) this.$set(this.root, 'results', { aggregations: { _id: { buckets: this.recommendedByUsers } } })
    this.root.$on('reset-filter-values', (_, refresh) => this.selectUsers([], refresh))
  },
  methods: {
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
