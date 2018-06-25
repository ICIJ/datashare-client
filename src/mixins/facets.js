import { filter, includes, slice, toLower, toString } from 'lodash'
import { removeDiacritics } from '@/utils/strings.js'

const initialNumberOfFilesDisplayed = 5

export const mixin = {
  data () {
    return {
      display: {
        icon: 'angle-down',
        label: 'More',
        size: initialNumberOfFilesDisplayed
      }
    }
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
    }
  },
  methods: {
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
