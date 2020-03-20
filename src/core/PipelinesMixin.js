import { findIndex, uniqueId, cloneDeep } from 'lodash'

const PipelinesMixin = superclass => class extends superclass {
  registerPipeline (...args) {
    this.store.commit('pipelines/register', ...args)
  }
  unregisterPipeline (name) {
    this.store.commit('pipelines/unregister', name)
  }
  registerPipelineForProject (project, { name, ...options } = {}) {
    options = cloneDeep(options)
    name = name || uniqueId('core:pipeline-')
    // Watch store mutations
    return this.toggleForProject({
      project,
      // Conditional callbacks
      withFn: () => this.registerPipeline({ name, ...options }),
      withoutFn: () => this.unregisterPipeline(name)
    })
  }
  unregisterPipelineForProject (project, name) {
    const pipelines = this.store.state.pipelines.registered
    const position = findIndex(pipelines, ({ options }) => options.name === name)
    const pipeline = pipelines[position]
    // Watch store mutations
    return this.toggleForProject({
      project,
      // Conditional callbacks
      withFn: () => this.unregisterPipeline(name),
      withoutFn: () => this.registerPipeline({ position, ...pipeline })
    })
  }
}

export default PipelinesMixin
