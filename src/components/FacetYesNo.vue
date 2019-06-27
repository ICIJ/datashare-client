<template>
  <facet v-bind="propsWithout('hide-show-more')" hide-show-more ref="facet">
    <template #item>
      <b-form-checkbox-group stacked v-model="selected" :options="options" class="list-group-item facet__items__item p-0 border-0" @change="changeYesNoValue" />
    </template>
  </facet>
</template>

<script>
import Facet from '@/components/Facet'
import facets from '@/mixins/facets'
import utils from '@/mixins/utils'
import DatashareClient from '@/api/DatashareClient'
import capitalize from 'lodash/capitalize'

const datashare = new DatashareClient()

export default {
  name: 'FacetYesNo',
  components: { Facet },
  mixins: [facets, utils],
  data () {
    return {
      starredDocuments: []
    }
  },
  computed: {
    options () {
      return [{
        value: true,
        html: `
          <span class="facet__items__item__label px-1 text-truncate w-100 d-inline-block">
            ${capitalize(this.labelToHuman(this.facet.name))}
          </span>
          <span class="facet__items__item__count badge badge-pill badge-light float-right my-1">
            ${this.starredDocuments.length}
          </span>
        `
      }, {
        value: false,
        html: `
          <span class="facet__items__item__label px-1 text-truncate w-100 d-inline-block">
            ${capitalize(this.labelToHuman('facet.not'))} ${this.labelToHuman(this.facet.name)}
          </span>
          <span class="facet__items__item__count badge badge-pill badge-light float-right my-1">
            ${this.root.calculatedCount - this.starredDocuments.length}
          </span>
        `
      }]
    }
  },
  async mounted () {
    this.root.$on('reset-facet-values', () => this.changeYesNoValue([]))
    this.starredDocuments = await datashare.getStarredDocuments(this.$store.state.search.index).then(r => r.clone().json())
    this.$store.commit('search/setStarredDocuments', { facet: this.facet, starredDocuments: this.starredDocuments })
  },
  beforeUpdate () {
    this.$store.commit('search/setStarredDocuments', { facet: this.facet, starredDocuments: this.starredDocuments })
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
      this.refreshRoute()
    }
  }
}
</script>
