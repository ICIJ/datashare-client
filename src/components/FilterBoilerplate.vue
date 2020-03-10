<template>
  <div class="filter card" :class="{ 'filter--reversed': isReversed(), 'filter--hide-show-more': hideShowMore, 'filter--hide-search': hideSearch, 'filter--hide-header': hideHeader, 'filter--has-values': hasValues() }">
    <hook :name="`filter.${filter.name}.header:before`" :bind="{ filter }" />
    <slot name="header" v-if="!hideHeader">
      <div class="card-header px-2 d-flex filter__header">
        <h6 @click="toggleItems" class="flex-fill flex-shrink-1 text-truncate pt-0">
          <span class="filter__items__item__icon pl-0 pr-1" v-if="filter.icon">
            <fa :icon="filter.icon" fixed-width />
          </span>
          <template>
            <slot name="title">
              {{ $t(`filter.${filter.name}`) }}
            </slot>
          </template>
        </h6>
        <span v-if="hasValues() && !collapseItems && !hideExclude && isReady">
          <button class="d-inline-flex btn btn-sm btn-outline-light py-0 mr-2 btn-group filter__header__invert" @click="invert" :class="{ 'active': isReversed() }">
            <fa icon="eye-slash" class="mr-1 mt-1" />
            {{ $t('filter.invert') }}
          </button>
        </span>
        <fa v-if="isReady" :icon="headerIcon" @click="toggleItems" class="float-right" />
        <fa v-else icon="circle-notch" spin class="float-right" />
      </div>
    </slot>
    <hook :name="`filter.${filter.name}.header:after`" :bind="{ filter }" />
    <transition name="slide">
      <div class="list-group list-group-flush filter__items" v-show="isReady && !collapseItems">
        <hook :name="`filter.${filter.name}.search:before`" :bind="{ filter, query: filterQuery }" />
        <slot name="search" v-if="!hideSearch">
          <form @submit.prevent="asyncFilterSearch" v-if="filter.isSearchable">
            <label class="list-group filter__items__search py-2 px-2">
              <input v-model="filterQuery" type="search" :placeholder="$t('search.searchIn') + ' ' + $t('filter.' + filter.name) + '...'" />
              <fa icon="search" class="float-right" />
            </label>
          </form>
        </slot>
        <hook :name="`filter.${filter.name}.search:after`" :bind="{ filter, query: filterQuery }" />
        <div class="mb-2">
          <slot name="items" v-if="items.length > 0" :items="items" :options="options" :selected="selected" :total-count="totalCount" :filterQuery="filterQuery">
            <b-form-checkbox v-model="isAllSelected" @change.native="resetFilterValues" class="filter__items__all mb-0">
              <slot name="all">
                <span class="d-flex">
                  <span class="filter__items__item__label px-1 text-truncate w-100 d-inline-block">
                    {{ labelToHuman('all') }}
                  </span>
                  <span class="filter__items__item__count badge badge-pill badge-light float-right mt-1">
                    {{ $n(calculatedCount) }}
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
        </div>
        <div class="list-group-item filter__items__display border-top-0" @click="asyncFilterSearch" v-if="shouldDisplayShowMoreAction()">
          <span>{{ $t('filter.showMore') }}</span>
        </div>
        <div v-if="noResults" class="p-2 text-center text-muted">
          {{ $t('filter.none') }}<br />
        </div>
        <div v-else-if="noMatches" class="p-2 text-center small text-muted bg-mark">
          <span v-html="$t('filter.noMatches')"></span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import compact from 'lodash/compact'
import concat from 'lodash/concat'
import each from 'lodash/each'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
import get from 'lodash/get'
import join from 'lodash/join'
import sumBy from 'lodash/sumBy'
import throttle from 'lodash/throttle'
import toLower from 'lodash/toLower'

import filters from '@/mixins/filters'
import Hook from '@/components/Hook'

