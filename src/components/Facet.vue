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
          {{ $t('facet.' + facet.key) }}
        </h6>
      </div>
    </slot>
    <div class="list-group list-group-flush facet__items" v-if="!collapseItems">
      <slot name="search" v-if="!hideSearch">
        <form @submit="asyncFacetSearch" v-if="hasResults && facet.isSearchable" >
          <label class="list-group facet__items__search border-bottom py-2 px-3">
            <input v-model="facetQuery" type="search" :placeholder="$t('search.search-in') + ' ' + $t('facet.' + facet.key) + '...'" />
            <font-awesome-icon icon="search" class="float-right" />
          </label>
        </form>
      </slot>
      <div v-if="!isReady">
        <content-placeholder class="list-group-item py-2 px-3" :rows="placeholderRows" />
        <content-placeholder class="list-group-item py-2 px-3" :rows="placeholderRows" />
        <content-placeholder class="list-group-item py-2 px-3" :rows="placeholderRows" />
      </div>
      <slot v-else name="items" :items="displayedFilteredItems()" :facetQuery="facetQuery">
        <div class="list-group-item facet__items__item p-0 border-0" v-for="(item, index) in displayedFilteredItems()" :key="index" :class="{ 'facet__items__item--active': hasValue(item) }">
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
      <div class="list-group-item facet__items__display" @click="toogleDisplay" v-if="shouldDisplayShowMoreAction()">
        <span>{{ display.label }}</span>
        <font-awesome-icon :icon="display.icon" class="float-right" />
      </div>
      <div v-if="noResults" class="p-2 text-center small text-muted">
        {{ $t('facet.none') }}<br />
        <a @click="asyncFacetSearch" href="#">
          {{ $t('facet.seeAll') }}
        </a>
      </div>
      <div v-else-if="noMatches" class="p-2 text-center small text-muted bg-mark">
        <span  v-html="$t('facet.noMatches')"></span>
      </div>
    </div>
  </div>
</template>

<script>
import filter from 'lodash/filter'
import includes from 'lodash/includes'
import slice from 'lodash/slice'
import toLower from 'lodash/toLower'
import toString from 'lodash/toString'
import each from 'lodash/each'
import pick from 'lodash/pick'

import Response from '@/api/Response'
import ContentPlaceholder from '@/components/ContentPlaceholder'
import { removeDiacritics } from '@/utils/strings.js'
import facets from '@/mixins/facets'

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
        icon: 'angle-down',
        label: 'More',
        size: initialNumberOfFilesDisplayed
      },
      response: Response.none(),
      collapseItems: false,
      isReady: !!this.asyncItems
    }
  },
  created () {
    // Are we using an "offline" components?
    if (!this.asyncItems) {
      this.aggregate()
      // Watch change on the facet store the restart aggregation
      this.$store.watch(this.watchedForUpdate, this.aggregate, { deep: true })
    }
  },
  computed: {
    items () {
      return this.asyncItems || this.response.get(`aggregations.${this.facet.key}.buckets`, [])
    },
    filteredItems () {
      return filter(this.items, item => {
        return (filter(Object.keys(item), attribute => {
          return includes(this.normalize(item[attribute]), this.normalize(this.facetQuery))
        }).length > 0) || (this.facet.itemLabel && includes(this.normalize(this.facet.itemLabel(item)), this.normalize(this.facetQuery)))
      }, this)
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
      return this.isReady && this.filteredItems.length === 0
    }
  },
  methods: {
    asyncFacetSearch () {
      this.$root.$emit('facet::async-search', this.facet, this.facetQuery)
      this.$emit('async-search', this.facet, this.facetQuery)
    },
    aggregate (delay = null) {
      if (this.facet) {
        this.isReady = false
        this.response = Response.none()
        return this.$store.dispatch('aggregation/query', { name: this.facet.name }).then(async r => {
          if (delay) await new Promise(resolve => setTimeout(resolve, delay))
          this.response = this.addInvertedFacets(r)
          this.isReady = true
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
    displayedFilteredItems () {
      return this.hideShowMore ? this.filteredItems : slice(this.filteredItems, 0, this.display.size)
    },
    normalize (str) {
      return removeDiacritics(toLower(toString(str)))
    },
    shouldDisplayShowMoreAction () {
      return !this.hideShowMore && this.filteredItems.length > initialNumberOfFilesDisplayed
    },
    toogleDisplay () {
      this.display.icon = this.display.icon === 'angle-down' ? 'angle-up' : 'angle-down'
      this.display.label = this.display.label === 'More' ? 'Less' : 'More'
      this.display.size = this.display.size === initialNumberOfFilesDisplayed ? this.filteredItems.length : initialNumberOfFilesDisplayed
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
