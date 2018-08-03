import get from 'lodash/get'

export const mixin = {
  props: ['facet'],
  data () {
    return {
      isReady: false
    }
  },
  computed: {
    root () {
      return get(this, '$refs.facet', {})
    },
    isGlobal () {
      return this.$store.state.aggregation.globalSearch
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
    }
  },
  methods: {
    addValue (item) {
      this.$store.commit('search/addFacetValue', this.facet.itemParam(item))
      this.refreshRoute()
    },
    removeValue (item) {
      this.$store.commit('search/removeFacetValue', this.facet.itemParam(item))
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
    refreshRoute () {
      this.$router.push({
        name: 'search',
        query: this.$store.getters['search/toRouteQuery']
      })
    }
  }
}

export default mixin
