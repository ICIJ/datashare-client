<script>
import Response from '@/api/Response'
import { mixin } from 'mixins/facets'

export default {
  name: 'FacetNamedEntity',
  props: ['facet'],
  mixins: [mixin],
  data () {
    return {
      response: Response.none(),
      collapseItems: false
    }
  },
  created () {
    this.aggregate()
  },
  computed: {
    headerIcon () {
      return this.collapseItems ? 'caret-right' : 'caret-down'
    }
  },
  methods: {
    aggregate () {
      if (this.facet) {
        return this.$store.dispatch('aggregation/query', this.facet).then(r => {
          this.response = r
        })
      }
    },
    toggleItems () {
      this.collapseItems = !this.collapseItems
    }
  }
}
</script>

<template>
  <div class="facet-named-entity card card-default">
    <div class="card-header">
      <h6 @click="toggleItems">
        <font-awesome-icon :icon="headerIcon" />
        {{ facet.label || facet.name }}
      </h6>
    </div>
    <div class="list-group list-group-flush facet-named-entity__items" v-if="!collapseItems">
      <div class="list-group-item facet-named-entity__items__item" v-for="item in displayedItems" :key="item.key">
        <router-link :to="{ name: 'search', query: { q: item.key }}" >
          <div class="badge badge-pill badge-primary mr-1 text-uppercase facet-named-entity__items__item__key">
            {{ item.key }}
          </div>
          <div class="text-secondary small facet-named-entity__items__item__description">
            {{
              $t('aggregations.mentions.item', {
                occurrences: $tc('aggregations.mentions.occurrence', item.doc_count, { count: item.doc_count }),
                documents: $tc('aggregations.mentions.document', item.docs.value, { count: item.docs.value })
              })
            }}
          </div>
        </router-link>
      </div>
      <div class="list-group-item facet__items__display" @click="toogleDisplay" v-if="shouldDisplayShowMoreAction()">
        <span>{{ display.label }}</span>
        <font-awesome-icon :icon="display.icon" class="float-right"/>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .facet-named-entity__items__item__key {
    white-space: normal;
  }
  .facet-named-entity__items__item__description {
    font-style: italic;
  }
</style>
