<template>
  <div class="filter card"
      :class="{
        'filter--reversed': isReversed(),
        'filter--hide-show-more': hideShowMore,
        'filter--hide-search': hideSearch,
        'filter--hide-header': hideHeader,
        'filter--has-values': hasValues(),
        'filter--dark': dark
      }">
    <hook :name="`filter.${filter.name}.header:before`" :bind="{ filter }"></hook>
    <slot name="header" v-if="!hideHeader">
      <div class="card-header px-2 d-flex filter__header" @click="toggleItems">
        <h6 class="flex-fill flex-shrink-1 text-truncate pt-0">
          <span class="filter__items__item__icon pl-0 pr-1" v-if="filter.icon">
            <fa :icon="filter.icon" fixed-width></fa>
          </span>
          <template>
            <slot name="title">
              {{ $t(`filter.${filter.name}`) }}
            </slot>
          </template>
        </h6>
        <fa v-if="isReady" :icon="headerIcon" class="float-right filter__header__icon" />
        <fa v-else icon="circle-notch" spin class="float-right" />
      </div>
    </slot>
    <hook :name="`filter.${filter.name}.header:after`" :bind="{ filter }"></hook>
    <b-collapse :visible="showResults">
      <div class="list-group list-group-flush filter__items">
        <hook :name="`filter.${filter.name}.search:before`" :bind="{ filter, query: query }"></hook>
        <slot name="search" v-if="!hideSearch && filter.isSearchable">
          <search-form-control
            class="filter__items__search"
            v-model="query"
            @submit="openFilterSearch"
            :rounded="false"
            :placeholder="$t('search.searchIn') + ' ' + $t('filter.' + filter.name) + '...'" />
        </slot>
        <hook :name="`filter.${filter.name}.search:after`" :bind="{ filter, query: query }"></hook>
        <slot name="items" :items="items" :options="options" :selected="selected" :total-count="totalCount" :query="query">
          <b-form-checkbox v-model="isAllSelected" @change.native="resetFilterValues" class="filter__items__all mb-0">
            <slot name="all">
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
            <b-form-checkbox-group stacked v-model="selected" class="list-group-item p-0 border-0" @input="changeSelectedValues">
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
        <infinite-loading @infinite="nextAggregate" :identifier="infiniteId" v-if="useInfiniteScroll">
          <span slot="spinner" />
          <span slot="no-more" />
          <span slot="no-results" />
        </infinite-loading>
      </div>
      <div class="filter__footer d-flex" v-if="!hideFooter">
        <button @click="invert" v-if="!hideExclude" class="filter__footer__action filter__footer__action--invert btn btn-link btn-sm ml-auto" :class="{ 'active': isReversed() }">
          <fa :icon="isReversed() ? 'eye-slash' : 'eye'" fixed-width class="mr-1"></fa>
          {{ $t('filter.invert') }}
        </button>
        <button @click="openFilterSearch" v-if="shouldDisplayShowMore" class="filter__footer__action filter__footer__action--expand btn btn-link btn-sm">
          <fa icon="expand-alt" fixed-width class="mr-1" />
          {{ $t('filter.showMore') }}
        </button>
      </div>
    </b-collapse>
  </div>
</template>

