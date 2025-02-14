import { findIndex, uniqueId, cloneDeep } from 'lodash'

import { usePipelinesStore } from '@/store/modules/pipelines'

/**
  Mixin class extending the core to add helpers for pipelines.
  @mixin PipelinesMixin
  @typicalname datashare
*/
const PipelinesMixin = (superclass) =>
  class extends superclass {
    get pipelinesStore() {
      return usePipelinesStore()
    }
    /**
     * Register a pipeline
     * @memberof PipelinesMixin.prototype
     * @param {...Mixed} args - Pipeline's options.
     * @param {String} args.name - Name of the pipeline
     * @param {String|Function} args.type - Type of the pipeline.
     * @param {String} category - The pipeline to target
     */
    registerPipeline(...args) {
      this.pipelinesStore.register(...args)
    }
    /**
     * Unregister a pipeline
     * @param {String} name - Name of the pipeline
     * @memberof PipelinesMixin.prototype
     */
    unregisterPipeline(name) {
      this.pipelinesStore.unregister(name)
    }
    /**
     * Register a pipeline for a specific project
     * @memberof PipelinesMixin.prototype
     * @param {String} project - Name of the project
     * @param {...Mixed} args - Pipeline's options.
     * @param {String} args.name - Name of the pipeline
     * @param {String|Function} args.type - Type of the pipeline.
     * @param {String} category - The pipeline to target
     */
    registerPipelineForProject(project, { name, ...options } = {}) {
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
    /**
     * Unregister a pipeline for a specific project
     * @memberof PipelinesMixin.prototype
     * @param {String} project - Name of the project
     * @param {String} name - Name of the pipeline
     */
    unregisterPipelineForProject(project, name) {
      const pipelines = this.pipelinesStore.registered
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
