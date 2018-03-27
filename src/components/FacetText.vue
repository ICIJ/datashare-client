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
    addValue (item) {
      this.$store.dispatch('search/addFacetValue', this.facet.param(item))
    },
    removeValue (item) {
      this.$store.dispatch('search/removeFacetValue', this.facet.param(item))
    },
    toggleValue (item) {
      return this.hasValue(item) ? this.removeValue(item) : this.addValue(item)
    },
    hasValue (item) {
      return this.$store.getters['search/hasFacetValue'](this.facet.param(item))
    },
    hasValues () {
      return this.$store.getters['search/hasFacetValues'](this.facet.key)
    },
    isReversed () {
      return this.$store.getters['search/isFacetReversed'](this.facet.key)
    },
    invert () {
      this.$store.dispatch('search/invertFacet', this.facet.key)
    }
  }
}
</script>

<template>
  <div class="facet-text card card-default" :class="{ 'facet-text--reversed': isReversed() }">
    <div class="card-header">
      <h6 class="float-left mb-0 py-1">
        {{ facet.label || facet.name }}
      </h6>
      <span v-if="hasValues()" class="float-right btn-group">
        <button class="btn btn-sm btn-outline-secondary py-0" @click="invert" :class="{ 'active': isReversed() }">
          <font-awesome-icon icon="eye-slash" />
          Invert
        </button>
      </span>
    </div>
    <div class="list-group list-group-flush facet-text__items">
      <div class="list-group-item facet-text__items__item p-0" v-for="item in items" :key="item.key" :class="{ 'facet-text__items__item--active': hasValue(item) }">
        <a href @click.prevent="toggleValue(item)" class="py-2 px-3">
          <span class="badge badge-primary float-right">
            {{ item.doc_count }}
          </span>
          {{ item.key }}
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .facet-text {

    &__items {
      max-height: 15rem;
      overflow: auto;

      &__item {

        &--active {
          font-weight: bolder;
          background: $mark-bg;

          .facet-text--reversed & {
            text-decoration: line-through;
          }
        }

        & > a {
          display: block;
        }
      }
    }
  }
</style>
