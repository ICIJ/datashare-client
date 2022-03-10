import { castArray, compact, get, noop, uniq } from 'lodash'

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
   * @param {String} mutationType - Mutation type that will be watched for changes.
   * @param {String} storePath - Path to the project in the store
   * @memberof ProjectsMixin.prototype
   */
  toggleForProject ({ project = null, withFn = noop, withoutFn = noop, mutationType = 'search/indices', storePath = 'search.indices' } = {}, ...args) {
    const toggle = projects => {
      if (castArray(projects).includes(project)) {
        return withFn(...args)
      }
      return withoutFn(...args)
    }
    // Toggle once
    toggle(get(this.store.state, storePath))
    // Watch store mutations
    return this.store.subscribe(({ type, payload }) => {
      if (type === mutationType) {
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
  /**
   * List all projects this user has access to.
   * @returns {Array:String}
   */
  get projects () {
    const projects = this.config.get('groups_by_applications.datashare', [])
    // In local mode, we ensure the "defaultProject" is included. In server mode,
    // the list of projects defines what the user can see.
    if (this.config.get('mode') === 'LOCAL') {
      const defaultProject = this.config.get('defaultProject')
      return compact(uniq([...projects, defaultProject]).sort())
    }
    return [...projects].sort()
  }
}

export default ProjectsMixin
