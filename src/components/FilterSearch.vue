<template>
  <div class="filter-search" v-if="filter">
    <form @submit.prevent class="filter-search__form input-group mb-4" v-if="filter.isSearchable">
      <input type="search" class="form-control" id="input-filter-search" v-model="filterQuery">
      <label class="input-group-append m-0" for="input-filter-search">
        <span class="input-group-text">
          <fa icon="search"></fa>
        </span>
      </label>
    </form>
    <div v-show="items.length" class="filter-search__items card" :key="infiniteId">
      <component class="border-0"
                 :is="filter.component"
                 :async-items="items"
                 :async-total="total"
                 :async-total-count="totalCount"
                 @add-filter-values="onAddedFilterValues"
                 hide-search
                 hide-header
                 hide-show-more
                 v-bind="{ filter }"></component>
    </div>
    <infinite-loading @infinite="next" :identifier="infiniteId" v-if="infiniteScroll">
      <fa icon="circle-notch" spin slot="spinner" size="2x" class="mt-4 text-muted"></fa>
      <template #no-more>
        <span class="text-muted"></span>
      </template>
    </infinite-loading>
    <div v-show="!items.length && isReady" class="text-muted text-center p-2 mt-4">
      {{ $t('filter.noResults') }}
    </div>
  </div>
</template>

<script>
import compact from 'lodash/compact'
import concat from 'lodash/concat'
import get from 'lodash/get'
import sumBy from 'lodash/sumBy'
import throttle from 'lodash/throttle'
import toLower from 'lodash/toLower'
import uniqueId from 'lodash/uniqueId'
import InfiniteLoading from 'vue-infinite-loading'

import FilterDate from '@/components/FilterDate'
import FilterDateRange from '@/components/FilterDateRange'
import FilterNamedEntity from '@/components/FilterNamedEntity'
import FilterPath from '@/components/FilterPath'
import FilterRecommendedBy from '@/components/FilterRecommendedBy'
import FilterText from '@/components/FilterText'
import FilterYesNo from '@/components/FilterYesNo'
import filters from '@/mixins/filters'

/**
 * A panel to search into a specific filter.
 */
export default {
  name: 'FilterSearch',
  mixins: [filters],
  props: {
    /**
     * Filter definition
     */
    filter: {
      type: Object
    },
    /**
     * The initial query terms
     */
    query: {
      type: String,
      default: ''
    },
    /**
     * Either or not results should be selectable
     */
    selectable: {
      type: Boolean,
      default: true
    },
    /**
     * Either or not results should be loaded on scroll
     */
    infiniteScroll: {
      type: Boolean,
      default: true
    },
    /**
     * Throttle time in milliseconds between each search
     */
    throttle: {
      type: Number,
      default: 600
    }
  },
  components: {
    FilterDate,
    FilterDateRange,
    FilterNamedEntity,
    FilterPath,
    FilterRecommendedBy,
    FilterText,
    FilterYesNo,
    InfiniteLoading
  },
  data () {
    return {
      filterQuery: this.query || '',
      infiniteId: uniqueId(),
      items: [],
      total: 0,
      totalCount: 0
    }
  },
  mounted () {
    this.startOver()
    this.$root.$on('filter::hide::named-entities', () => this.startOver())
  },
  watch: {
    filterQuery () {
      this.startOverWithThrottle()
    },
    filter () {
      this.startOver()
    }
  },
  methods: {
    async search ($state) {
      if (!this.filter) return
      this.$wait.start('items for ' + this.filter.name)
      // Load the filter using a body build using the filter configuration
      let options = { size: this.size }
      if (this.filter.isSearchable && this.filterQuery !== '' && this.filter.alternativeSearch) {
        const alternativeSearch = compact(this.filter.alternativeSearch(toLower(this.filterQuery)))
        options = { ...options, include: '.*(' + concat(alternativeSearch, this.queryTokens).join('|') + ').*' }
      }
      const data = await this.$store.dispatch('search/queryFilter', { name: this.filter.name, options })
      const all = get(data, this.resultPath, [])
      this.$set(this, 'items', all)
      this.$set(this, 'total', data.total)
      this.$set(this, 'totalCount', sumBy(all, 'doc_count'))
      // Did we reach the end?
      if ($state && all.length < this.size) $state.complete()
      this.$wait.end('items for ' + this.filter.name)
      // Mark this page as loaded
      if ($state) $state.loaded()
    },
    startOver () {
      this.$set(this, 'offset', 0)
      this.$set(this, 'items', [])
      this.$set(this, 'infiniteId', uniqueId())
      return this.search()
    },
    next ($state) {
      this.offset += this.pageSize
      return this.search($state)
    },
    onAddedFilterValues (component) {
      /**
       * A value is selected for a specific component
       */
      this.$root.$emit('filter::search::add-filter-values', component)
    }
  },
  computed: {
    startOverWithThrottle () {
      return this.throttle > 0 ? throttle(this.startOver, this.throttle) : this.startOver
    }
  }
}
</script>

<style lang="scss">
  .filter-search {
    &__items {
      .filter__items {
        max-height: none;
      }
    }
  }
</style>
