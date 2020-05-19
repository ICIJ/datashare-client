import noop from 'lodash/noop'

/**
  Mixin class extending the core to add helpers for projects.
  @mixin ProjectsMixin
  @typicalname datashare
*/
const ProjectsMixin = superclass => class extends superclass {
  /**
   * Call a function when a project is selected
   * @param {String} name - Name of the project
   * @param {Function} withFn - Function to call when the project is selected
   * @param {Function} withoutFn - Function to call when the project is unselected
   * @memberof ProjectsMixin.prototype
   */
  toggleForProject ({ project = null, withFn = noop, withoutFn = noop } = {}, ...args) {
    const toggle = name => name === project ? withFn(...args) : withoutFn(...args)
    // Toggle once
    toggle(this.store.state.search.index)
    // Watch store mutations
    return this.store.subscribe(({ type, payload }) => {
      if (type === 'search/index') {
        // The payload contains the name of the selected project
        toggle(payload)
      }
    })
  }
  /**
   * Create a default project on Datashare using the API
   * @memberof ProjectsMixin.prototype
   * @returns {Promise:Object} The HTTP response object
   */
  createDefaultProject () {
    const defaultProject = this.config.get('defaultProject')
    return this.api.createProject(defaultProject)
  }
}

export default ProjectsMixin
