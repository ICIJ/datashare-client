<template>
  <span class="search-settings">
    <button type="button" class="btn btn-icij" id="toggleSettings" title="Search settings" v-b-tooltip.hover>
      <font-awesome-icon icon="cog" />
      <span class="sr-only">Search settings</span>
    </button>
    <b-popover target="toggleSettings" triggers="click" :placement="placement" :container="container">
      <template slot="title">
        <font-awesome-icon icon="cog" />
        Search settings
      </template>
      <div class="search-settings__popover">
        <div class="row py-2">
          <div class="col-8">
            <p class="m-0">
              <label for="input-global" class="m-0">
                Contextualize the search results with the facets:
              </label>
            </p>
            <p class="text-muted m-0">
              Facets on the right panel will be updated according to the search results.
            </p>
          </div>
          <div class="col-4 text-right">
            <input type="checkbox" id="input-global" v-model="relativeSearch" />
          </div>
        </div>
        <div class="row py-2">
          <div class="col-8">
            <p class="m-0">
              <label for="input-reset" class="m-0">
                Reset the filter facets:
              </label>
            </p>
            <p class="text-muted m-0">
              Remove selected facet from the search.
            </p>
          </div>
          <div class="col-4 text-right">
            <button class="btn btn-secondary btn-sm" id="input-reset" @click="resetFacets" :disabled="!hasFacets">
              Reset
            </button>
          </div>
        </div>
        <div class="row py-2">
          <label class="col-8" for="input-page-size">
            Number of results by page:
          </label>
          <div class="col-4 text-right">
            <select v-model="selectedSize" @change="changeSize" class="custom-select custom-select-sm" id="input-page-size">
              <option v-for="size in sizes" :key="size">
                {{ size }}
              </option>
            </select>
          </div>
        </div>
        <div class="row py-2">
          <label class="col-8" for="input-sort">
            Sort results by:
          </label>
          <div class="col-4 text-right">
            <select v-model="selectedSort" @change="changeSort" class="custom-select custom-select-sm" id="input-sort">
              <option v-for="sort in sorts" :key="sort" :value="sort">
                {{ $t('search.results.sort.' + sort) }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </b-popover>
  </span>
</template>

<script>
import bPopover from 'bootstrap-vue/es/components/popover/popover'

export default {
  name: 'SearchSettings',
  components: { bPopover },
  data () {
    return {
      relativeSearch: !this.$store.state.aggregation.globalSearch,
      sizes: [10, 25, 50, 100],
      selectedSize: this.$store.state.search.size,
      sorts: ['relevance', 'dateNewest', 'dateOldest', 'sizeLargest', 'sizeSmallest'],
      selectedSort: this.$store.state.search.sort
    }
  },
  props: {
    placement: {
      type: String,
      default: 'auto'
    }
  },
  watch: {
    relativeSearch (relativeSearch) {
      this.$store.commit('aggregation/setGlobalSearch', !relativeSearch)
      this.$root.$emit('bv::hide::popover')
    }
  },
  methods: {
    changeSize () {
      // Store new search size into store
      this.$store.commit('search/size', this.selectedSize)
      this.$root.$emit('bv::hide::popover')
      // Change the route
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
    },
    changeSort () {
      // Store new search size into store
      this.$store.commit('search/sort', this.selectedSort)
      this.$root.$emit('bv::hide::popover')
      // Change the route
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
    },
    resetFacets () {
      this.$store.dispatch('search/reset')
      this.$root.$emit('bv::hide::popover')
    }
  },
  computed: {
    hasFacets () {
      return this.$store.state.search.facets.length > 0
    }
  }
}
</script>

<style lang="scss">
  .search-settings {
    &__popover {
      width: 100%;
    }
  }
</style>
