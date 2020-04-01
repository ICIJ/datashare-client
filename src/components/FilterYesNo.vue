<template>
  <filter-boilerplate v-bind="propsWithout('hide-show-more')" hide-show-more hide-exclude ref="filter">
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
            ${this.$n(this.root.calculatedCount - this.starredDocuments.length)}
          </span>
        `
      }]
    }
  },
  mounted () {
    this.root.$on('reset-filter-values', () => this.changeYesNoValue([]))
    this.$store.dispatch('search/getStarredDocuments')
  },
  methods: {
    changeYesNoValue (item) {
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
      this.refreshRouteAndSearch()
    }
  }
}
</script>
