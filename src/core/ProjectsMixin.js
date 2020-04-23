import noop from 'lodash/noop'

const ProjectsMixin = superclass => class extends superclass {
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
  createDefaultProject () {
    const defaultProject = this.config.get('defaultProject')
    return this.api.createProject(defaultProject)
  }
}

export default ProjectsMixin
