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
        <b-form-checkbox v-for="{ user, count } in recommendedByUsersSorted" :value="user" class="filter__items__item" :key="user">
          <span class="d-flex">
            <span class="filter__items__item__label px-1 text-truncate w-100 d-inline-block">
              {{ user | displayUser(currentUserId) }}
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
import sortBy from 'lodash/sortBy'
import { mapState } from 'vuex'

import FilterBoilerplate from '@/components/filter/FilterBoilerplate'
import FilterAbstract from '@/components/filter/types/FilterAbstract'
import displayUser from '@/filters/displayUser'
import utils from '@/mixins/utils'

/**
 * A Filter component to list number of documents recommended by each user.
 */
export default {
  name: 'FilterRecommendedBy',
  extends: FilterAbstract,
  components: {
    FilterBoilerplate
  },
  mixins: [utils],
  computed: {
    ...mapState('search', ['recommendedByUsers', 'recommendedByTotal']),
    recommendedByUsersSorted () {
      // Sort by count (decreasing) and ensure the current user is first
      return sortBy(this.recommendedByUsers, ({ user, count }) => {
        return user === this.currentUserId ? -1e9 : -count
      })
    },
    currentUserId () {
      return this.$config ? this.$config.get('uid', 'local') : 'local'
    },
    selected: {
      get () {
        return this.getFilterValuesByName(this.filter.name)
      },
      set (values) {
        this.selectUsers(values)
      }
    }
  },
  filters: {
    displayUser
  },
  async mounted () {
    await this.$store.dispatch('search/getRecommendationsByProject')
  },
  methods: {
    resetFilterValues (_, refresh) {
      return this.selectUsers([], refresh)
    },
    async selectUsers (users = [], refresh = true) {
      this.setFilterValue(this.filter, { key: users })
      await this.$store.dispatch('search/getDocumentsRecommendedBy', users)
      // eslint-disable-next-line vue/custom-event-name-casing
      this.$root.$emit('filter::add-filter-values', this.filter, this.selected)
      if (refresh) {
        this.refreshRouteAndSearch()
      }
    }
  }
}
</script>
