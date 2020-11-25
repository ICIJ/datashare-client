import camelCase from 'lodash/camelCase'
import escapeRegExp from 'lodash/escapeRegExp'
import flatten from 'lodash/flatten'
import get from 'lodash/get'
import last from 'lodash/last'
import map from 'lodash/map'
import noop from 'lodash/noop'
import pick from 'lodash/pick'
import reduce from 'lodash/reduce'

import utils from '@/mixins/utils'

export default {
  mixins: [utils],
  props: {
    filter: {
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
    hideExclude: {
      type: Boolean,
      default: false
    },
    hideFooter: {
      type: Boolean,
      default: false
    },
    hideSort: {
      type: Boolean,
      default: false
    },
    showResultsBeforeReady: {
      type: Boolean,
      default: false
    },
    /**
     * Search query on the filter
     */
    modelQuery: {
      type: String,
      default: ''
    },
    /**
     * Etheir or not the items should be collapsed when no values are selected
     */
    collapsedIfNoValues: {
      type: Boolean,
      default: true
    },
    /**
     * Either or not results should be loaded on scroll
     */
    infiniteScroll: {
      type: Boolean,
      default: true
    },
    /**
     * Display the filter on dark background
     */
    dark: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      selected: get(this, `$store.state.search.values.${this.filter.name}`, []),
      isAllSelected: true,
      query: this.modelQuery,
      mounted: false
    }
  },
  watch: {
    modelQuery () {
      this.query = this.modelQuery
    },
    query () {
      if (this.query !== this.modelQuery) {
        this.$emit('update:modelQuery', this.query)
      }
    }
  },
  async mounted () {
    await this.$nextTick()
    this.mounted = true
    this.bindOnRoot('add-filter-values', value => this.$emit('add-filter-values', value))
    this.$root.$on('filter::search::update', filterName => {
      if (this.filter && this.filter.name === filterName) {
        this.setSelectedValuesFromStore()
      }
    })
  },
  computed: {
    root () {
      return this.mounted ? get(this, '$refs.filter', {}) : {}
    },
    waitIdentifier () {
      return `items for ${this.filter.name} on ${this.$options.name}`
    },
    isReady () {
      return !this.$wait.is(this.waitIdentifier)
    },
    isGlobal () {
      return this.$store.state.search.globalSearch
    },
    filterFromStore () {
      return this.$store.getters['search/getFilter']({ name: this.filter.name })
    },
    selectedValuesFromStore () {
      return get(this, `$store.state.search.values.${this.filter.name}`, [])
    },
    pageItemsPath () {
      return ['aggregations', this.filter.key, 'buckets']
    },
    queryTokens () {
      return [escapeRegExp(this.query.toLowerCase())]
    },
    options () {
      return map(this.itemsWithExcludedValues, item => {
        return {
          item,
          value: item.key,
          label: this.labelToHuman(this.filter.itemLabel(item))
        }
      })
    }
  },
  methods: {
    async bindOnRoot (...args) {
      if (!this.mounted) {
        await this.$nextTick()
      }
      // Bind the function with safety net in case no "root" is mounted yet
      get(this, 'root.$on', noop).call(this, ...args)
    },
    refreshRouteAndSearch () {
      this.refreshRoute()
      this.refreshSearch()
    },
    refreshRoute () {
      const name = 'search'
      const query = this.$store.getters['search/toRouteQuery']()
      this.$router.push({ name, query }).catch(() => {})
    },
    refreshSearch () {
      this.$store.dispatch('search/query')
    },
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
      return this.$store.getters['search/hasFilterValue'](this.filter.itemParam(item))
    },
    removeValue (item) {
      this.$store.commit('search/removeFilterValue', this.filter.itemParam(item))
      this.refreshRouteAndSearch()
    },
    addValue (item) {
      this.$store.commit('search/addFilterValue', this.filter.itemParam(item))
      this.refreshRouteAndSearch()
    },
    setValue (item) {
      this.$store.commit('search/setFilterValue', this.filter.itemParam(item))
      this.refreshRouteAndSearch()
    },
    invert () {
      this.$store.commit('search/toggleFilter', this.filter.name)
      this.refreshRouteAndSearch()
    },
    hasValues () {
      return this.$store.getters['search/hasFilterValues'](this.filter.name)
    },
    isReversed () {
      return this.$store.getters['search/isFilterReversed'](this.filter.name)
    },
    watchedForUpdate () {
      const { search } = this.$store.state
      if (!search.globalSearch) {
        // This will allow to watch change on the search only when
        // the aggregation is not global (ie. relative to the search).
        return pick(search, ['index', 'query', 'values'])
      } else {
        return pick(search, ['index'])
      }
    },
    labelToHuman (label) {
      if (this.$te(label)) {
        return this.$t(label)
      } else if (this.$te('global.' + label)) {
        return this.$t('global.' + label)
      } else if (this.$te('filter.' + label)) {
        return this.$t('filter.' + label)
      } else {
        return this.translationKeyToHuman(label)
      }
    },
    translationKeyToHuman (label = '') {
      return last(String(label).split('.'))
    },
    setSelectedValuesFromStore () {
      this.selected = this.selectedValuesFromStore
      this.isAllSelected = this.selected.length === 0
      this.$emit('selected-values-from-store')
    },
    resetFilterValues (refresh = true) {
      this.$set(this, 'isAllSelected', true)
      this.$set(this, 'selected', [])
      this.$store.commit('search/includeFilter', this.filter.name)
      this.$emit('reset-filter-values', this.filter, refresh)
    },
    changeSelectedValues () {
      this.isAllSelected = this.selected.length === 0
      this.$root.$emit('filter::add-filter-values', this.filter, this.selected)
      this.$store.commit('search/from', 0)
      this.$emit('add-filter-values', this.filter, this.selected)
      this.refreshRouteAndSearch()
    }
  }
}
