<template>
  <div class="facet card" :class="{ 'facet--reversed': isReversed(), 'facet--hide-show-more': hideShowMore, 'facet--hide-search': hideSearch, 'facet--hide-header': hideHeader, 'facet--has-values': hasValues() }">
    <slot name="header" v-if="!hideHeader">
      <div class="card-header px-2 d-flex facet__header">
        <h6 @click="toggleItems" class="flex-fill flex-shrink-1 text-truncate pt-0">
          <span class="facet__items__item__icon pl-0 pr-1" v-if="facet.icon">
            <fa :icon="facet.icon" fixed-width />
          </span>
          <template>
            <slot name="title">
              {{ $t('facet.' + facet.name) }}
            </slot>
          </template>
        </h6>
        <span v-if="hasValues() && !collapseItems && !hideExclude && isReady">
          <button class="d-inline-flex btn btn-sm btn-outline-light py-0 mr-2 btn-group facet__header__invert" @click="invert" :class="{ 'active': isReversed() }">
            <fa icon="eye-slash" class="mr-1 mt-1" />
            {{ $t('facet.invert') }}
          </button>
        </span>
        <fa v-if="isReady" :icon="headerIcon" @click="toggleItems" class="float-right" />
        <fa v-else icon="circle-notch" spin class="float-right" />
      </div>
    </slot>
    <transition name="slide">
      <div class="list-group list-group-flush facet__items" v-show="isReady && !collapseItems">
        <slot name="search" v-if="!hideSearch">
          <form @submit.prevent="asyncFacetSearch" v-if="facet.isSearchable">
            <label class="list-group facet__items__search py-2 px-2">
              <input v-model="facetQuery" type="search" :placeholder="$t('search.searchIn') + ' ' + $t('facet.' + facet.name) + '...'" />
              <fa icon="search" class="float-right" />
            </label>
          </form>
        </slot>
        <div class="mb-2">
          <slot v-if="items.length > 0" name="items" :items="items" :options="options" :selected="selected" :total-count="totalCount" :facetQuery="facetQuery">
            <b-form-checkbox v-model="isAllSelected" @change.native="resetFacetValues" class="facet__items__all mb-0">
              <slot name="all">
                <span class="d-flex">
                  <span class="facet__items__item__label px-1 text-truncate w-100 d-inline-block">
                    {{ labelToHuman('all') }}
                  </span>
                  <span class="facet__items__item__count badge badge-pill badge-light float-right mt-1">
                    {{ $n(calculatedCount) }}
                  </span>
                </span>
              </slot>
            </b-form-checkbox>
            <slot name="items-group" :items="items" :options="options" :selected="selected">
              <b-form-checkbox-group stacked v-model="selected" class="list-group-item p-0 border-0" @input="changeSelectedValues">
                <template v-for="{ value, item, label } of options">
                  <slot name="item" :item="item" :label="label" :value="value" :selected="selected">
                    <b-form-checkbox :value="value" class="facet__items__item">
                      <span class="d-flex">
                        <span class="facet__items__item__label px-1 text-truncate w-100 d-inline-block">
                          {{ label }}
                        </span>
                        <span class="facet__items__item__count badge badge-pill badge-light float-right mt-1">
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
        <div class="list-group-item facet__items__display border-top-0" @click="asyncFacetSearch" v-if="shouldDisplayShowMoreAction()">
          <span>{{ $t('facet.showMore') }}</span>
        </div>
        <div v-if="noResults" class="p-2 text-center text-muted">
          {{ $t('facet.none') }}<br />
        </div>
        <div v-else-if="noMatches" class="p-2 text-center small text-muted bg-mark">
          <span v-html="$t('facet.noMatches')"></span>
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

import facets from '@/mixins/facets'

export default {
  name: 'Facet',
  mixins: [facets],
  data () {
    return {
      facetQuery: '',
      collapseItems: !this.asyncItems,
      isReady: true,
      isInitialized: !!this.asyncItems,
      results: []
    }
  },
  watch: {
    facetQuery () {
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
    // Listen for event to refresh the facet
    this.$root.$on('facet::refresh', facetName => {
      if (this.isInitialized && this.facet.name === facetName) {
        this.aggregateWithLoading()
      }
    })
    this.$root.$on('facet::delete', (facetName, tagToDelete) => {
      if (this.isInitialized && this.facet.name === facetName) {
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
          // Watch change on the facet store the restart aggregation
          this.$store.watch(this.watchedForUpdate, this.aggregateWithLoading, { deep: true })
        }
        this.isInitialized = true
      }
    },
    asyncFacetSearch () {
      this.$root.$emit('facet::async-search', this.facet, this.facetQuery)
      this.$emit('async-search', this.facet, this.facetQuery)
    },
    aggregateWithLoading () {
      this.isReady = false
      return this.aggregate()
    },
    async aggregate () {
      if (this.facet) {
        const size = this.size
        const prefix = this.facet.prefix ? this.$config.get('dataDir') + '/' : ''
        const alternativeSearch = this.facetQuery !== '' && this.facet.alternativeSearch ? compact(this.facet.alternativeSearch(toLower(this.facetQuery))) : []
        const queryTokens = compact(concat(alternativeSearch, this.queryTokens))
        const include = prefix + `.*(${queryTokens.join('|')}).*`
        const options = this.facet.isSearchable && queryTokens.length ? { size, include } : { size }
        let res
        try {
          res = await this.$store.dispatch('search/queryFacet', { name: this.facet.name, options })
        } catch (_) {
          res = {}
        }
        this.$set(this, 'total', res.total)
        const sumOtherDocCount = get(res, ['aggregations', this.facet.key, 'sum_other_doc_count'], 0)
        const sumDocCount = sumBy(get(res, this.resultPath, []), 'doc_count')
        this.$set(this, 'totalCount', sumOtherDocCount + sumDocCount)
        this.$set(this, 'results', this.addInvertedFacets(res))
        this.$set(this, 'isReady', true)
        return this.results
      } else {
        return false
      }
    },
    addInvertedFacets (response) {
      if (!this.isGlobal && this.facetFilter && this.facetFilter.reverse) {
        each(this.facetFilter.values, key => {
          response.prepend(join(this.resultPath, '.'), { key })
        })
      }
      return response
    },
    toggleItems () {
      this.collapseItems = !this.collapseItems
    },
    shouldDisplayShowMoreAction () {
      return !this.hideShowMore && this.totalCount > this.size
    }
  }
}
</script>

<style lang="scss">
  .facet {

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

    &.facet--reversed {
      input:checked + label {
        text-decoration: line-through;
      }
    }

    &.facet--has-values {
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
