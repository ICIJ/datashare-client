import { get, last } from 'lodash'
import utils from '@/mixins/utils'

export default {
  mixins: [utils],
  methods: {
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
    getFilterByName (name) {
      return this.$store.getters['search/getFilter']({ name })
    },
    getFilterValuesByName (name) {
      return get(this, `$store.state.search.values.${name}`, [])
    },
    setFilterValue (filter, item) {
      this.$store.commit('search/setFilterValue', filter.itemParam(item))
    },
    removeFilterValue ({ name }) {
      this.$store.commit('search/removeFilter', name)
    },
    refreshRouteAndSearch () {
      this.refreshRoute()
      this.refreshSearch()
    },
    refreshRoute () {
      const name = 'search'
      const query = this.$store.getters['search/toRouteQuery']()
      return this.$router.push({ name, query }).catch(() => {})
    },
    refreshSearch () {
      return this.$store.dispatch('search/query')
    }
  }
}
