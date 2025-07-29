import cloneDeep from 'lodash/cloneDeep'
import findIndex from 'lodash/findIndex'
import uniqueId from 'lodash/uniqueId'

import { useSearchStore } from '@/store/modules'

/**
  Mixin class extending the core to add helpers for filters.
  @mixin FiltersMixin
  @typicalname datashare
*/
const FiltersMixin = superclass =>
  class extends superclass {
    /**
     * Get the search store
     * @memberof FiltersMixin.prototype
     * @type {Object}
     */
    get searchStore() {
      return useSearchStore()
    }

    /**
     * Register a filter
     * @memberof FiltersMixin.prototype
     * @param {...Mixed} args - Filter's params.
     * @param {String} args.type - Type of the filter.
     * @param {Object} args.options - Options to pass to the filter constructor.
     * @param {String} args.options.name - Name of the filter.
     * @param {String} args.options.key - Key of the filter. Typically ElasticSearch field name.
     * @param {String} [args.options.icon=null] - Icon of the filter.
     * @param {Boolean} [args.options.hideSearch=false] - Set if this filter should be searchable or not.
     * @param {function} [args.options.alternativeSearch=()=>{})] - Set a function about how to transform query term before searching for it.
     * @param {Number} [args.options.order=null] - Order of the filter. Will be added as last filter by default.
     */
    registerFilter(...args) {
      this.searchStore.addFilter(...args)
    }

    /**
     * Unregister a filter
     * @memberof FiltersMixin.prototype
     * @param {String} name - Name of the filter to unregister
     */
    unregisterFilter(name) {
      this.searchStore.removeFilter(name)
    }

    /**
     * Register a filter only for a specific project
     * @memberof FiltersMixin.prototype
     * @param {String} name - Name of the project
     * @param {...Mixed} args - Filter's options.
     * @param {String} args.name - Name of the filter
     * @param {String} args.type - Type of the filter.
     * @param {Object} args.options - Options to pass to the filter constructor
     */
    registerFilterForProject(project, { type, options = {} } = {}) {
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
    unregisterFilterForProject(project, name) {
      const filters = this.searchStore.filters
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
