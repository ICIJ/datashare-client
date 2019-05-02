import { EventBus } from '@/utils/event-bus'
import utils from '@/mixins/utils'
import camelCase from 'lodash/camelCase'
import find from 'lodash/find'
import flatten from 'lodash/flatten'
import get from 'lodash/get'
import map from 'lodash/map'
import pick from 'lodash/pick'
import reduce from 'lodash/reduce'
import toLower from 'lodash/toLower'
import toUpper from 'lodash/toUpper'
import uniq from 'lodash/uniq'
import upperFirst from 'lodash/upperFirst'
import last from 'lodash/last'

export const mixin = {
  mixins: [utils],
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
    EventBus.$on('facet::search::update', facetName => {
      if (this.facet.name === facetName) {
        this.selectedValuesFromStore()
      }
    })
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
        this.facetQuery,
        toLower(this.facetQuery),
        toUpper(this.facetQuery),
        upperFirst(this.facetQuery)
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
          ${this.labelToHuman(label)}
        </span>
        <span class="facet__items__item__count badge badge-pill badge-light float-right my-1">
          ${this.$n(item.doc_count)}
        </span>
      `
    },
    labelToHuman (label) {
      if (this.$te(label)) {
        return this.$t(label)
      } else if (this.$te(`facet.${label}`)) {
        return this.$t(`facet.${label}`)
      } else {
        return this.translationKeyToHuman(label)
      }
    },
    translationKeyToHuman (label) {
      return last(label.split('.'))
    },
    selectedValuesFromStore () {
      if (this.facet) {
        this.selected = find(this.$store.state.search.facets, { name: this.facet.name }).values
        this.isAllSelected = this.selected.length === 0
      }
    },
    resetFacetValues () {
      this.selected = []
      this.isAllSelected = true
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
