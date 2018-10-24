<template>
  <div class="facet card" :class="{ 'facet--reversed': isReversed(), 'facet--hide-show-more': hideShowMore, 'facet--hide-search': hideSearch, 'facet-hide-header': hideHeader  }">
    <slot name="header" v-if="!hideHeader">
      <div class="card-header">
        <span v-if="hasValues()" class="float-right btn-group">
          <button class="btn btn-sm btn-outline-secondary py-0" @click="invert" :class="{ 'active': isReversed() }">
            <font-awesome-icon icon="eye-slash" />
            {{ $t('facet.invert') }}
          </button>
        </span>
        <h6 @click="toggleItems">
          <font-awesome-icon :icon="headerIcon" />
          {{ $t('facet.' + facet.name) }}
        </h6>
      </div>
    </slot>
    <div class="list-group list-group-flush facet__items" v-if="!collapseItems">
      <slot name="search" v-if="!hideSearch">
        <form @submit="asyncFacetSearch" v-if="facet.isSearchable">
          <label class="list-group facet__items__search border-bottom py-2 px-3">
            <input v-model="facetQuery" type="search" :placeholder="$t('search.search-in') + ' ' + $t('facet.' + facet.name) + '...'" />
            <font-awesome-icon icon="search" class="float-right" />
          </label>
        </form>
      </slot>
      <div v-if="!isReady">
        <content-placeholder class="list-group-item py-2 px-3" :rows="placeholderRows" />
        <content-placeholder class="list-group-item py-2 px-3" :rows="placeholderRows" />
        <content-placeholder class="list-group-item py-2 px-3" :rows="placeholderRows" />
      </div>
      <slot v-else name="items" :items="items" :facetQuery="facetQuery">
        <div class="list-group-item facet__items__item p-0 border-0" v-for="(item, index) in items" :key="index" :class="{ 'facet__items__item--active': hasValue(item) }">
          <slot name="item" :item="item">
            <a href @click.prevent="toggleValue(item)" class="py-2 px-3">
              <span class="badge badge-pill badge-light float-right facet__items__item__count">
                {{ item.doc_count || 0 }}
              </span>
              <span class="facet__items__item__label">
                {{ facet.itemLabel ? facet.itemLabel(item) : item.key }}
              </span>
            </a>
          </slot>
        </div>
      </slot>
      <div class="list-group-item facet__items__display" @click="asyncFacetSearch" v-if="shouldDisplayShowMoreAction()">
        <span>{{ $t('facet.showMore') }}</span>
      </div>
      <div v-if="noResults" class="p-2 text-center small text-muted">
        {{ $t('facet.none') }}<br />
        <a @click="asyncFacetSearch" href="#">
          {{ $t('facet.seeAll') }}
        </a>
      </div>
      <div v-else-if="noMatches" class="p-2 text-center small text-muted bg-mark">
        <span v-html="$t('facet.noMatches')"></span>
      </div>
    </div>
  </div>
</template>

<script>
import toLower from 'lodash/toLower'
import toString from 'lodash/toString'
import each from 'lodash/each'
import get from 'lodash/get'
import pick from 'lodash/pick'
import throttle from 'lodash/throttle'

import ContentPlaceholder from '@/components/ContentPlaceholder'
import { removeDiacritics } from '@/utils/strings.js'
import facets from '@/mixins/facets'
import PQueue from 'p-queue'

const initialNumberOfFilesDisplayed = 5

export default {
  name: 'Facet',
  mixins: [facets],
  components: {
    ContentPlaceholder
  },
  data () {
    return {
      facetQuery: '',
      display: {
        size: initialNumberOfFilesDisplayed
      },
      collapseItems: false,
      isReady: !!this.asyncItems,
      queue: new PQueue({concurrency: 1}),
      results: []
    }
  },
  watch: {
    facetQuery () {
      this.searchWithThrottle()
    }
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
    headerIcon () {
      return this.collapseItems ? 'caret-right' : 'caret-down'
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
        let prefix = this.facet.prefix ? this.config.dataDir + '/' : ''
        let options = this.facet.isSearchable ? { size: this.size, include: prefix + `.*(${this.queryTokens.join('|')}).*` } : {}
        return this.queue.add(() => {
          return this.$store.dispatch('aggregation/searchFacet', {name: this.facet.name, options: options}).then(async r => {
            this.results = this.addInvertedFacets(r)
            this.isReady = this.queue.pending === 1
          })
        })
      }
    },
    addInvertedFacets (response) {
      if (!this.isGlobal && this.facetFilter && this.facetFilter.reverse) {
        each(this.facetFilter.values, key => {
          response.prepend(`aggregations.${this.facet.key}.buckets`, { key })
        })
      }
      return response
    },
    toggleItems () {
      this.collapseItems = !this.collapseItems
    },
    watchedForUpdate (state) {
      if (!state.aggregation.globalSearch) {
        // This will allow to watch change on the search only when
        // the aggregation is not global (ie. relative to the search).
        return pick(state.search, ['query', 'facets'])
      }
    },
    normalize (str) {
      return removeDiacritics(toLower(toString(str)))
    },
    shouldDisplayShowMoreAction () {
      return !this.hideShowMore && this.items.length > initialNumberOfFilesDisplayed
    }
  }
}
</script>

<style lang="scss">
  .facet {

    &__items {

      &__item {
        border: 0;
        position: relative;

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

          .facet--reversed & {
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
