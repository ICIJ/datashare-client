import filter from 'lodash/filter'
import includes from 'lodash/includes'
import slice from 'lodash/slice'
import toLower from 'lodash/toLower'
import toString from 'lodash/toString'
import each from 'lodash/each'

import Response from '@/api/Response'
import ContentPlaceholder from '@/components/ContentPlaceholder'
import { removeDiacritics } from '@/utils/strings.js'

const initialNumberOfFilesDisplayed = 5

export const mixin = {
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
      isReady: false
    }
  },
  created () {
    this.aggregate()
    // Watch change on the facet store the restart aggregation
    this.$store.watch(this.watchedForUpdate, this.aggregate, { deep: true })
  },
  computed: {
    items () {
      return this.response.get(`aggregations.${this.facet.key}.buckets`, [])
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
    facetFilter () {
      return this.$store.getters['search/findFacet'](this.facet.name)
    },
    placeholderRows () {
      return [
        {
          height: '1em',
          boxes: [[0, '70%'], ['20%', '10%']]
        }
      ]
    },
    isGlobal () {
      return this.$store.state.aggregation.globalSearch
    },
    hasResults () {
      return this.isReady && this.items.length > 0
    }
  },
  methods: {
    aggregate () {
      if (this.facet) {
        this.isReady = false
        this.response = Response.none()
        return this.$store.dispatch('aggregation/query', { name: this.facet.name }).then(r => {
          this.response = this.addInvertedFacets(r)
          this.isReady = true
        })
      }
    },
    addInvertedFacets (response) {
      if (!this.isGlobal && this.facetFilter && this.facetFilter.reverse) {
        each(this.facetFilter.values, key => {
          response.push(`aggregations.${this.facet.key}.buckets`, { key })
        })
      }
      return response
    },
    addValue (item) {
      this.$store.commit('search/addFacetValue', this.facet.itemParam(item))
      console.log('add')
      this.refreshRoute()
    },
    removeValue (item) {
      this.$store.commit('search/removeFacetValue', this.facet.itemParam(item))
      console.log('remove')
      this.refreshRoute()
    },
    toggleValue (item) {
      this.hasValue(item) ? this.removeValue(item) : this.addValue(item)
    },
    invert () {
      this.$store.commit('search/toggleFacet', this.facet.name)
      this.refreshRoute()
    },
    hasValue (item) {
      return this.$store.getters['search/hasFacetValue'](this.facet.itemParam(item))
    },
    hasValues () {
      return this.isReady && this.$store.getters['search/hasFacetValues'](this.facet.name)
    },
    isReversed () {
      return this.$store.getters['search/isFacetReversed'](this.facet.name)
    },
    toggleItems () {
      this.collapseItems = !this.collapseItems
    },
    watchedForUpdate (state) {
      if (!state.aggregation.globalSearch) {
        // This will allow to watch change on the search only when
        // the aggregation is not global (ie. relative to the search).
        return state.search
      }
    },
    refreshRoute () {
      this.$router.push({
        name: 'search',
        query: this.$store.getters['search/toRouteQuery']
      })
    },
    displayedFilteredItems () {
      return slice(this.filteredItems, 0, this.display.size)
    },
    normalize (str) {
      return removeDiacritics(toLower(toString(str)))
    },
    shouldDisplayShowMoreAction () {
      return this.filteredItems.length > initialNumberOfFilesDisplayed
    },
    toogleDisplay () {
      this.display.icon = this.display.icon === 'angle-down' ? 'angle-up' : 'angle-down'
      this.display.label = this.display.label === 'More' ? 'Less' : 'More'
      this.display.size = this.display.size === initialNumberOfFilesDisplayed ? this.filteredItems.length : initialNumberOfFilesDisplayed
    }
  }
}