export default {
  name: 'FilterBoilerplate',
  mixins: [filters],
  components: {
    Hook
  },
  data () {
    return {
      collapseItems: !this.asyncItems,
      filterQuery: '',
      isInitialized: !!this.asyncItems,
      moreToDisplay: false,
      results: []
    }
  },
  watch: {
    filterQuery () {
      this.searchWithThrottle()
    },
    collapseItems () {
      if (!this.collapseItems) {
        this.initialize()
      }
    }
  },
  mounted () {
    // Default collapse state depends of the selected values
    this.collapseItems = !this.asyncItems && !this.hasValues()
    // Listen for event to refresh the filter
    this.$root.$on('filter::refresh', filterName => {
      if (this.isInitialized && this.filter.name === filterName) {
        this.aggregateWithLoading()
      }
    })
    this.$root.$on('filter::delete', (filterName, tagToDelete) => {
      if (this.isInitialized && this.filter.name === filterName) {
        const docCount = find(this.items, { key: tagToDelete.label }).doc_count
        if (docCount === 1) {
          this.items.splice(findIndex(this.items, { key: tagToDelete.label }), 1)
        } else {
          find(this.items, { key: tagToDelete.label }).doc_count = docCount - 1
        }
      }
    })
    this.initialize()
  },
  computed: {
    items () {
      return this.asyncItems || get(this.results, this.resultPath, [])
    },
    calculatedCount () {
      return this.asyncTotalCount || this.totalCount
    },
    headerIcon () {
      return this.collapseItems ? 'plus' : 'minus'
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
    searchWithThrottle () {
      return throttle(this.aggregate, 400)
    }
  },
  methods: {
    initialize () {
      if (!this.isInitialized && !this.collapseItems) {
        // Are we using an "offline" components?
        if (!this.asyncItems) {
          this.aggregateWithLoading()
          // Watch change on the filter store the restart aggregation
          this.$store.watch(this.watchedForUpdate, this.aggregateWithLoading, { deep: true })
        }
        this.isInitialized = true
      }
    },
    asyncFilterSearch () {
      this.$root.$emit('filter::async-search', this.filter, this.filterQuery)
      this.$emit('async-search', this.filter, this.filterQuery)
    },
    aggregateWithLoading () {
      this.$wait.start(`items for ${this.filter.name}`)
      return this.aggregate()
    },
    async aggregate () {
      if (this.filter) {
        const size = this.size
        const prefix = this.filter.prefix ? this.$config.get('dataDir') + '/' : ''
        const alternativeSearch = this.filterQuery !== '' && this.filter.alternativeSearch ? compact(this.filter.alternativeSearch(toLower(this.filterQuery))) : []
        const queryTokens = compact(concat(alternativeSearch, this.queryTokens))
        const include = prefix + `.*(${queryTokens.join('|')}).*`
        const options = this.filter.isSearchable && queryTokens.length ? { size, include } : { size }
        let res
        try {
          res = await this.$store.dispatch('search/queryFilter', { name: this.filter.name, options })
        } catch (_) {
          res = {}
        }
        this.$set(this, 'total', res.total)
        const sumOtherDocCount = get(res, ['aggregations', this.filter.key, 'sum_other_doc_count'], 0)
        const sumDocCount = sumBy(get(res, this.resultPath, []), 'doc_count')
        this.$set(this, 'totalCount', sumOtherDocCount + sumDocCount)
        this.$set(this, 'results', this.addInvertedFilters(res))
        this.$set(this, 'moreToDisplay', sumOtherDocCount > 0)
        this.$wait.end(`items for ${this.filter.name}`)
        return this.results
      } else {
        return false
      }
    },
    addInvertedFilters (response) {
      if (!this.isGlobal && this.filterFilter && this.filterFilter.reverse) {
        each(this.filterFilter.values, key => {
          response.prepend(join(this.resultPath, '.'), { key })
        })
      }
      return response
    },
    toggleItems () {
      this.collapseItems = !this.collapseItems
    },
    shouldDisplayShowMoreAction () {
      return !this.hideShowMore && this.moreToDisplay
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

      &__invert.btn {
        position: relative;
        top: -0.3rem;
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
      max-height: 500px;

      &.slide-enter-active, &.slide-leave-active {
        transition: .3s max-height;
        overflow: hidden;
      }

      &.slide-enter, &.slide-leave-to {
        max-height: 0;
      }

      &__item .custom-checkbox {
        margin-bottom: 0;
      }

      & &__search {
        margin: 0 0.5rem;
      }

      & &__display {
        margin: 0;
        padding: 0 2.25rem 0.5rem;
        text-align: center;
        font-size: 0.8rem;
        font-weight: bolder;
      }
    }
  }
</style>