<script>
import compact from 'lodash/compact'
import concat from 'lodash/concat'
import flatten from 'lodash/flatten'
import findIndex from 'lodash/findIndex'
import get from 'lodash/get'
import noop from 'lodash/noop'
import setWith from 'lodash/setWith'
import sumBy from 'lodash/sumBy'
import throttle from 'lodash/throttle'
import toLower from 'lodash/toLower'
import uniqueId from 'lodash/uniqueId'
import InfiniteLoading from 'vue-infinite-loading'

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
  mixins: [filters],
  components: {
    Hook,
    InfiniteLoading,
    SearchFormControl
  },
  data () {
    return {
      infiniteId: uniqueId(),
      collapseItems: this.collapsedIfNoValues && !this.hasValues(),
      pages: []
    }
  },
  watch: {
    query () {
      this.$set(this, 'infiniteId', uniqueId())
      this.aggregateWithThrottle({ clearPages: true })
    },
    collapseItems () {
      if (!this.collapseItems) {
        this.initialize()
      }
    }
  },
  mounted () {
    // Listen for event to refresh the filter
    this.$root.$on('filter::refresh', filterName => {
      this.aggregateWithLoading()
    })
    // Listen for deletion of a filter value
    this.$root.$on('filter::delete', (filterName, { label: key }) => {
      // No need to update this filter when it doesn't match
      // with the event's filter
      if (this.filter.name !== filterName) {
        return
      }
      // Collects all indexes of the deleted item in the components loaded pages
      const itemIndexes = this.pages.map(page => {
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
        // The item still have more than one occurence, we just need to
        // update the doc count
        if (item.doc_count > 1) {
          item.doc_count--
        // The item as only one occurence, meaning it must be
        // deleted from the page's items.
        } else {
          get(this.pages, [pageIndex, ...this.pageItemsPath]).splice(itemIndex, 1)
        }
      })
    })
    // Initialize the filter for the first time
    this.initialize()
  },
  computed: {
    items () {
      return flatten(this.pages.map(this.getPageItems))
    },
    itemsWithExcludedValues () {
      const pages = concat([this.excludedItemsPage], this.pages)
      return flatten(pages.map(this.getPageItems))
    },
    lastPage () {
      return this.pages[this.pages.length - 1]
    },
    lastPageItems () {
      return get(this.lastPage, this.pageItemsPath, [])
    },
    excludedItemsPage () {
      if (!this.isGlobal && this.filterFromStore && this.filterFromStore.reverse) {
        const values = this.filterFromStore.values.map(key => ({ key, doc_count: 0 }))
        return setWith({}, this.pageItemsPath.join('.'), values, Object)
      }
      return []
    },
    calculatedCount () {
      return this.totalCount || 0
    },
    totalCount () {
      return sumBy(this.items, 'doc_count')
    },
    total () {
      return get(this, 'lastPage.total', 0)
    },
    headerIcon () {
      return this.collapseItems ? 'plus' : 'minus'
    },
    showResults () {
      return (this.isReady || this.offset > 0) && !this.collapseItems
    },
    shouldDisplayShowMore () {
      return !this.hideShowMore
    },
    hasResults () {
      return this.isReady && this.items.length > 0
    },
    noResults () {
      return this.isReady && this.items.length === 0
    },
    noMatches () {
      return this.isReady && this.items.length === 0
    },
    useInfiniteScroll () {
      return this.infiniteScroll && this.offset > 0 && this.items.length >= this.size
    },
    fromElasticSearch () {
      return get(this, 'filter.fromElasticSearch', false)
    },
    aggregateWithThrottle () {
      return throttle(this.aggregateWithLoading, 700)
    },
    offset () {
      return get(this, 'items.length', 0)
    },
    nextOffset () {
      return this.offset + this.size
    },
    size () {
      return settings.filterSize
    },
    hasFilterQuery () {
      // The filter has a query if:
      //   * it is searchable
      //   * the query is not empty
      //   * it has an "alternativeSearch" function to generate query tokens
      return this.filter.isSearchable && this.query !== '' && this.filter.alternativeSearch
    },
    aggregationInclude () {
      const alternativeSearch = compact(this.filter.alternativeSearch(toLower(this.query)))
      return '.*(' + concat(alternativeSearch, this.queryTokens).join('|') + ').*'
    },
    aggregationOptions () {
      // The "size" attribute must be as big as the number of displayed buckets
      let options = { size: this.nextOffset }
      // Merge the options object with the filter's query
      if (this.hasFilterQuery) {
        options = { ...options, include: this.aggregationInclude }
      }
      return options
    }
  },
  methods: {
    initialize () {
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
        this.$store.watch(this.watchedForUpdate, () => {
          // It's important to clear pages to ensure the filter is loading
          // pages from the start and not adding new pages.
          this.aggregateWithLoading({ clearPages: true })
        }, { deep: true })
      }
    },
    openFilterSearch () {
      /**
       * Triggered at the root level when user starts to search in the filter values.
       */
      this.$root.$emit('filter::async-search', this.filter, this.query)
      /**
       * Triggered when user starts to search in the filter values.
       */
      this.$emit('async-search', this.filter, this.query)
    },
    async aggregateWithLoading (...args) {
      this.$wait.start(this.waitIdentifier)
      const page = await this.aggregate(...args)
      this.$wait.end(this.waitIdentifier)
      return page
    },
    async aggregate ({ clearPages = false } = {}) {
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
    async nextAggregate ($infiniteLoadingState) {
      await this.aggregateWithLoading()
      // Did we reach the end?
      const method = this.lastPageItems.length < this.size ? 'complete' : 'loaded'
      // Call the right method (with "noop" as safety net in case the method can't be found)
      return get($infiniteLoadingState, method, noop)()
    },
    toggleItems () {
      this.collapseItems = !this.collapseItems
    },
    getPageItems (page) {
      return get(page, this.pageItemsPath, [])
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
      input:checked + label {
        text-decoration: line-through;
      }
    }

    &.filter--has-values {
      box-shadow: 0 0 0 2px $tertiary, 0 0 10px 0 rgba($tertiary, .2);
    }

    &__items {
      max-height: 300px;
      overflow: auto;
      font-size: 0.8rem;

      .list-group-item {
        color: inherit;
        background: inherit;
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

      .filter--dark &__search {
        color: $light;

        .search-form-control__input,
        .search-form-control__addon__submit:last-of-type {
          color: inherit;
          background: #000;
        }

        .search-form-control__input:not(:focus),
        .search-form-control__addon__submit:last-of-type {
          border-color: #000;
        }
      }

      & &__display {
        cursor: pointer;
        margin: 0;
        padding: 0 2.25rem 0.5rem;
        text-align: center;
        font-size: 0.8rem;
        font-weight: bolder;
      }
    }

    &__footer {

      .filter--has-values & {
        background: $tertiary;
        color: #000;
      }

      &__action {
        color: inherit;
        padding: 0.25rem 0.5rem;

        &:hover, &:active {
          color: inherit;
        }
      }
    }
  }
</style>
