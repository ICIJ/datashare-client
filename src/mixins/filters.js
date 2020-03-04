import camelCase from 'lodash/camelCase'
import escapeRegExp from 'lodash/escapeRegExp'
import flatten from 'lodash/flatten'
import get from 'lodash/get'
import last from 'lodash/last'
import map from 'lodash/map'
import pick from 'lodash/pick'
import reduce from 'lodash/reduce'

import settings from '@/utils/settings'
import utils from '@/mixins/utils'

export default {
  mixins: [utils],
  props: {
    filter: Object,
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
    asyncItems: {
      type: Array,
      default: null
    },
    asyncTotal: 0,
    asyncTotalCount: 0
  },
  data () {
    return {
      offset: 0,
      pageSize: settings.filterSize,
      total: 0,
      totalCount: 0,
      selected: [],
      isAllSelected: true
    }
  },
  mounted () {
    this.selectedValuesFromStore()
    if (this.root.$on) {
      this.root.$on('add-filter-values', value => this.$emit('add-filter-values', value))
    }
    this.$root.$on('filter::search::update', filterName => {
      if (this.filter && this.filter.name === filterName) {
        this.selectedValuesFromStore()
      }
    })
  },
  computed: {
    root () {
      return get(this, '$refs.filter', {})
    },
    isReady () {
      return !this.$wait.is(`items for ${this.filter.name}`)
    },
    isGlobal () {
      return this.$store.state.search.globalSearch
    },
    filterFilter () {
      return this.$store.getters['search/findFilter']({ name: this.filter.name })
    },
    size () {
      return this.offset + this.pageSize
    },
    resultPath () {
      return ['aggregations', this.filter.key, 'buckets']
    },
    queryTokens () {
      return [escapeRegExp(this.filterQuery.toLowerCase())]
    },
    options () {
      return map(this.items, item => {
        return {
          item,
          value: item.key,
          label: this.labelToHuman(this.filter.itemLabel(item))
        }
      })
    }
  },
  methods: {
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
    toggleValue (item) {
      this.hasValue(item) ? this.removeValue(item) : this.addValue(item)
      this.isAllSelected = !this.$store.getters['search/hasFilterValues'](this.filter.name)
      this.$emit('add-filter-values', this.filter, this.selected.selected)
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
    watchedForUpdate (state) {
      if (!state.search.globalSearch) {
        // This will allow to watch change on the search only when
        // the aggregation is not global (ie. relative to the search).
        return pick(state.search, ['index', 'query', 'values'])
      } else {
        return pick(state.search, ['index'])
      }
    },
    labelToHuman (label) {
      if (this.$te(label)) {
        return this.$t(label)
      } else if (this.$te(`filter.${label}`)) {
        return this.$t(`filter.${label}`)
      } else {
        return this.translationKeyToHuman(label)
      }
    },
    translationKeyToHuman (label = '') {
      return last(String(label).split('.'))
    },
    selectedValuesFromStore () {
      if (this.filter) {
        this.$set(this, 'selected', this.$store.state.search.values[this.filter.name] || [])
        this.isAllSelected = this.selected.length === 0
        this.$emit('selected-values-from-store')
      }
    },
    resetFilterValues () {
      this.$set(this, 'isAllSelected', true)
      this.$set(this, 'selected', [])
      this.$store.commit('search/includeFilter', this.filter.name)
      this.$emit('reset-filter-values', this.filter)
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
