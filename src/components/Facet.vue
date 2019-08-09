<template>
  <div v-if="!isGloballyEmpty" class="facet card" :class="{ 'facet--reversed': isReversed(), 'facet--hide-show-more': hideShowMore, 'facet--hide-search': hideSearch, 'facet--hide-header': hideHeader, 'facet--has-values': hasValues() }">
    <slot name="header" v-if="!hideHeader">
      <div class="card-header px-2 d-flex facet__header">
        <h6 @click="toggleItems" class="flex-fill flex-shrink-1 text-truncate pt-0">
          <template>
            <slot name="title">
              {{ $t('facet.' + facet.name) }}
            </slot>
          </template>
        </h6>
        <span v-if="hasValues() && !collapseItems && !hideExclude">
          <button class="d-inline-flex btn btn-sm btn-outline-light py-0 mr-2 btn-group facet__header__invert" @click="invert" :class="{ 'active': isReversed() }">
            <fa icon="eye-slash" class="mr-1 mt-1" />
            {{ $t('facet.invert') }}
          </button>
        </span>
        <fa :icon="headerIcon"  @click="toggleItems" class="float-right" />
      </div>
    </slot>
    <slide-up-down class="list-group list-group-flush facet__items" :active="!collapseItems">
      <slot name="search" v-if="!hideSearch">
        <form @submit.prevent="asyncFacetSearch" v-if="facet.isSearchable">
          <label class="list-group facet__items__search py-2 px-2">
            <input v-model="facetQuery" type="search" :placeholder="$t('search.search-in') + ' ' + $t('facet.' + facet.name) + '...'" />
            <fa icon="search" class="float-right" />
          </label>
        </form>
      </slot>
      <div v-if="!isReady">
        <content-placeholder class="list-group-item border-0 py-2 px-3" :rows="placeholderRows" />
        <content-placeholder class="list-group-item border-0 py-2 px-3" :rows="placeholderRows" />
        <content-placeholder class="list-group-item border-0 py-2 px-3" :rows="placeholderRows" />
      </div>
      <slot v-else-if="items.length > 0" name="items" :items="items" :total-count="totalCount" :facetQuery="facetQuery">
        <b-form-checkbox v-model="isAllSelected" @change.native="resetFacetValues" class="facet__items__all mb-0">
          <slot name="all">
            <span v-html="getItemLabel({ key: 'all', key_as_string: 'all', doc_count: calculatedCount })"></span>
          </slot>
        </b-form-checkbox>
        <slot name="item">
          <b-form-checkbox-group stacked v-model="selected" :options="options" class="list-group-item facet__items__item p-0 border-0" @input="changeSelectedValues" />
        </slot>
      </slot>
      <div class="list-group-item facet__items__display border-top-0" @click="asyncFacetSearch" v-if="shouldDisplayShowMoreAction()">
        <span>{{ $t('facet.showMore') }}</span>
      </div>
      <div v-if="noResults" class="p-2 text-center text-muted">
        {{ $t('facet.none') }}<br />
        <a @click="asyncFacetSearch" href="#" class="text-white text-underline">
          {{ $t('facet.seeAll') }}
        </a>
      </div>
      <div v-else-if="noMatches" class="p-2 text-center small text-muted bg-mark">
        <span v-html="$t('facet.noMatches')"></span>
      </div>
    </slide-up-down>
  </div>
</template>

<script>
import facets from '@/mixins/facets'
import PQueue from 'p-queue'
import concat from 'lodash/concat'
import compact from 'lodash/compact'
import each from 'lodash/each'
import get from 'lodash/get'
import join from 'lodash/join'
import sumBy from 'lodash/sumBy'
import throttle from 'lodash/throttle'

const initialNumberOfFilesDisplayed = 5

export default {
  name: 'Facet',
  mixins: [facets],
  data () {
    return {
      facetQuery: '',
      display: {
        size: initialNumberOfFilesDisplayed
      },
      collapseItems: !this.asyncItems,
      isReady: !!this.asyncItems,
      isGloballyEmpty: this.$store.state.search.globalSearch && !this.asyncItems,
      queue: new PQueue({ concurrency: 1 }),
      results: []
    }
  },
  watch: {
    facetQuery () {
      this.searchWithThrottle()
    }
  },
  mounted () {
    // Default collapse state depends of the selected values
    this.collapseItems = !this.asyncItems && !this.hasValues()
  },
  created () {
    // Are we using an "offline" components?
    if (!this.asyncItems) {
      this.aggregateWithLoading()
      // Watch change on the facet store the restart aggregation
      this.$store.watch(this.watchedForUpdate, this.aggregateWithLoading, { deep: true })
    }
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
    asyncFacetSearch () {
      this.$root.$emit('facet::async-search', this.facet, this.facetQuery)
      this.$emit('async-search', this.facet, this.facetQuery)
    },
    aggregateWithLoading () {
      this.isReady = false
      return this.aggregate()
    },
    aggregate () {
      if (this.facet) {
        const prefix = this.facet.prefix ? this.$config.get('dataDir') + '/' : ''
        const alternativeSearch = this.facetQuery !== '' && this.facet.alternativeSearch ? compact(this.facet.alternativeSearch(this.facetQuery)) : []
        const options = this.facet.isSearchable ? { size: this.size, include: prefix + `.*(${concat(alternativeSearch, this.queryTokens).join('|')}).*` } : { size: this.size }
        return this.queue.add(async () => {
          const res = await this.$store.dispatch('search/queryFacet', { name: this.facet.name, options })
          const sumOtherDocCount = get(res, ['aggregations', this.facet.key, 'sum_other_doc_count'], 0)
          const sumDocCount = sumBy(get(res, this.resultPath, []), 'doc_count')
          this.$set(this, 'totalCount', sumOtherDocCount + sumDocCount)
          this.$set(this, 'results', this.addInvertedFacets(res))
          this.$set(this, 'isReady', this.queue.pending === 1)
          // If this search is global, it means the no values for this query
          // means no values at all for this facet
          this.$set(this, 'isGloballyEmpty', this.$store.state.search.globalSearch && this.totalCount === 0 && this.facetQuery === '')
          return this.results
        })
      }
      return this.queue.onEmpty()
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
      return !this.hideShowMore && this.items.length > initialNumberOfFilesDisplayed
    }
  }
}
</script>

<style lang="scss">
  .facet {

    .content-placeholder .content-placeholder__wrapper__row__box {
      background: darken($aggregations-panel-bg, 5%);
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
      box-shadow: 0 0 0 2px $tertiary,  0 0 10px 0 rgba($tertiary, .2);
    }

    &__items {

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
