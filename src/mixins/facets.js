import camelCase from 'lodash/camelCase'
import find from 'lodash/find'
import flatten from 'lodash/flatten'
import get from 'lodash/get'
import map from 'lodash/map'
import pick from 'lodash/pick'
import reduce from 'lodash/reduce'
import uniq from 'lodash/uniq'

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
      isReady: false,
      offset: 0,
      pageSize: 8,
      totalCount: 0,
      selected: [],
      isAllSelected: true
    }
  },
  mounted () {
    this.selectedValuesFromStore()
    if (this.root.$on) {
      this.root.$on('add-facet-values', value => this.$emit('add-facet-values', value))
    }
  },
  computed: {
    root () {
      return get(this, '$refs.facet', {})
    },
    isGlobal () {
      return this.$store.state.search.globalSearch
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
    size () {
      return this.offset + this.pageSize
    },
    resultPath () {
      return `aggregations.${this.facet.key}.buckets`
    },
    queryTokens () {
      return uniq([
        // Regular query
        this.facetQuery,
        // Uppercase and lowercase versions
        this.facetQuery.toLowerCase(),
        this.facetQuery.toUpperCase(),
        // Capitalize (first letter in Uppercase)
        this.facetQuery.charAt(0).toUpperCase() + this.facetQuery.slice(1)
      // And escape the string for use in REGEX
      ].map(this.escapeRegExp))
    },
    options () {
      return map(this.items, item => { return { value: item.key, text: this.getItemLabel(item) } })
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
    hasValue (item) {
      return this.$store.getters['search/hasFacetValue'](this.facet.itemParam(item))
    },
    removeValue (item) {
      this.$store.commit('search/removeFacetValue', this.facet.itemParam(item))
      this.refreshRoute()
    },
    addValue (item) {
      this.isAllSelected = false
      this.$store.commit('search/addFacetValue', this.facet.itemParam(item))
      this.refreshRoute()
    },
    toggleValue (item) {
      this.hasValue(item) ? this.removeValue(item) : this.addValue(item)
      this.$emit('add-facet-values', this.facet, this.selected.selected)
    },
    invert () {
      this.$store.commit('search/toggleFacet', this.facet.name)
      this.refreshRoute()
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
    escapeRegExp (str) {
      // eslint-disable-next-line no-useless-escape
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
    },
    watchedForUpdate (state) {
      if (!state.search.globalSearch) {
        // This will allow to watch change on the search only when
        // the aggregation is not global (ie. relative to the search).
        return pick(state.search, ['index', 'query', 'facets'])
      } else {
        return pick(state.search, ['index'])
      }
    },
    getItemLabel (item) {
      const label = this.facet.itemLabel ? this.facet.itemLabel(item) : item.key
      return `
        <span class="facet__items__item__label px-1 text-truncate w-100 d-inline-block">
          ${label}
        </span>
        <span class="facet__items__item__count badge badge-pill badge-light float-right my-1">
          ${item.doc_count}
        </span>
      `
    },
    selectedValuesFromStore () {
      if (this.facet) {
        this.selected = find(this.$store.state.search.facets, { name: this.facet.name }).values
        this.isAllSelected = this.selected.length === 0
      }
    },
    resetFacetValues () {
      this.selected = []
    },
    changeSelectedValues () {
      this.isAllSelected = this.selected.length === 0
      this.$root.$emit('facet::add-facet-values', this.facet, this.selected)
      this.$emit('add-facet-values', this.facet, this.selected)
      this.refreshRoute()
    }
  }
}

export default mixin
