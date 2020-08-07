<template>
  <filter-boilerplate v-bind="$props" ref="filter">
    <template #items-group>
      <b-form-checkbox-group stacked v-model="selected" class="list-group-item p-0 border-0" @change="selectUsers">
        <b-form-checkbox v-for="userId in sampleRecommendedByUsers" :value="userId" class="filter__items__item" :key="userId">
          <span>{{ userId | displayUser }}</span>
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
 * A Filter component to list number of document recommended by each user.
 */
export default {
  name: 'FilterRecommendedBy',
  components: {
    FilterBoilerplate
  },
  filters: {
    displayUser
  },
  mixins: [filters, utils],
  computed: {
    ...mapState('search', ['recommendedByUsers']),
    sampleRecommendedByUsers () {
      return slice(this.recommendedByUsers, 0, settings.filterSize)
    }
  },
  async mounted () {
    await this.$store.dispatch('search/getRecommendationsByProject')
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
