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
        <b-form-checkbox v-for="{ value, html } in options" :value="value" class="filter__items__item" :key="value">
          <span v-html="html"></span>
        </b-form-checkbox>
      </b-form-checkbox-group>
    </template>
  </filter-boilerplate>
</template>

<script>
import { mapState } from 'vuex'

import FilterBoilerplate from '@/components/FilterBoilerplate'
import filters from '@/mixins/filters'
import utils from '@/mixins/utils'

/**
 * A Filter component to boolean values. Currently used for the "starred" filter but should be made generic in future versions.
 */
export default {
  name: 'FilterYesNo',
  components: {
    FilterBoilerplate
  },
  mixins: [filters, utils],
  computed: {
    ...mapState('search', ['starredDocuments']),
    options () {
      return [{
        value: true,
        html: `
          <span class="filter__items__item__label px-1 text-truncate w-100 d-inline-block">
            ${this.labelToHuman('filter.starred')}
          </span>
          <span class="filter__items__item__count badge badge-pill badge-light float-right my-1">
            ${this.$n(this.starredDocuments.length)}
          </span>
        `
      }, {
        value: false,
        html: `
          <span class="filter__items__item__label px-1 text-truncate w-100 d-inline-block">
            ${this.labelToHuman('filter.notStarred')}
          </span>
          <span class="filter__items__item__count badge badge-pill badge-light float-right my-1">
            ${this.$n(this.root.total - this.starredDocuments.length)}
          </span>
        `
      }]
    }
  },
  async mounted () {
    this.$store.dispatch('search/getStarredDocuments')
  },
  methods: {
    resetFilterValues (_, refresh) {
      return this.changeYesNoValue([], refresh)
    },
    changeYesNoValue (item = [], refresh = true) {
      switch (item.length) {
        case 0:
          this.$set(this, 'selected', [])
          this.root.isAllSelected = true
          break
        case 1:
          this.$set(this, 'selected', item)
          this.root.isAllSelected = false
          break
        case 2:
          this.$set(this, 'selected', item.slice(1))
          break
      }
      this.$root.$emit('filter::add-filter-values', this.filter, this.selected)
      if (refresh) this.refreshRouteAndSearch()
    }
  }
}
</script>
