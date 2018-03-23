<script>
import Response from '@/api/Response'

export default {
  name: 'FacetNamedEntity',
  props: ['facet'],
  data () {
    return {
      response: Response.none()
    }
  },
  created () {
    this.aggregate()
  },
  computed: {
    items () {
      return this.response.get(`aggregations.${this.facet.key}.buckets`, [])
    }
  },
  methods: {
    aggregate () {
      if (this.facet) {
        return this.$store.dispatch('aggregation/query', this.facet).then(r => {
          this.response = r
        })
      }
    }
  }
}
</script>

<template>
  <div class="facet-named-entity card card-default">
    <div class="card-header">
      {{ facet.name }}
    </div>
    <div class="list-group list-group-flush facet-named-entity__items">
      <router-link class="list-group-item facet-named-entity__items__item" v-for="item in items" :key="item.key" :to="{ name: 'search', query: { q: item.key }}" >
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
</template>

<style lang="scss" scoped>
  .facet-named-entity {
    &__items {
      max-height: 15rem;
      overflow: auto;
    }
  }
</style>
