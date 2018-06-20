<script>
import Response from '@/api/Response'
import slice from 'lodash/slice'

export default {
  name: 'FacetNamedEntity',
  props: ['facet'],
  data () {
    return {
      response: Response.none(),
      collapseItems: false,
      display: {
        icon: 'angle-down',
        label: 'More',
        size: 5
      }
    }
  },
  created () {
    this.aggregate()
  },
  computed: {
    items () {
      return this.response.get(`aggregations.${this.facet.key}.buckets`, [])
    },
    headerIcon () {
      return this.collapseItems ? 'caret-right' : 'caret-down'
    },
    displayedItems () {
      return slice(this.items, 0, this.display.size)
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
    },
    toogleDisplay () {
      this.display.icon = this.display.icon === 'angle-down' ? 'angle-up' : 'angle-down'
      this.display.label = this.display.label === 'More' ? 'Less' : 'More'
      this.display.size = this.display.size === 5 ? -1 : 5
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
      <div class="list-group-item facet-named-entity__items__display" @click="toogleDisplay" v-if="items.length > 5">
        <font-awesome-icon :icon="display.icon" />
        <span>{{ display.label }}</span>
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
