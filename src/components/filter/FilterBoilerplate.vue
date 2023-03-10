<template>
  <div
    class="filter card"
    :class="{
      'filter--reversed': isReversed,
      'filter--hide-show-more': hideShowMore,
      'filter--hide-search': hideSearch,
      'filter--hide-header': hideHeader,
      'filter--has-values': hasValues
    }"
  >
    <hook :name="`filter.${filter.name}.header:before`" :bind="{ filter }"></hook>
    <slot v-if="!hideHeader" name="header">
      <div class="card-header px-2 d-flex filter__header" @click="toggleItems">
        <h6 class="flex-fill flex-shrink-1 text-truncate pt-0">
          <span v-if="filter.icon" class="filter__items__item__icon pl-0 pr-1">
            <fa :icon="filter.icon" fixed-width></fa>
          </span>
          <slot name="title">
            {{ $t(`filter.${filter.name}`) }}
          </slot>
        </h6>
        <fa v-if="isReady" :icon="headerIcon" class="float-right filter__header__icon"></fa>
        <fa v-else icon="circle-notch" spin class="float-right"></fa>
      </div>
    </slot>
    <hook :name="`filter.${filter.name}.header:after`" :bind="{ filter }"></hook>
    <b-collapse :visible="showResults">
      <div class="list-group list-group-flush filter__items">
        <hook :name="`filter.${filter.name}.search:before`" :bind="{ filter, query: query }"></hook>
        <slot v-if="!hideSearch && filter.isSearchable" name="search">
          <search-form-control
            v-model="query"
            class="filter__items__search"
            :placeholder="$t('search.searchIn') + ' ' + $t('filter.' + filter.name) + '...'"
            :rounded="false"
            :dark="dark"
            @submit.prevent="openFilterSearch"
          ></search-form-control>
        </slot>
        <hook :name="`filter.${filter.name}.search:after`" :bind="{ filter, query: query }"></hook>
        <slot
          :items="items"
          name="items"
          :options="options"
          :query="query"
          :selected="selected"
          :sort-by="sortBy"
          :sort-by-order="sortByOrder"
          :total-count="totalCount"
        >
          <b-form-checkbox v-model="isAllSelected" class="filter__items__all mb-0" :disabled="isAllSelected">
            <slot name="all" v-bind="{ total }">
              <span class="d-flex">
                <span class="filter__items__item__label px-1 text-truncate w-100 d-inline-block">
                  {{ labelToHuman('all') }}
                </span>
                <span class="filter__items__item__count badge badge-pill badge-light float-right mt-1">
                  {{ $n(total) }}
                </span>
              </span>
            </slot>
          </b-form-checkbox>
          <slot name="items-group" :items="items" :options="options" :selected="selected">
            <b-form-checkbox-group
              v-model="selected"
              class="list-group-item p-0 border-0"
              stacked
              @input="changeSelectedValues"
            >
              <template v-for="{ value, item, label } of options">
                <slot name="item" :item="item" :label="label" :value="value" :selected="selected">
                  <b-form-checkbox :value="value" class="filter__items__item">
                    <span class="d-flex">
                      <span class="filter__items__item__label px-1 text-truncate w-100 d-inline-block">
                        {{ label }}
                      </span>
                      <span class="filter__items__item__count badge badge-pill badge-light float-right mt-1">
                        {{ $n(item.doc_count) }}
                      </span>
                    </span>
                  </b-form-checkbox>
                </slot>
              </template>
            </b-form-checkbox-group>
          </slot>
        </slot>
        <template v-if="fromElasticSearch">
          <div v-if="noResults" class="p-2 text-center text-muted">
            {{ $t('filter.none') }}
          </div>
          <div v-else-if="noMatches" class="p-2 text-center small text-muted bg-mark">
            <span v-html="$t('filter.noMatches')"></span>
          </div>
        </template>
        <infinite-loading v-if="useInfiniteScroll" :identifier="infiniteId" :distance="200" @infinite="nextAggregate">
          <span slot="spinner"></span>
          <span slot="no-more"></span>
          <span slot="no-results"></span>
        </infinite-loading>
      </div>
      <filter-footer
        v-if="!hideFooter"
        :filter="filter"
        :hide-contextualize="hideContextualize"
        :hide-exclude="hideExclude"
        :hide-show-more="hideShowMore"
        :hide-sort="hideSort"
        :sort-by-options.sync="sortByOptions"
        @contextualize-filter="toggleContextualizeFilter"
        @open-filter-search="openFilterSearch"
        @sort-filter="sortFilter"
        @toggle-filter="toggleFilter"
      />
    </b-collapse>
  </div>
</template>

