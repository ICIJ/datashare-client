import { castArray, find, findIndex, get, iteratee, noop, sortBy } from 'lodash'

/**
  Mixin class extending the core to add helpers for projects.
  @mixin ProjectsMixin
  @typicalname datashare
*/
const ProjectsMixin = (superclass) =>
  class extends superclass {
    /**
     * Call a function when a project is selected
     * @param {String} name - Name of the project
     * @param {Function} withFn - Function to call when the project is selected
     * @param {Function} withoutFn - Function to call when the project is unselected
     * @param {String} mutationType - Mutation type that will be watched for changes.
     * @param {String} storePath - Path to the project in the store
     * @memberof ProjectsMixin.prototype
     */
    toggleForProject(
      {
        project = null,
        withFn = noop,
        withoutFn = noop,
        mutationType = 'search/indices',
        storePath = 'search.indices'
      } = {},
      ...args
    ) {
      const toggle = (projects) => {
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
    async createDefaultProject() {
      const name = this.config.get('defaultProject')
      const label = 'Default'
      const description = 'Your main project on Datashare'
      const sourcePath = this.config.get('dataDir')
      const allowFromMask = '*.*.*.*'
      const project = await this.api.createProject({ name, label, description, sourcePath, allowFromMask })
      return this.setProject(project)
    }
    /**
     * Return true if the default project exists
     * @returns {Promise:Boolean}
     */
    async defaultProjectExists() {
      try {
        const name = this.config.get('defaultProject')
        return !!(await this.api.getProject(name))
      } catch (_) {
        return false
      }
    }
    /**
     * Retrieve a project by its name
     * @param {String} name Name of the project to retrieve
     * @returns {Object} The project matching with this name
     */
    findProject(name) {
      return find(this.projects, { name })
    }
    /**
     * Delete a project by it name identifier.
     * @param {String} name Name of the project to retrieve
     * @returns {Integer} Index of the project deleted or -1 if project does not exist
     */
    deleteProject(name) {
      // Create a new projects list so we avoid mutating object
      const projects = [...this.projects]
      const index = findIndex(projects, { name })

      if (index > -1) {
        projects.splice(index, 1)
        this.config.set('projects', projects)
      }

      return index
    }
    /**
     * Update a project in the list or add it if it doesn't exist yet.
     * @param {Object} project
     * @returns {Object} The project
     */
    setProject(project) {
      // Create a new projects list so we avoid mutating object
      const projects = [...this.projects]
      const index = findIndex(projects, { name: project?.name })
      if (index > -1) {
        projects[index] = project
      } else {
        projects.push(project)
      }
      this.config.set('projects', projects)
      return project
    }
    /**
     * List all projects this user has access to.
     * @returns {Array:String}
     */
    get projects() {
      return sortBy(this.config.get('projects', []), iteratee('name'))
    }
    /**
     * List all projects name ids this user has access to.
     * @returns {Array:String}
     */
    get projectIds() {
      return this.projects.map(iteratee('name'))
    }
  }

export default ProjectsMixin
