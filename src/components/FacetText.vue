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
    }
  }
}
</script>

<template>
  <div class="facet-text card card-default" v-if="facet">
    <div class="card-header">
      {{ facet.name }}
    </div>
    <div class="list-group list-group-flush facet-text__items">
      <router-link class="list-group-item facet-text__items__item py-1" v-for="item in items" :key="item.key" :to="{ name: 'search', query: { q: item.key }}" >
        {{ item.key }}
      </router-link>
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