<script>
import {
  compact,
  concat,
  escapeRegExp,
  findIndex,
  flatten,
  get,
  map,
  noop,
  pick,
  setWith,
  sumBy,
  throttle,
  toLower,
  uniqueId
} from 'lodash'
import InfiniteLoading from 'vue-infinite-loading'

import FilterFooter from '@/components/filter/FilterFooter'
import Hook from '@/components/Hook'
import SearchFormControl from '@/components/SearchFormControl'
import filters from '@/mixins/filters'
import settings from '@/utils/settings'

/**
 * A base component to wrap other filter components. Not intended to be used directly.
 * This was created to implement an "extendable" component with template slots because Vue.js doesn't allow to extend
 * a component while redefining only "slots" in its templates.
 */
export default {
  name: 'FilterBoilerplate',
  components: {
    FilterFooter,
    Hook,
    InfiniteLoading,
    SearchFormControl
  },
  mixins: [filters],
  props: {
    filter: {
      type: Object
    },
    hideHeader: {
      type: Boolean,
      default: false
    },
    hideSearch: {
      type: Boolean,
      default: false
    },
    hideShowMore: {
      type: Boolean,
      default: false
    },
    hideExclude: {
      type: Boolean,
      default: false
    },
    hideContextualize: {
      type: Boolean,
      default: false
    },
    hideFooter: {
      type: Boolean,
      default: false
    },
    hideSort: {
      type: Boolean,
      default: false
    },
    showResultsBeforeReady: {
      type: Boolean,
      default: false
    },
    /**
     * Search query on the filter
     */
    modelQuery: {
      type: String,
      default: ''
    },
    /**
     * Etheir or not the items should be collapsed when no values are selected
     */
    collapsedIfNoValues: {
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
     * Display the filter on dark background
     */
    dark: {
      type: Boolean,
      default: true
    },
    /**
     * Disable the attempt to translate an item value
     */
    noItemTranslation: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      infiniteId: uniqueId(),
      mounted: false,
      pages: [],
      query: this.modelQuery,
      sortByOptions: get(this, 'filter.sortByOptions', settings.filter.sortByOptions),
      unwatch: () => {}
    }
  },
  computed: {
    collapseItems() {
      return this.collapsedIfNoValues && !this.hasValues
    },
    waitIdentifier() {
      return `items for ${this.filter.name} on ${this.$options.name}`
    },
    isReady() {
      return !this.$wait.is(this.waitIdentifier)
    },
    isGlobal() {
      return !this.filter.contextualized
    },
    getFilter() {
      return this.getFilterByName(this.filter.name)
    },
    pageItemsPath() {
      return ['aggregations', this.filter.key, 'buckets']
    },
    queryTokens() {
      return [escapeRegExp(this.query.toLowerCase())]
    },
    options() {
      return map(this.itemsWithExcludedValues, (item) => {
        return {
          item,
          value: item?.key?.toString(),
          label: this.itemTranslation(item)
        }
      })
    },
    items() {
      return flatten(this.pages.map(this.getPageItems))
    },
    itemsWithExcludedValues() {
      const pages = concat([this.excludedItemsPage], this.pages)
      return flatten(pages.map(this.getPageItems))
    },
    lastPage() {
      return this.pages[this.pages.length - 1]
    },
    lastPageItems() {
      return get(this.lastPage, this.pageItemsPath, [])
    },
    excludedItemsPage() {
      if (!this.isGlobal && this.getFilter && this.getFilter.reverse) {
        const values = this.getFilter.values.map((key) => ({ key, doc_count: 0 }))
        return setWith({}, this.pageItemsPath.join('.'), values, Object)
      }
      return []
    },
    calculatedCount() {
      return this.totalCount || 0
    },
    totalCount() {
      return sumBy(this.items, 'doc_count')
    },
    total() {
      return get(this, 'lastPage.total', 0)
    },
    headerIcon() {
      return this.collapseItems ? 'plus' : 'minus'
    },
    showResults() {
      return (this.isReady || this.offset > 0) && !this.collapseItems
    },
    hasResults() {
      return this.isReady && this.items.length > 0
    },
    noResults() {
      return this.isReady && this.items.length === 0
    },
    noMatches() {
      return this.isReady && this.items.length === 0
    },
    useInfiniteScroll() {
      return this.infiniteScroll && this.offset > 0 && this.items.length >= this.size
    },
    fromElasticSearch() {
      return get(this, 'filter.fromElasticSearch', false)
    },
    aggregateWithThrottle() {
      return throttle(this.aggregateWithLoading, 700)
    },
    offset() {
      return get(this, 'items.length', 0)
    },
    nextOffset() {
      return this.offset + this.size
    },
    size() {
      return settings.filter.bucketSize
    },
    hasFilterQuery() {
      // The filter has a query if:
      //   * it is searchable
      //   * the query is not empty
      //   * it has an "alternativeSearch" function to generate query tokens
      return this.filter.isSearchable && this.query !== '' && this.filter.alternativeSearch
    },
    aggregationInclude() {
      const alternativeSearch = compact(this.filter.alternativeSearch(toLower(this.query)))
      return '.*(' + concat(alternativeSearch, this.queryTokens).join('|') + ').*'
    },
    aggregationOptions() {
      // The "size" attribute must be as big as the number of displayed buckets
      let options = { size: this.nextOffset, order: this.order }
      // Merge the options object with the filter's query
      if (this.hasFilterQuery) {
        options = { ...options, include: this.aggregationInclude }
      }
      return options
    },
    sortBy() {
      return get(this, 'filter.sortBy', settings.filter.sortBy)
    },
    sortByOrder() {
      return get(this, 'filter.sortByOrder', settings.filter.sortByOrder)
    },
    order() {
      return { [this.sortBy]: this.sortByOrder }
    },
    selected: {
      get() {
        return this.getFilterValuesByName(this.filter.name)
      },
      set(key) {
        this.setFilterValue(this.filter, { key })
      }
    },
    isAllSelected: {
      get() {
        return this.selected.length === 0
      },
      set(checked) {
        if (checked) {
          this.$set(this, 'selected', [])
        }
      }
    },
    isReversed() {
      return this.$store.getters['search/isFilterReversed'](this.filter.name)
    },
    hasValues: {
      cache: false,
      get() {
        return this.$store.getters['search/hasFilterValues'](this.filter.name)
      }
    }
  },
  watch: {
    modelQuery() {
      this.$set(this, 'query', this.modelQuery)
    },
    query() {
      this.$set(this, 'infiniteId', uniqueId())
      this.aggregateWithThrottle({ clearPages: true })
      // Emit an event to update the model value only if it changed
      if (this.query !== this.modelQuery) {
        this.$emit('update:modelQuery', this.query)
      }
    },
    collapseItems() {
      this.initialize()
    }
  },
  async mounted() {
    await this.$nextTick()
    this.mounted = true
    // Listen for event to refresh the filter
    this.$root.$on('filter::refresh', () => this.aggregateWithLoading())
    // Listen for deletion of a filter value
    this.$root.$on('filter::delete', (filterName, { label: key }) => {
      // No need to update this filter when it doesn't match
      // with the event's filter
      if (this.filter.name !== filterName) {
        return
      }
      // Collects all indexes of the deleted item in the components loaded pages
      const itemIndexes = this.pages.map((page) => {
        return findIndex(this.getPageItems(page), { key })
      })
      // Iterate on the list of indexes for each page
      itemIndexes.forEach((itemIndex, pageIndex) => {
        // The item wasn't found in this page
        if (itemIndex === -1) {
          return
        }
        // Get the item object merge pageIndex, with this.pageItemsPath and
        // itemIndex. The value of this.pageItemsPath is an array so it needs
        // to be deconstructed into another array to merge it with the two indexes
        const item = get(this.pages, [pageIndex, ...this.pageItemsPath, itemIndex])
        // The item still have more than one occurrence, we just need to
        // update the doc count
        if (item.doc_count > 1) {
          item.doc_count--
          // The item as only one occurrence, meaning it must be
          // deleted from the page's items.
        } else {
          get(this.pages, [pageIndex, ...this.pageItemsPath]).splice(itemIndex, 1)
        }
      })
    })
    // Initialize the filter for the first time
    this.initialize()
  },
  beforeDestroy() {
    this.unwatch()
  },
  methods: {
    initialize() {
      if (!this.collapseItems && this.offset === 0) {
        // Are we using an "offline" components?
        this.aggregateWithLoading()
        // This watcher on the store is very important: watchedForUpdate is a
        // method that returns values that should trigger a refresh on the
        // filter.
        //
        // When filters are not "contextualized", only the current
        // project will be returned in the list of watched values.
        //
        // When they are contextualized, every filter with selected values will
        // be present in the list of watched values.
        const unwatch = this.$store.watch(
          this.watchedForUpdate,
          () => {
            // It's important to clear pages to ensure the filter is loading
            // pages from the start and not adding new pages.
            this.aggregateWithLoading({ clearPages: true })
          },
          { deep: true }
        )
        this.$set(this, 'unwatch', unwatch)
      }
    },
    clearInfiniteScroll() {
      this.$set(this, 'infiniteId', uniqueId())
      this.aggregateWithThrottle({ clearPages: true })
    },
    openFilterSearch() {
      /**
       * Triggered at the root level when user starts to search in the filter values.
       */
      this.$root.$emit('filter::async-search', this.filter, this.query)
      /**
       * Triggered when user starts to search in the filter values.
       */
      this.$emit('async-search', this.filter, this.query)
    },
    async aggregateWithLoading(...args) {
      this.$wait.start(this.waitIdentifier)
      const page = await this.aggregate(...args)
      this.$wait.end(this.waitIdentifier)
      return page
    },
    async aggregate({ clearPages = false } = {}) {
      /**
       * Triggered when a filter received instruction to be load data
       */
      this.$emit('aggregate', this.filter)
      // Filter with `fromElasticSearch` set to false implement there own aggregation
      if (!this.fromElasticSearch) {
        return false
      }
      const page = await this.$store.dispatch('search/queryFilter', {
        name: this.filter.name,
        size: this.size,
        from: clearPages ? 0 : this.offset,
        options: this.aggregationOptions
      })
      if (clearPages) {
        this.pages.splice(0, this.pages.length)
      }
      this.pages.push(page)
      return page
    },
    async nextAggregate($infiniteLoadingState) {
      await this.aggregateWithLoading()
      // Did we reach the end?
      const method = this.lastPageItems.length < this.size ? 'complete' : 'loaded'
      // Call the right method (with "noop" as safety net in case the method can't be found)
      return get($infiniteLoadingState, method, noop)()
    },
    toggleItems() {
      this.collapseItems = !this.collapseItems
    },
    getPageItems(page) {
      return get(page, this.pageItemsPath, [])
    },
    hasValue(item) {
      return this.$store.getters['search/hasFilterValue'](this.filter.itemParam(item))
    },
    removeValue(item) {
      this.$store.commit('search/removeFilterValue', this.filter.itemParam(item))
      this.refreshRouteAndSearch()
    },
    addValue(item) {
      this.$store.commit('search/addFilterValue', this.filter.itemParam(item))
      this.refreshRouteAndSearch()
    },
    setValue(item) {
      this.setFilterValue(this.filter, item)
      this.refreshRouteAndSearch()
    },
    sortFilter() {
      this.clearInfiniteScroll()
    },
    toggleFilter() {
      this.refreshRouteAndSearch()
    },
    toggleContextualizeFilter() {
      this.clearInfiniteScroll()
    },
    watchedForUpdate() {
      const { search } = this.$store.state
      if (this.filter.contextualized) {
        // This will allow to watch change on the search only when
        // the aggregation is not global (ie. relative to the search).
        return pick(search, ['indices', 'query', 'values'])
      } else {
        return pick(search, ['indices'])
      }
    },
    resetFilterValues(refresh = true) {
      this.$set(this, 'selected', [])
      this.$store.commit('search/includeFilter', this.filter.name)
      this.$emit('reset-filter-values', this.filter, refresh)
    },
    changeSelectedValues($ev) {
      this.$root.$emit('filter::add-filter-values', this.filter, this.selected)
      this.$store.commit('search/from', 0)
      this.$emit('add-filter-values', this.filter, this.selected)
      this.refreshRouteAndSearch()
    },
    itemTranslation(item) {
      if (this.noItemTranslation) {
        return item?.key?.toString()
      }
      return this.labelToHuman(this.filter.itemLabel(item))
    }
  }
}
</script>

