import { findIndex, uniqueId, cloneDeep } from 'lodash'

const FiltersMixin = superclass => class extends superclass {
  registerFilter (...args) {
    this.store.commit('search/addFilter', ...args)
  }
  unregisterFilter (name) {
    this.store.commit('search/removeFilter', name)
  }
  registerFilterForProject (project, { type, options = {} } = {}) {
    options = cloneDeep(options)
    options.name = options.name || uniqueId('core:filter-')
    // Watch store mutations
    return this.toggleForProject({
      project,
      // Conditional callbacks
      withFn: () => this.registerFilter({ type, options }),
      withoutFn: () => this.unregisterFilter(options.name)
    })
  }
  unregisterFilterForProject (project, name) {
    const filters = this.store.state.search.filters
    const position = findIndex(filters, ({ options }) => options.name === name)
    const { type, options } = filters[position]
    // Watch store mutations
    return this.toggleForProject({
      project,
      // Conditional callbacks
      withFn: () => this.unregisterFilter(name),
      withoutFn: () => this.registerFilter({ type, options, position })
    })
  }
}

export default FiltersMixin
