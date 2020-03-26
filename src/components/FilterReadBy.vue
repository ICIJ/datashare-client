<template>
  <filter-boilerplate v-bind="propsWithout('hide-show-more')" hide-show-more hide-exclude ref="filter">
    <template #items-group>
      <b-form-checkbox-group stacked v-model="selected" class="list-group-item p-0 border-0">
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
import { mapState } from 'vuex'

export default {
  name: 'FilterReadBy',
  components: {
    FilterBoilerplate
  },
  mixins: [filters, utils],
  computed: {
    ...mapState('search', ['readBy'])
  },
  created () {
    this.$store.dispatch('search/getProjectMarkReadUsers')
  }
}
</script>