<style lang="scss">
.filter {
  .content-placeholder .content-placeholder__wrapper__row__box {
    background: darken($app-context-sidebar-bg, 5%);
  }

  &__header {
    &__icon {
      cursor: pointer;
    }
  }

  .custom-checkbox {
    display: block;
    margin: 0.5rem;

    label {
      display: block;
      padding-top: 0.2rem;

      & > span {
        display: flex;
        flex-direction: row;
      }
    }

    input:checked + label {
      font-weight: bold;
    }
  }

  &.filter--reversed {
    .filter__items__item:not(.filter__items__all) input:checked + label {
      text-decoration: line-through;
    }
  }

  &.filter--has-values {
    box-shadow: 0 0 0 2px $tertiary, 0 0 10px 0 rgba($tertiary, 0.2);
  }

  &__items {
    font-size: 0.8rem;
    max-height: 300px;
    overflow: auto;

    .list-group-item {
      background: inherit;
      color: inherit;
    }

    &__all + .list-group-item:empty {
      margin-bottom: $spacer * 0.5;
    }

    &__item .custom-checkbox {
      margin-bottom: 0;
    }

    &__search {
      margin: 0 0.5rem;
    }

    & &__display {
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: bolder;
      margin: 0;
      padding: 0 2.25rem 0.5rem;
      text-align: center;
    }
  }
}
</style>
