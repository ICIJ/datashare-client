import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import { cloneDeep, compact, concat, filter, find, findIndex, isFunction, orderBy, uniqueId } from 'lodash'

import pipelines from '@/store/pipelines'
import * as pipelineTypes from '@/store/pipelines'

export const usePipelinesStore = defineStore('pipelines', () => {
  // A list of registered pipeline
  const registered = reactive(cloneDeep({ pipelines }).pipelines)

  /**
   * Register a pipeline
   *
   * @param {Object} options
   * @param {String} options.name
   * @param {String} options.category
   * @param {Function} options.type
   * @param {Number} options.order
   * @param {Boolean} options.enabled
   * @returns {void}
   */
  const register = ({ name, ...options }) => {
    name = name || uniqueId('pipeline-')
    const index = name ? findIndex(registered, { name }) : -1
    if (index === -1) {
      registered.push({ name, ...options })
    }
  }

  /**
   * Unregister a pipeline
   *
   * @param {String} name
   * @returns {void}
   */
  const unregister = (name) => {
    const index = findIndex(registered, { name })
    if (index > -1) {
      registered.splice(index, 1)
    }
  }

  const instantiatedPipelines = computed(() => {
    return orderBy(
      registered.map(
        (pipeline) => {
          return instantiatePipeline(pipeline)
        },
        'order',
        'asc'
      )
    )
  })

  /**
   * Instantiate a pipeline
   * @param {Object} options
   * @param {String} options.type
   * @returns {Object}
   **/
  const instantiatePipeline = ({ type = 'IdentityPipeline', ...options } = {}) => {
    // The given type is a class with a `apply` method
    if (type?.prototype?.apply) {
      // eslint-disable-next-line new-cap
      return new type(options)
      // The given type is function
    } else if (isFunction(type)) {
      return new pipelineTypes.SimplePipeline({ apply: type, ...options })
    }
    const Type = pipelineTypes[type] || pipelineTypes.IdentityPipeline
    // Return the instance
    return new Type(options)
  }

  /**
   * Get a pipeline by name
   * @param {String} name The name of the pipeline
   * @returns {Object}
   */
  const getPipelineByName = (name) => find(registered, { name })

  /**
   * Get a list of pipelines by category
   * @param {String} category The category of the pipeline
   * @returns {Array}
   */
  const getPipelinesByCategory = (category = null) => orderBy(filter(registered, { category }), 'order', 'asc')

  /**
   * Get a list of instantiated pipelines by category
   * @param {String} category The category of the pipeline
   * @returns {Array}
   */
  const getInstantiatedPipelinesByCategory = (category = null) =>
    getPipelinesByCategory(category).map(instantiatePipeline)

  /**
   * Get an instantiated pipeline by name
   * @param {String} name The name of the pipeline
   * @returns {Object}
   */
  const getInstantiatedPipeline = (name) => {
    const pipeline = getPipelineByName(name)
    return pipeline ? instantiatePipeline(pipeline) : null
  }

  /**
   * Get a list of instantiated pipelines by category
   * @param {String} category The category of the pipeline
   * @returns {Array}
   */
  const getPipelineChainByCategory = (category = null) => {
    const pipelines = getInstantiatedPipelinesByCategory(category)
    return pipelines.map((p) => p.apply.bind(p))
  }

  /**
   * Get a list of instantiated pipelines by category
   * @param {String} category The category of the pipeline
   * @param {Array} contextualPipelines An array of pipelines to be applied
   */
  const getFullPipelineChainByCategory = (category = null, ...contextualPipelines) => {
    const prePipelines = getPipelineChainByCategory(`${category}:pre`)
    const mainPipelines = getPipelineChainByCategory(category)
    const postPipelines = getPipelineChainByCategory(`${category}:post`)
    return concat(prePipelines, mainPipelines, compact(contextualPipelines), postPipelines)
  }

  /**
   * Apply a list of instantiated pipelines by category
   * @param {String} category The category of the pipeline
   * @param {Array} mainPipelines An array of pipelines to be applied
   * @returns {Function}
   */
  const applyPipelineChainByCategory = (category = null, ...mainPipelines) => {
    const allPipelines = getFullPipelineChainByCategory(category, ...mainPipelines)
    // Return a closure function that must be invoked with the value
    // that is transformed by the pipeline
    return async (value = null, ...params) => {
      return allPipelines.reduce(async (intermediateValue, fn) => {
        return fn(await intermediateValue, ...params)
      }, value)
    }
  }

  return {
    registered,
    register,
    unregister,
    instantiatePipeline,
    instantiatedPipelines,
    getPipelineByName,
    getPipelinesByCategory,
    getInstantiatedPipeline,
    getInstantiatedPipelinesByCategory,
    getPipelineChainByCategory,
    getFullPipelineChainByCategory,
    applyPipelineChainByCategory
  }
})
