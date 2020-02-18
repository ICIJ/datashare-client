import { noop } from 'lodash'

const ProjectsMixin = superclass => class extends superclass {
  toggleForProject ({ project = null, withFn = noop, withoutFn = noop } = {}, ...args) {
    // Watch store mutations
    return this.store.subscribe(({ type, payload }) => {
      if (type === 'search/index') {
        // The payload contains the name of the selected project
        if (payload === project) {
          return withFn(...args)
        } else {
          return withoutFn(...args)
        }
      }
    })
  }
  async createDefaultProject () {
    const defaultProject = this.config.get('defaultProject')
    return this.api.createIndex(defaultProject)
  }
}

export default ProjectsMixin
