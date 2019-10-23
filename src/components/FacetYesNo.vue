<template>
  <facet v-bind="propsWithout('hide-show-more')" hide-show-more hide-exclude ref="facet">
    <template #items-group>
      <b-form-checkbox-group stacked v-model="selected" class="list-group-item p-0 border-0" @change="changeYesNoValue">
        <b-form-checkbox v-for="{ value, html } in options" :value="value" class="facet__items__item" :key="value">
          <span v-html="html"></span>
        </b-form-checkbox>
      </b-form-checkbox-group>
    </template>
  </facet>
</template>

<script>
import { mapState } from 'vuex'
import Facet from '@/components/Facet'
import facets from '@/mixins/facets'
import utils from '@/mixins/utils'

export default {
  name: 'FacetYesNo',
  components: { Facet },
  mixins: [facets, utils],
  computed: {
    ...mapState('search', ['starredDocuments']),
    options () {
      return [{
        value: true,
        html: `
          <span class="facet__items__item__label px-1 text-truncate w-100 d-inline-block">
            ${this.labelToHuman('facet.starred')}
          </span>
          <span class="facet__items__item__count badge badge-pill badge-light float-right my-1">
            ${this.$n(this.starredDocuments.length)}
          </span>
        `
      }, {
        value: false,
        html: `
          <span class="facet__items__item__label px-1 text-truncate w-100 d-inline-block">
            ${this.labelToHuman('facet.notStarred')}
          </span>
          <span class="facet__items__item__count badge badge-pill badge-light float-right my-1">
            ${this.$n(this.root.calculatedCount - this.starredDocuments.length)}
          </span>
        `
      }]
    }
  },
  mounted () {
    this.root.$on('reset-facet-values', () => this.changeYesNoValue([]))
  },
  created () {
    return this.$store.dispatch('search/getStarredDocuments')
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
      this.$root.$emit('facet::add-facet-values', this.facet, this.selected)
      this.refreshRouteAndSearch()
    }
  }
}
</script>
