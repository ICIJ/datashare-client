import slice from 'lodash/slice'

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
    displayedItems () {
      return slice(this.items, 0, this.display.size)
    }
  },
  methods: {
    toogleDisplay () {
      this.display.icon = this.display.icon === 'angle-down' ? 'angle-up' : 'angle-down'
      this.display.label = this.display.label === 'More' ? 'Less' : 'More'
      this.display.size = this.display.size === initialNumberOfFilesDisplayed ? -1 : initialNumberOfFilesDisplayed
    },
    shouldDisplayShowMoreAction () {
      return this.items.length > initialNumberOfFilesDisplayed
    }
  }
}
