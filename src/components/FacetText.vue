<script>
import Response from '@/api/Response'

export default {
  name: 'FacetText',
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
    },
    add (item) {
      this.$store.dispatch('search/addFacet', this.facet.param(item))
    }
  }
}
</script>

<template>
  <div class="facet-text card card-default">
    <div class="card-header">
      {{ facet.name }}
    </div>
    <div class="list-group list-group-flush facet-text__items">
      <div class="list-group-item facet-text__items__item p-0" v-for="item in items" :key="item.key">
        <button class="btn btn-link btn-xs" @click="add(item)">
          {{ item.key }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .facet-text {
    &__items {
      max-height: 15rem;
      overflow: auto;
    }
  }
</style>
