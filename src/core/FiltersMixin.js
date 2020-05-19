import cloneDeep from 'lodash/cloneDeep'
import findIndex from 'lodash/findIndex'
import uniqueId from 'lodash/uniqueId'

/**
  Mixin class extending the core to add helpers for filters.
  @mixin FiltersMixin
  @typicalname datashare
*/
const FiltersMixin = superclass => class extends superclass {
  /**
   * Register a filter
   * @memberof FiltersMixin.prototype
   * @param {...Mixed} args - Filter's options.
   * @param {String} args.name - Name of the filter
   * @param {String} args.type - Type of the filter.
   * @param {Object} args.options - Options to pass to the filter contructor
   */
  registerFilter (...args) {
    this.store.commit('search/addFilter', ...args)
  }
  /**
   * Unregister a filter
   * @memberof FiltersMixin.prototype
   * @param {String} name - Name of the filter to unregister
   */
  unregisterFilter (name) {
    this.store.commit('search/removeFilter', name)
  }
  /**
   * Register a filter only for a specific project
   * @memberof FiltersMixin.prototype
   * @param {String} name - Name of the project
   * @param {...Mixed} args - Filter's options.
   * @param {String} args.name - Name of the filter
   * @param {String} args.type - Type of the filter.
   * @param {Object} args.options - Options to pass to the filter contructor
   */
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
  /**
   * Unregister a filter only for a specific project
   * @memberof FiltersMixin.prototype
   * @param {String} name - Name of the project
   * @param {String} name - Name of the filter
   */
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
