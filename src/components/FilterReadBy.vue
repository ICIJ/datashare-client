<template>
  <filter-boilerplate v-bind="propsWithout('hide-show-more')" hide-show-more hide-exclude ref="filter">
    <template #items-group>
      <b-form-checkbox-group stacked v-model="selected" class="list-group-item p-0 border-0" @change="selectUsers">
        <b-form-checkbox v-for="userId in readBy" :value="userId" class="filter__items__item" :key="userId">
          <span>{{ userId }}</span>
        </b-form-checkbox>
      </b-form-checkbox-group>
    </template>
  </filter-boilerplate>
</template>

<script>
import FilterBoilerplate from '@/components/FilterBoilerplate'
import filters from '@/mixins/filters'
import utils from '@/mixins/utils'

export default {
  name: 'FilterReadBy',
  components: {
    FilterBoilerplate
  },
  mixins: [filters, utils],
  data () {
    return {
      readBy: []
    }
  },
  async mounted () {
    const readBy = await this.$store.dispatch('search/getProjectMarkReadUsers')
    this.$set(this, 'readBy', readBy)
    this.root.$on('reset-filter-values', () => this.selectUsers([]))
  },
  methods: {
    async selectUsers (users) {
      await this.$store.dispatch('search/getProjectMarkedReadDocuments', users)
      this.$set(this, 'selected', users)
      this.root.isAllSelected = users.length === 0
      this.$root.$emit('filter::add-filter-values', this.filter, this.selected)
      this.refreshRouteAndSearch()
    }
  }
}
</script>
