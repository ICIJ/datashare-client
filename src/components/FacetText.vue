<script>
import Response from '@/api/Response'
import each from 'lodash/each'
import { mixin } from 'mixins/facets'

export default {
  name: 'FacetText',
  props: ['facet'],
  mixins: [mixin],
  data () {
    return {
      response: Response.none(),
      collapseItems: false,
      isReady: false
    }
  },
  created () {
    this.aggregate()
    // Watch change on the facet store the restart aggregation
    this.$store.watch(this.watchedForUpdate, this.aggregate, { deep: true })
  },
  computed: {
    items () {
      return this.response.get(`aggregations.${this.facet.key}.buckets`, [])
    },
    headerIcon () {
      return this.collapseItems ? 'caret-right' : 'caret-down'
    },
    facetFilter () {
      return this.$store.getters['search/findFacet'](this.facet.name)
    },
    placeholderRows () {
      return [
        {
          height: '1em',
          boxes: [[0, '70%'], ['20%', '10%']]
        }
      ]
    },
    isGlobal () {
      return this.$store.state.aggregation.globalSearch
    }
  },
  methods: {
    aggregate () {
      if (this.facet) {
        this.isReady = false
        this.response = Response.none()
        return this.$store.dispatch('aggregation/query', this.facet).then(r => {
          this.response = this.addInvertedFacets(r)
          this.isReady = true
        })
      }
    },
    addInvertedFacets (response) {
      if (!this.isGlobal && this.facetFilter && this.facetFilter.reverse) {
        each(this.facetFilter.values, key => {
          response.push(`aggregations.${this.facet.key}.buckets`, { key })
        })
      }
      return response
    },
    addValue (item) {
      this.$store.commit('search/addFacetValue', this.facet.itemParam(item))
      this.refreshRoute()
    },
    removeValue (item) {
      this.$store.commit('search/removeFacetValue', this.facet.itemParam(item))
      this.refreshRoute()
    },
    toggleValue (item) {
      this.hasValue(item) ? this.removeValue(item) : this.addValue(item)
      this.refreshRoute()
    },
    invert () {
      this.$store.commit('search/toggleFacet', this.facet.name)
      this.refreshRoute()
    },
    hasValue (item) {
      return this.$store.getters['search/hasFacetValue'](this.facet.itemParam(item))
    },
    hasValues () {
      return this.isReady && this.$store.getters['search/hasFacetValues'](this.facet.name)
    },
    isReversed () {
      return this.$store.getters['search/isFacetReversed'](this.facet.name)
    },
    toggleItems () {
      this.collapseItems = !this.collapseItems
    },
    watchedForUpdate (state) {
      if (!state.aggregation.globalSearch) {
        // This will allow to watch change on the search only when
        // the aggregation is not global (ie. relative to the search).
        return state.search
      }
    },
    refreshRoute () {
      this.$router.push({
        name: 'search',
        query: this.$store.getters['search/toRouteQuery']
      })
    }
  }
}
</script>

<template>
  <div class="facet-text card" :class="{ 'facet-text--reversed': isReversed() }">
    <div class="card-header">
      <span v-if="hasValues()" class="float-right btn-group">
        <button class="btn btn-sm btn-outline-secondary py-0" @click="invert" :class="{ 'active': isReversed() }">
          <font-awesome-icon icon="eye-slash" />
          Invert
        </button>
      </span>
      <h6 @click="toggleItems">
        <font-awesome-icon :icon="headerIcon" />
        {{ facet.label || facet.name }}
      </h6>
    </div>
    <div class="list-group list-group-flush facet-text__items" v-if="!collapseItems">
      <div class="list-group facet__items__search py-2 px-3">
        <input v-model="facetQuery" type="search" :placeholder="$t('search.search-in') + ' ' + (facet.label || facet.name) + '...'" />
        <font-awesome-icon icon="search" class="float-right" />
      </div>
      <div class="list-group-item facet-text__items__item p-0" v-for="item in displayedFilteredItems()" :key="item.key" :class="{ 'facet-text__items__item--active': hasValue(item) }">
        <a href @click.prevent="toggleValue(item)" class="py-2 px-3">
          <span class="badge badge-pill badge-light float-right">
            {{ item.doc_count || 0 }}
          </span>
          {{ facet.itemLabel ? facet.itemLabel(item) : item.key }}
        </a>
      </div>
      <div v-if="!isReady">
        <content-placeholder class="list-group-item py-2 px-3" :rows="placeholderRows" />
        <content-placeholder class="list-group-item py-2 px-3" :rows="placeholderRows" />
        <content-placeholder class="list-group-item py-2 px-3" :rows="placeholderRows" />
      </div>
      <div class="list-group-item facet__items__display" @click="toogleDisplay" v-if="shouldDisplayShowMoreAction()">
        <span>{{ display.label }}</span>
        <font-awesome-icon :icon="display.icon" class="float-right" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .facet-text {

    &__items {

      &__item {
        position: relative;
        overflow: hidden;

        &--active {

          &:before {
            content: "";
            background: theme-color('primary');
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            width: 3px;
            box-shadow: 0 0 10px 0 theme-color('primary');
          }

          .facet-text--reversed & {
            text-decoration: line-through;

            &:before {
              background: $body-color;
              box-shadow: 0 0 10px 0 $body-color;
            }
          }
        }

        & > a {
          display: block;
        }
      }
    }
  }
</style>
