<template>
  <filter-boilerplate
    ref="filter"
    v-bind="propsWithout('hide-show-more')"
    hide-show-more
    hide-exclude
    hide-sort
    hide-contextualize
    no-infinite-scroll
    @reset-filter-values="resetFilterValues"
  >
    <template #all>
      <span class="filter__items__item__label px-1 text-truncate">
        {{ labelToHuman('all') }}
      </span>
    </template>
    <template #items-group>
      <b-form-checkbox-group v-model="selected" stacked class="list-group-item p-0 border-0">
        <div v-for="{ user, count } in recommendedByUsersSorted" :key="user" class="filter__items__item">
          <b-form-checkbox :value="user">
            <span class="d-flex">
              <span class="filter__items__item__label pe-1 text-truncate d-inline-block">
                <user-display :username="user" hide-avatar hide-link />
              </span>
              <span class="filter__items__item__count my-auto ms-auto">
                <span class="badge rounded-pill text-bg-light">
                  {{ $n(count) }}
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
import sortBy from 'lodash/sortBy'
import { mapState } from 'vuex'

import { EventBus } from '@/utils/event-bus'
import FilterBoilerplate from '@/components/filter/FilterBoilerplate'
import FilterAbstract from '@/components/filter/types/FilterAbstract'
import UserDisplay from '@/components/UserDisplay'
import utils from '@/mixins/utils'

/**
 * A Filter component to list number of documents recommended by each user.
 */
export default {
  name: 'FilterRecommendedBy',
  components: {
    FilterBoilerplate,
    UserDisplay
  },
  extends: FilterAbstract,
  mixins: [utils],
  computed: {
    ...mapState('recommended', { recommendedByUsers: 'byUsers' }),
    recommendedByUsersSorted() {
      // Sort by count (decreasing) and ensure the current user is first
      return sortBy(this.recommendedByUsers, ({ user, count }) => {
        return user === this.currentUserId ? -1e9 : -count
      })
    },
    currentUserId() {
      return this.$config ? this.$config.get('uid', 'local') : 'local'
    },
    selected: {
      get() {
        return this.getFilterValuesByName(this.filter.name)
      },
      set(values) {
        this.selectUsers(values)
      }
    }
  },
  async mounted() {
    await this.$store.dispatch('recommended/fetchIndicesRecommendations')
  },
  methods: {
    resetFilterValues(_, refresh) {
      return this.selectUsers([], refresh)
    },
    async selectUsers(users = [], refresh = true) {
      this.setFilterValue(this.filter, { key: users })
      await this.$store.dispatch('recommended/getDocumentsRecommendedBy', users)
      this.$core.emit('filter::add-filter-values', { filter: this.filter, values: this.selected })
      if (refresh) {
        this.refreshRouteAndSearch()
      }
    }
  }
}
</script>
