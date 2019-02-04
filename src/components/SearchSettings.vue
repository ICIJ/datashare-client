<template>
  <span class="search-settings">
    <button type="button" class="btn btn-primary" id="toggleSettings" :title="$t('search.settings.title')" v-b-tooltip.hover>
      <font-awesome-icon icon="cog" />
      <span class="sr-only">
        {{ $t('search.settings.title') }}
      </span>
    </button>
    <b-popover target="toggleSettings" triggers="click" :placement="placement" :container="container">
      <template slot="title">
        <font-awesome-icon icon="cog" />
        {{ $t('search.settings.title') }}
      </template>
      <div class="search-settings__popover">
        <div class="row py-2">
          <div class="col-8">
            <p class="m-0">
              <label for="input-global" class="m-0">
                {{ $t('search.settings.contextualize') }}
              </label>
            </p>
            <p class="text-muted m-0">
              {{ $t('search.settings.contextualize_explanation') }}
            </p>
          </div>
          <div class="col-4 text-right">
            <input type="checkbox" id="input-global" v-model="relativeSearch" />
          </div>
        </div>
        <div class="row py-2">
          <div class="col-8">
            <p class="m-0">
              <label class="m-0">
                {{ $t('search.settings.reset_filters') }}
              </label>
            </p>
            <p class="text-muted m-0">
              {{ $t('search.settings.reset_filters_explanation') }}
            </p>
          </div>
          <div class="col-4 text-right">
            <reset-filters-button />
          </div>
        </div>
        <div class="row py-2">
          <label class="col-8" for="input-page-size">
            {{ $t('search.settings.results_per_page') }}
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
            {{ $t('search.settings.sort_by') }}
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
import ResetFiltersButton from '@/components/ResetFiltersButton'

export default {
  name: 'SearchSettings',
  components: { bPopover, ResetFiltersButton },
  data () {
    return {
      relativeSearch: !this.$store.state.search.globalSearch,
      sizes: [10, 25, 50, 100],
      selectedSize: this.$store.state.search.size,
      sorts: ['relevance', 'dateNewest', 'dateOldest', 'sizeLargest', 'sizeSmallest'],
      selectedSort: this.$store.state.search.sort,
      // https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties
      container: ''
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
      this.$store.commit('search/setGlobalSearch', !relativeSearch)
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
      // Change the route
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
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
