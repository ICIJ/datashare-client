<script>
import Response from '@/api/Response'

export default {
  name: 'FacetNamedEntity',
  props: ['facet'],
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
    items () {
      return this.response.get(`aggregations.${this.facet.key}.buckets`, [])
    },
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
      <div class="list-group-item facet-named-entity__items__item"  v-for="item in items" :key="item.key">
        <router-link :to="{ name: 'search', query: { q: item.key }}" >
          <span class="badge badge-pill badge-primary mr-1 text-uppercase facet-named-entity__items__item__key">
            {{ item.key }}
          </span>
          <span class="text-secondary small facet-named-entity__items__item__description">
            {{
              $t('aggregations.mentions.item', {
                occurrences: $tc('aggregations.mentions.occurrence', item.doc_count, { count: item.doc_count }),
                documents: $tc('aggregations.mentions.document', item.docs.value, { count: item.docs.value })
              })
            }}
          </span>
        </router-link>
      </div>
    </div>
  </div>
</template>
