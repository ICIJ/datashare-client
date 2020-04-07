<template>
  <filter-boilerplate v-bind="propsWithout('hide-show-more')" hide-show-more ref="filter">
    <template #items-group>
      <b-form-checkbox-group stacked v-model="selected" class="list-group-item p-0 border-0" @change="selectUsers">
        <b-form-checkbox v-for="userId in readByUsers" :value="userId" class="filter__items__item" :key="userId">
          <span>{{ userId | displayUser }}</span>
        </b-form-checkbox>
      </b-form-checkbox-group>
    </template>
  </filter-boilerplate>
</template>

<script>
import { mapState } from 'vuex'

import FilterBoilerplate from '@/components/FilterBoilerplate'
import displayUser from '@/filters/displayUser'
import filters from '@/mixins/filters'
import utils from '@/mixins/utils'

export default {
  name: 'FilterReadBy',
  components: {
    FilterBoilerplate
  },
  filters: {
    displayUser
  },
  mixins: [filters, utils],
  computed: {
    ...mapState('search', ['readByUsers'])
  },
  async mounted () {
    await this.$store.dispatch('search/getProjectMarkReadUsers')
    this.root.$on('reset-filter-values', () => this.selectUsers([]))
  },
  methods: {
    async selectUsers (users) {
      await this.$store.dispatch('search/getDocumentsReadBy', users)
      this.$set(this, 'selected', users)
      this.root.isAllSelected = users.length === 0
      this.$root.$emit('filter::add-filter-values', this.filter, this.selected)
      this.refreshRouteAndSearch()
    }
  }
}
</script>
