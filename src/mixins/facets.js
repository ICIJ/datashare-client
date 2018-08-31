import flatten from 'lodash/flatten'
import camelCase from 'lodash/camelCase'
import get from 'lodash/get'
import reduce from 'lodash/reduce'
import { EventBus } from '@/utils/event-bus.js'

import DatashareClient from '@/api/DatashareClient'

const datashare = new DatashareClient()

export const mixin = {
  props: {
    facet: {
      type: Object
    },
    hideHeader: {
      type: Boolean,
      default: false
    },
    hideSearch: {
      type: Boolean,
      default: false
    },
    hideShowMore: {
      type: Boolean,
      default: false
    },
    asyncItems: {
      type: Array,
      default: null
    }
  },
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
    // Returns all props without the givens keys
    propsWithout (...keys) {
      keys = flatten(keys).map(camelCase)
      return reduce(this.$props, (props, value, key) => {
        if (keys.indexOf(key) === -1) {
          props[key] = value
        }
        return props
      }, {})
    },
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
    },
    deleteNamedEntitiesByMentionNorm (mentionNorm) {
      return datashare.deleteNamedEntitiesByMentionNorm(mentionNorm).then(resp => {
        EventBus.$emit('facet::hide::named-entities')
      })
    }
  }
}

export default mixin
